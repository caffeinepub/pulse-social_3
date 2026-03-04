import { CreatePostModal } from "@/components/social/CreatePostModal";
import { PostCard } from "@/components/social/PostCard";
import { ProfileSetupModal } from "@/components/social/ProfileSetupModal";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useSocial } from "@/store/socialStore";
import { Link } from "@tanstack/react-router";
import { Compass, Plus, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

interface FeedPageProps {
  currentPrincipalId: string | null;
  isAdmin: boolean;
}

export function FeedPage({ currentPrincipalId, isAdmin }: FeedPageProps) {
  const { login, isLoggingIn, isInitializing } = useInternetIdentity();
  const { getProfile, getFeed } = useSocial();
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [isLoading] = useState(false);

  const profile = currentPrincipalId
    ? getProfile(currentPrincipalId)
    : undefined;
  const hasProfile = !!profile;
  const needsProfileSetup = !!currentPrincipalId && !hasProfile;

  const feed =
    currentPrincipalId && hasProfile ? getFeed(currentPrincipalId) : [];

  if (isInitializing) {
    return (
      <main className="feed-width px-4 py-6">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-card rounded-2xl p-4 space-y-3 border border-border"
              data-ocid="feed.loading_state"
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
              <Skeleton className="h-40 w-full rounded-xl" />
            </div>
          ))}
        </div>
      </main>
    );
  }

  // Not authenticated
  if (!currentPrincipalId) {
    return (
      <main className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md"
        >
          <div className="w-20 h-20 rounded-3xl pulse-gradient flex items-center justify-center mx-auto mb-6 shadow-glow animate-pulse-ring">
            <Zap className="h-10 w-10 text-white fill-white" />
          </div>
          <h1 className="font-display text-4xl font-bold mb-3 leading-tight">
            Share your <span className="pulse-gradient-text">world</span>
          </h1>
          <p className="text-muted-foreground text-lg mb-2 leading-relaxed">
            Connect with friends, share moments, and discover amazing content
            from people you care about.
          </p>
          <p className="text-sm font-semibold pulse-gradient-text mb-8">
            Sign up with email or mobile — first week free for new users!
          </p>
          <Button
            onClick={login}
            disabled={isLoggingIn}
            size="lg"
            className="rounded-2xl pulse-gradient text-white border-0 shadow-glow text-base px-8 h-12 font-semibold"
          >
            {isLoggingIn ? "Signing in..." : "Sign Up Free"}
          </Button>
          <p className="text-xs text-muted-foreground mt-4">
            No credit card required · Cancel anytime
          </p>
        </motion.div>
      </main>
    );
  }

  return (
    <>
      {needsProfileSetup && (
        <ProfileSetupModal
          open={true}
          principalId={currentPrincipalId}
          onComplete={() => {}}
        />
      )}

      {hasProfile && (
        <CreatePostModal
          open={showCreatePost}
          onOpenChange={setShowCreatePost}
          currentPrincipalId={currentPrincipalId}
        />
      )}

      <main className="feed-width px-4 py-6 pb-24 sm:pb-6">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold">Your Feed</h1>
            <p className="text-sm text-muted-foreground">
              Posts from people you follow
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4" data-ocid="feed.loading_state">
            {[1, 2].map((i) => (
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
        ) : feed.length === 0 ? (
          <div
            data-ocid="feed.empty_state"
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Compass className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Your feed is empty</h3>
            <p className="text-muted-foreground text-sm max-w-xs mb-6">
              Follow some people on Explore to see their posts here, or share
              your own!
            </p>
            <Link to="/explore">
              <Button variant="outline" size="sm" className="rounded-xl">
                <Compass className="h-4 w-4 mr-2" />
                Explore people
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {feed.map((post, idx) => (
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
      </main>

      {/* Floating Create Post Button */}
      {hasProfile && (
        <motion.button
          type="button"
          data-ocid="feed.create_post_button"
          onClick={() => setShowCreatePost(true)}
          className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 h-14 w-14 rounded-2xl pulse-gradient text-white shadow-glow flex items-center justify-center z-30"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Plus className="h-6 w-6" />
        </motion.button>
      )}
    </>
  );
}
