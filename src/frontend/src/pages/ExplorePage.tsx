import { PostCard } from "@/components/social/PostCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSocial } from "@/store/socialStore";
import { useNavigate } from "@tanstack/react-router";
import { UserCheck, UserPlus, Users } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

interface ExplorePageProps {
  currentPrincipalId: string | null;
  isAdmin: boolean;
}

export function ExplorePage({ currentPrincipalId, isAdmin }: ExplorePageProps) {
  const navigate = useNavigate();
  const {
    getAllPosts,
    profiles,
    followUser,
    unfollowUser,
    isFollowing,
    getFollowers,
  } = useSocial();
  const [isLoading] = useState(false);

  const allPosts = getAllPosts().filter((p) => !p.isDeleted);

  // Get all users except current
  const allUsers = Array.from(profiles.values()).filter(
    (p) => p.principalId !== currentPrincipalId && !p.isSuspended,
  );

  const handleFollow = (targetPrincipalId: string) => {
    if (!currentPrincipalId) {
      toast.error("Sign in to follow people");
      return;
    }
    if (isFollowing(currentPrincipalId, targetPrincipalId)) {
      unfollowUser(currentPrincipalId, targetPrincipalId);
      toast.success("Unfollowed");
    } else {
      followUser(currentPrincipalId, targetPrincipalId);
      toast.success("Following!");
    }
  };

  return (
    <main className="max-w-5xl mx-auto px-4 py-6 pb-24 sm:pb-6">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold">Explore</h1>
        <p className="text-sm text-muted-foreground">
          Discover new people and posts
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Posts Column */}
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-base mb-4 text-muted-foreground uppercase tracking-wide text-xs">
            Recent Posts
          </h2>

          {isLoading ? (
            <div className="space-y-4" data-ocid="explore.post_list">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-card rounded-2xl p-4 space-y-3 border border-border"
                >
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ))}
            </div>
          ) : (
            <div data-ocid="explore.post_list" className="space-y-4">
              {allPosts.map((post, idx) => (
                <PostCard
                  key={post.postId}
                  post={post}
                  currentPrincipalId={currentPrincipalId}
                  isAdmin={isAdmin}
                  index={idx}
                />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar - People to follow */}
        <aside className="lg:w-72 shrink-0">
          <h2 className="font-semibold text-base mb-4 text-muted-foreground uppercase tracking-wide text-xs">
            People You Might Follow
          </h2>
          <div data-ocid="explore.user_list" className="space-y-3">
            {allUsers.length === 0 ? (
              <div className="bg-card rounded-2xl p-6 text-center border border-border">
                <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No other users yet
                </p>
              </div>
            ) : (
              allUsers.map((user, idx) => {
                const following = currentPrincipalId
                  ? isFollowing(currentPrincipalId, user.principalId)
                  : false;
                const followerCount = getFollowers(user.principalId).length;

                return (
                  <motion.div
                    key={user.principalId}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-card rounded-2xl p-4 border border-border flex items-start gap-3"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        navigate({
                          to: "/profile/$principalId",
                          params: { principalId: user.principalId },
                        })
                      }
                      className="shrink-0"
                    >
                      <Avatar className="h-11 w-11 ring-2 ring-primary/10">
                        <AvatarImage
                          src={user.avatarUrl}
                          alt={user.displayName}
                        />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                          {user.displayName.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </button>

                    <div className="flex-1 min-w-0">
                      <button
                        type="button"
                        onClick={() =>
                          navigate({
                            to: "/profile/$principalId",
                            params: { principalId: user.principalId },
                          })
                        }
                        className="font-semibold text-sm hover:text-primary transition-colors block truncate text-left"
                      >
                        {user.displayName}
                      </button>
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                        {user.bio || "Pulse member"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {followerCount} follower{followerCount !== 1 ? "s" : ""}
                      </p>
                    </div>

                    {currentPrincipalId && (
                      <Button
                        size="sm"
                        variant={following ? "secondary" : "default"}
                        onClick={() => handleFollow(user.principalId)}
                        className={`shrink-0 rounded-xl h-8 text-xs font-medium ${
                          following ? "" : "pulse-gradient text-white border-0"
                        }`}
                      >
                        {following ? (
                          <>
                            <UserCheck className="h-3 w-3 mr-1" />
                            Following
                          </>
                        ) : (
                          <>
                            <UserPlus className="h-3 w-3 mr-1" />
                            Follow
                          </>
                        )}
                      </Button>
                    )}
                  </motion.div>
                );
              })
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}
