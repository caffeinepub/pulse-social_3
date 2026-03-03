import { EditProfileModal } from "@/components/social/EditProfileModal";
import { PostCard } from "@/components/social/PostCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSocial } from "@/store/socialStore";
import { format } from "date-fns";
import { Calendar, Edit2, UserCheck, UserPlus } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

interface ProfilePageProps {
  principalId: string;
  currentPrincipalId: string | null;
  isAdmin: boolean;
}

export function ProfilePage({
  principalId,
  currentPrincipalId,
  isAdmin,
}: ProfilePageProps) {
  const {
    getProfile,
    getAllPosts,
    followUser,
    unfollowUser,
    isFollowing,
    getFollowers,
    getFollowing,
  } = useSocial();

  const [showEditModal, setShowEditModal] = useState(false);

  const profile = getProfile(principalId);
  const isOwnProfile = currentPrincipalId === principalId;
  const following =
    currentPrincipalId && !isOwnProfile
      ? isFollowing(currentPrincipalId, principalId)
      : false;

  const followers = getFollowers(principalId);
  const followingList = getFollowing(principalId);

  const userPosts = getAllPosts().filter(
    (p) => p.authorPrincipalId === principalId && !p.isDeleted,
  );

  const handleFollowToggle = () => {
    if (!currentPrincipalId) {
      toast.error("Sign in to follow people");
      return;
    }
    if (following) {
      unfollowUser(currentPrincipalId, principalId);
      toast.success("Unfollowed");
    } else {
      followUser(currentPrincipalId, principalId);
      toast.success("Now following!");
    }
  };

  if (!profile) {
    return (
      <main className="feed-width px-4 py-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🔍</span>
        </div>
        <h2 className="font-display text-xl font-bold mb-2">User not found</h2>
        <p className="text-muted-foreground text-sm">
          This profile doesn't exist or hasn't been set up yet.
        </p>
      </main>
    );
  }

  return (
    <>
      {isOwnProfile && showEditModal && (
        <EditProfileModal
          open={showEditModal}
          onOpenChange={setShowEditModal}
          profile={profile}
        />
      )}

      <main className="feed-width px-4 py-6 pb-24 sm:pb-6">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-card rounded-2xl border border-border overflow-hidden mb-6"
        >
          {/* Banner */}
          <div className="h-28 pulse-gradient relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
          </div>

          {/* Avatar + Actions */}
          <div className="px-5 pb-5">
            <div className="flex items-end justify-between -mt-10 mb-4">
              <Avatar className="h-20 w-20 ring-4 ring-card shadow-card">
                <AvatarImage
                  src={profile.avatarUrl}
                  alt={profile.displayName}
                />
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-2xl">
                  {profile.displayName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex gap-2 mb-1">
                {isOwnProfile ? (
                  <Button
                    variant="outline"
                    size="sm"
                    data-ocid="profile.edit_button"
                    onClick={() => setShowEditModal(true)}
                    className="rounded-xl"
                  >
                    <Edit2 className="h-4 w-4 mr-1.5" />
                    Edit Profile
                  </Button>
                ) : currentPrincipalId ? (
                  <Button
                    size="sm"
                    data-ocid={
                      following
                        ? "profile.unfollow_button"
                        : "profile.follow_button"
                    }
                    variant={following ? "secondary" : "default"}
                    onClick={handleFollowToggle}
                    className={`rounded-xl ${following ? "" : "pulse-gradient text-white border-0"}`}
                  >
                    {following ? (
                      <>
                        <UserCheck className="h-4 w-4 mr-1.5" />
                        Following
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-1.5" />
                        Follow
                      </>
                    )}
                  </Button>
                ) : null}
              </div>
            </div>

            {/* Name & Bio */}
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-display text-xl font-bold">
                  {profile.displayName}
                </h1>
                {profile.isSuspended && (
                  <Badge variant="destructive" className="text-xs">
                    Suspended
                  </Badge>
                )}
              </div>
              {profile.bio && (
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  {profile.bio}
                </p>
              )}

              {/* Stats */}
              <div className="flex items-center gap-5 mt-4">
                <div className="text-center">
                  <p className="font-bold text-lg leading-none">
                    {userPosts.length}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">Posts</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-lg leading-none">
                    {followers.length}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Followers
                  </p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-lg leading-none">
                    {followingList.length}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Following
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="posts">
          <TabsList className="w-full rounded-xl bg-muted p-1 mb-4">
            <TabsTrigger
              value="posts"
              data-ocid="profile.posts_tab"
              className="flex-1 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm"
            >
              Posts ({userPosts.length})
            </TabsTrigger>
            <TabsTrigger
              value="about"
              data-ocid="profile.about_tab"
              className="flex-1 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm"
            >
              About
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-0 space-y-4">
            {userPosts.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl">📝</span>
                </div>
                <p className="text-muted-foreground text-sm">No posts yet</p>
              </div>
            ) : (
              userPosts.map((post, idx) => (
                <PostCard
                  key={post.postId}
                  post={post}
                  currentPrincipalId={currentPrincipalId}
                  isAdmin={isAdmin}
                  index={idx}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="about" className="mt-0">
            <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">
                  Bio
                </p>
                <p className="text-sm text-foreground">
                  {profile.bio || "No bio yet."}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">
                  Member since
                </p>
                <p className="text-sm text-foreground flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  {format(new Date(profile.createdAt), "MMMM yyyy")}
                </p>
              </div>
              {isAdmin && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">
                    Principal ID
                  </p>
                  <p className="text-xs font-mono text-muted-foreground break-all">
                    {profile.principalId}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}
