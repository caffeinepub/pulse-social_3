import Map "mo:core/Map";
import Principal "mo:core/Principal";

module {
  // Old actor type (without loginRecords, razorpayKeyId, and userProfiles)
  type OldActor = {
    darkModePreferences : Map.Map<Principal, Bool>;
  };

  // New actor type (with loginRecords, razorpayKeyId, and userProfiles)
  type NewActor = {
    darkModePreferences : Map.Map<Principal, Bool>;
    loginRecords : Map.Map<Principal, Int>;
  };

  // Migration function (adds the new loginRecords field)
  public func run(old : OldActor) : NewActor {
    {
      old with
      loginRecords = Map.empty<Principal, Int>()
    };
  };
};
