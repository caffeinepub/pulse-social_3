import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSocial } from "@/store/socialStore";
import type { Post } from "@/store/socialStore";
import { useNavigate } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import { Heart, MessageCircle, Send, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";

interface PostCardProps {
  post: Post;
  currentPrincipalId: string | null;
  isAdmin?: boolean;
  index: number;
}

export function PostCard({
  post,
  currentPrincipalId,
  isAdmin,
  index,
}: PostCardProps) {
  const navigate = useNavigate();
  const {
    getProfile,
    toggleLike,
    hasLiked,
    getLikeCount,
    getComments,
    addComment,
    deletePost,
  } = useSocial();

  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const commentInputRef = useRef<HTMLInputElement>(null);

  const author = getProfile(post.authorPrincipalId);
  const comments = getComments(post.postId);
  const likeCount = getLikeCount(post.postId);
  const isLiked = currentPrincipalId
    ? hasLiked(currentPrincipalId, post.postId)
    : false;
  const canDelete = currentPrincipalId
    ? currentPrincipalId === post.authorPrincipalId || isAdmin === true
    : false;

  const ocidIdx = index + 1;

  const handleLike = () => {
    if (!currentPrincipalId) {
      toast.error("Sign in to like posts");
      return;
    }
    toggleLike(currentPrincipalId, post.postId);
  };

  const handleCommentToggle = () => {
    setShowComments((prev) => !prev);
    if (!showComments) {
      setTimeout(() => commentInputRef.current?.focus(), 100);
    }
  };

  const handleAddComment = () => {
    if (!currentPrincipalId) {
      toast.error("Sign in to comment");
      return;
    }
    const trimmed = commentText.trim();
    if (!trimmed) return;
    addComment(post.postId, currentPrincipalId, trimmed);
    setCommentText("");
    toast.success("Comment added");
  };

  const handleDelete = () => {
    deletePost(post.postId);
    toast.success("Post deleted");
  };

  const avatarFallback = author?.displayName?.slice(0, 2).toUpperCase() ?? "??";

  return (
    <motion.article
      data-ocid={`post.item.${ocidIdx}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="bg-card rounded-2xl shadow-card overflow-hidden border border-border"
    >
      {/* Post Header */}
      <div className="p-4 pb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() =>
              navigate({ to: `/profile/${post.authorPrincipalId}` })
            }
            className="shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Avatar className="h-10 w-10 ring-2 ring-primary/10">
              <AvatarImage src={author?.avatarUrl} alt={author?.displayName} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                {avatarFallback}
              </AvatarFallback>
            </Avatar>
          </button>
          <div className="min-w-0">
            <button
              type="button"
              onClick={() =>
                navigate({ to: `/profile/${post.authorPrincipalId}` })
              }
              className="font-semibold text-foreground hover:text-primary transition-colors text-sm truncate block max-w-[180px]"
            >
              {author?.displayName ?? "Unknown User"}
            </button>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(post.createdAt), {
                addSuffix: true,
              })}
            </p>
          </div>
        </div>

        {canDelete && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                data-ocid={`post.delete_button.${ocidIdx}`}
                className="shrink-0 h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent data-ocid="post.dialog">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this post?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be easily undone. The post will be removed
                  from the feed.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel data-ocid={`post.cancel_button.${ocidIdx}`}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  data-ocid={`post.confirm_button.${ocidIdx}`}
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {/* Post Text */}
      <div className="px-4 pb-3">
        <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap break-words">
          {post.text}
        </p>
      </div>

      {/* Post Image */}
      {post.imageUrl && (
        <div className="mx-4 mb-3 rounded-xl overflow-hidden">
          <img
            src={post.imageUrl}
            alt="Post content"
            className="w-full object-cover max-h-80"
            loading="lazy"
          />
        </div>
      )}

      {/* Action Bar */}
      <div className="px-4 pb-3 flex items-center gap-1 border-t border-border pt-3">
        <button
          type="button"
          data-ocid={`post.like_button.${ocidIdx}`}
          onClick={handleLike}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
            isLiked
              ? "text-red-500 bg-red-50"
              : "text-muted-foreground hover:text-red-500 hover:bg-red-50"
          }`}
        >
          <Heart
            className={`h-4 w-4 transition-all duration-150 ${isLiked ? "fill-current scale-110" : ""}`}
          />
          <span>{likeCount}</span>
        </button>

        <button
          type="button"
          data-ocid={`post.comment_button.${ocidIdx}`}
          onClick={handleCommentToggle}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
            showComments
              ? "text-primary bg-primary/10"
              : "text-muted-foreground hover:text-primary hover:bg-primary/10"
          }`}
        >
          <MessageCircle className="h-4 w-4" />
          <span>{comments.length}</span>
        </button>
      </div>

      {/* Comments Section */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-border">
              {/* Comment List */}
              {comments.length > 0 && (
                <div className="pt-3 space-y-3">
                  {comments.map((comment) => {
                    const commentAuthor = getProfile(comment.authorPrincipalId);
                    return (
                      <div key={comment.commentId} className="flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            navigate({
                              to: `/profile/${comment.authorPrincipalId}`,
                            })
                          }
                          className="shrink-0"
                        >
                          <Avatar className="h-7 w-7">
                            <AvatarImage src={commentAuthor?.avatarUrl} />
                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                              {commentAuthor?.displayName
                                ?.slice(0, 2)
                                .toUpperCase() ?? "??"}
                            </AvatarFallback>
                          </Avatar>
                        </button>
                        <div className="flex-1 min-w-0 bg-muted rounded-xl px-3 py-2">
                          <p className="text-xs font-semibold text-foreground">
                            {commentAuthor?.displayName ?? "Unknown"}
                          </p>
                          <p className="text-xs text-foreground mt-0.5 break-words">
                            {comment.text}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDistanceToNow(new Date(comment.createdAt), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Add Comment */}
              {currentPrincipalId && (
                <div className="flex items-center gap-2 pt-3">
                  <Input
                    ref={commentInputRef}
                    data-ocid={`post.comment_input.${ocidIdx}`}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 h-9 text-sm rounded-xl bg-muted border-transparent focus:border-primary"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleAddComment();
                      }
                    }}
                  />
                  <Button
                    size="icon"
                    data-ocid={`post.comment_submit_button.${ocidIdx}`}
                    onClick={handleAddComment}
                    disabled={!commentText.trim()}
                    className="h-9 w-9 rounded-xl shrink-0"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {!currentPrincipalId && comments.length === 0 && (
                <p className="text-xs text-muted-foreground pt-3 text-center">
                  Sign in to see and add comments.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}
