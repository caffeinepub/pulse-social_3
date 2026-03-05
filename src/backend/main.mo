import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Iter "mo:core/Iter";
import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Stripe "stripe/stripe";
import OutCall "http-outcalls/outcall";
import Runtime "mo:core/Runtime";
import Migration "migration";

(with migration = Migration.run)
actor {
  include MixinStorage();
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  var razorpayKeyId : ?Text = null;

  // Stripe configuration (optional)
  var stripeConfig : ?Stripe.StripeConfiguration = null;

  // Dark mode preferences storage
  let darkModePreferences = Map.empty<Principal, Bool>();

  // Free trial tracking (first login timestamp in nanoseconds)
  let loginRecords = Map.empty<Principal, Int>();

  // In-memory maps for activity tracking
  let lastSeenRecords = Map.empty<Principal, Int>();
  let visitCounts = Map.empty<Principal, Int>();

  // User profiles storage
  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  // ActivityRecord type for external visibility
  public type ActivityRecord = {
    principalId : Text;
    lastSeen : Int;
    visitCount : Int;
  };

  func adminOnly(caller : Principal) {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
  };

  // ---------------- User Profile Management ---------------

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

  // ---------------- Stripe integration ---------------

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

  public query ({ caller }) func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  func getStripeConfiguration() : Stripe.StripeConfiguration {
    switch (stripeConfig) {
      case (null) { Runtime.trap("Stripe not configured yet") };
      case (?config) { config };
    };
  };

  public shared ({ caller }) func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check session status");
    };
    switch (stripeConfig) {
      case (null) {
        Runtime.trap("Not configured yet");
      };
      case (?config) {
        await Stripe.getSessionStatus(config, sessionId, transform);
      };
    };
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create checkout sessions");
    };
    await Stripe.createCheckoutSession(getStripeConfiguration(), caller, items, successUrl, cancelUrl, transform);
  };

  // ---------- Dark Mode Preferences ----------

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

  // --------- Free Trial Tracking ------------

  // Record the first login timestamp for the caller (in nanoseconds)
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

  // --------- Activity Tracking ------------

  // Record visit timestamp and increment visit count
  public shared ({ caller }) func recordVisit() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can record visits");
    };

    let currentTime = Time.now();

    // Update last seen timestamp
    lastSeenRecords.add(caller, currentTime);

    // Increment visit count
    let currentCount = switch (visitCounts.get(caller)) {
      case (null) { 0 };
      case (?count) { count };
    };
    visitCounts.add(caller, currentCount + 1);
  };

  // Get all activity data (admin-only)
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
};
