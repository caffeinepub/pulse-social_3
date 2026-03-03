import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useSocial } from "@/store/socialStore";
import { ImagePlus, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

interface CreatePostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPrincipalId: string;
}

export function CreatePostModal({
  open,
  onOpenChange,
  currentPrincipalId,
}: CreatePostModalProps) {
  const { createPost, getProfile } = useSocial();
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const profile = getProfile(currentPrincipalId);
  const MAX_CHARS = 500;
  const remaining = MAX_CHARS - text.length;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImagePreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    const trimmed = text.trim();
    if (!trimmed && !imagePreview) return;

    setIsSubmitting(true);
    try {
      createPost(currentPrincipalId, trimmed, imagePreview);
      toast.success("Post published!");
      setText("");
      setImagePreview("");
      onOpenChange(false);
    } catch {
      toast.error("Failed to create post");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (text || imagePreview) {
      if (confirm("Discard this post?")) {
        setText("");
        setImagePreview("");
        onOpenChange(false);
      }
    } else {
      onOpenChange(false);
    }
  };

  const canSubmit =
    (text.trim().length > 0 || imagePreview !== "") && remaining >= 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        data-ocid="create_post.dialog"
        className="sm:max-w-lg rounded-2xl p-0 overflow-hidden gap-0"
      >
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle className="text-lg font-bold">Create Post</DialogTitle>
        </DialogHeader>

        <div className="px-6 pt-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-10 w-10 shrink-0 ring-2 ring-primary/10">
              <AvatarImage src={profile?.avatarUrl} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                {profile?.displayName?.slice(0, 2).toUpperCase() ?? "??"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">
                {profile?.displayName}
              </p>
              <Textarea
                data-ocid="create_post.textarea"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="What's on your mind?"
                maxLength={MAX_CHARS}
                rows={4}
                className="mt-2 resize-none border-0 p-0 shadow-none focus-visible:ring-0 text-base placeholder:text-muted-foreground bg-transparent"
                autoFocus
              />
            </div>
          </div>

          {/* Image Preview */}
          {imagePreview && (
            <div className="relative mt-3 rounded-xl overflow-hidden">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full max-h-60 object-cover"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black/80 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Char counter */}
        <div className="px-6 pt-2 flex justify-end">
          <span
            className={`text-xs font-medium ${
              remaining < 50 ? "text-destructive" : "text-muted-foreground"
            }`}
          >
            {remaining}
          </span>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 mt-2 border-t border-border flex items-center justify-between gap-3">
          <div className="flex items-center gap-1">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageSelect}
              id="post-image-upload"
            />
            <Button
              variant="ghost"
              size="icon"
              data-ocid="create_post.upload_button"
              onClick={() => fileInputRef.current?.click()}
              className="h-9 w-9 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10"
              type="button"
            >
              <ImagePlus className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              data-ocid="create_post.cancel_button"
              onClick={handleClose}
              size="sm"
              className="rounded-lg"
            >
              Cancel
            </Button>
            <Button
              data-ocid="create_post.submit_button"
              onClick={handleSubmit}
              disabled={!canSubmit || isSubmitting}
              size="sm"
              className="rounded-lg pulse-gradient text-white border-0 min-w-[80px]"
            >
              {isSubmitting ? "Posting..." : "Post"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
