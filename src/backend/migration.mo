import Map "mo:core/Map";
import Int "mo:core/Int";
import Principal "mo:core/Principal";
import Stripe "stripe/stripe";

module {
  type UserProfile = {
    name : Text;
  };

  type OldActor = {
    razorpayKeyId : ?Text;
    stripeConfig : ?Stripe.StripeConfiguration;
    darkModePreferences : Map.Map<Principal, Bool>;
    loginRecords : Map.Map<Principal, Int>;
    userProfiles : Map.Map<Principal, UserProfile>;
  };

  type NewActor = {
    razorpayKeyId : ?Text;
    stripeConfig : ?Stripe.StripeConfiguration;
    darkModePreferences : Map.Map<Principal, Bool>;
    loginRecords : Map.Map<Principal, Int>;
    userProfiles : Map.Map<Principal, UserProfile>;
    lastSeenRecords : Map.Map<Principal, Int>;
    visitCounts : Map.Map<Principal, Int>;
  };

  public func run(old : OldActor) : NewActor {
    {
      old with
      lastSeenRecords = Map.empty<Principal, Int>();
      visitCounts = Map.empty<Principal, Int>();
    };
  };
};
