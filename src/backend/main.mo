import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Int "mo:core/Int";
import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Stripe "stripe/stripe";
import OutCall "http-outcalls/outcall";
import Runtime "mo:core/Runtime";

actor {
  include MixinStorage();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    name : Text;
  };

  public type ActivityRecord = {
    principalId : Text;
    lastSeen : Int;
    visitCount : Int;
  };

  var razorpayKeyId : ?Text = null;
  var stripeConfig : ?Stripe.StripeConfiguration = null;
  let darkModePreferences = Map.empty<Principal, Bool>();
  let loginRecords = Map.empty<Principal, Int>();
  let lastSeenRecords = Map.empty<Principal, Int>();
  let visitCounts = Map.empty<Principal, Int>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  func adminOnly(caller : Principal) {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
  };

  public query ({ caller }) func getRazorpayKeyId() : async ?Text {
    razorpayKeyId;
  };

  public shared ({ caller }) func setRazorpayKeyId(keyId : Text) : async () {
    adminOnly(caller);
    razorpayKeyId := ?keyId;
  };

  public query ({ caller }) func isStripeConfigured() : async Bool {
    stripeConfig != null;
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    adminOnly(caller);
    stripeConfig := ?config;
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create checkout sessions");
    };
    switch (stripeConfig) {
      case (null) { Runtime.trap("Stripe configuration is missing") };
      case (?config) {
        await Stripe.createCheckoutSession(config, caller, items, successUrl, cancelUrl, transform);
      };
    };
  };

  public shared ({ caller }) func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check session status");
    };
    switch (stripeConfig) {
      case (null) { Runtime.trap("Stripe configuration is missing") };
      case (?config) {
        await Stripe.getSessionStatus(config, sessionId, transform);
      };
    };
  };

  public query ({ caller }) func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public shared ({ caller }) func setDarkModePreference(isDark : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can set preferences");
    };
    darkModePreferences.add(caller, isDark);
  };

  public query ({ caller }) func getDarkModePreference() : async ?Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get preferences");
    };
    darkModePreferences.get(caller);
  };

  public shared ({ caller }) func recordFirstLogin() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can record logins");
    };

    if (loginRecords.get(caller) != null) {
      return;
    };

    let currentTime = Time.now();
    loginRecords.add(caller, currentTime);
  };

  public query ({ caller }) func getFirstLoginTime() : async ?Int {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get login times");
    };
    loginRecords.get(caller);
  };

  public shared ({ caller }) func recordVisit() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can record visits");
    };

    let currentTime = Time.now();

    lastSeenRecords.add(caller, currentTime);

    let currentCount = switch (visitCounts.get(caller)) {
      case (null) { 0 };
      case (?count) { count };
    };
    visitCounts.add(caller, currentCount + 1);
  };

  public query ({ caller }) func getActivityData() : async [ActivityRecord] {
    adminOnly(caller);

    let activityIter = lastSeenRecords.entries().map(
      func((principal, lastSeen)) {
        let visitCount = switch (visitCounts.get(principal)) {
          case (null) { 0 };
          case (?count) { count };
        };

        {
          principalId = principal.toText();
          lastSeen;
          visitCount;
        };
      }
    );

    activityIter.toArray();
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };
};
