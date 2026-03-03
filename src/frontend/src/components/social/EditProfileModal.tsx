import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { type UserProfile, useSocial } from "@/store/socialStore";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface EditProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: UserProfile;
}

export function EditProfileModal({
  open,
  onOpenChange,
  profile,
}: EditProfileModalProps) {
  const { upsertProfile } = useSocial();
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [bio, setBio] = useState(profile.bio);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setDisplayName(profile.displayName);
      setBio(profile.bio);
      setAvatarUrl(profile.avatarUrl);
    }
  }, [open, profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = displayName.trim();
    if (!trimmedName) {
      toast.error("Display name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      upsertProfile({
        ...profile,
        displayName: trimmedName,
        bio: bio.trim(),
        avatarUrl:
          avatarUrl || `https://i.pravatar.cc/150?u=${profile.principalId}`,
      });
      toast.success("Profile updated!");
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const previewAvatar =
    avatarUrl || `https://i.pravatar.cc/150?u=${profile.principalId}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-ocid="profile_edit.dialog"
        className="sm:max-w-md rounded-2xl"
      >
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex justify-center">
            <Avatar className="h-20 w-20 ring-4 ring-primary/20">
              <AvatarImage src={previewAvatar} />
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-2xl">
                {displayName.slice(0, 2).toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-name">Display name *</Label>
            <Input
              id="edit-name"
              data-ocid="profile_edit.displayname_input"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
              maxLength={50}
              required
              className="rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-bio">Bio</Label>
            <Textarea
              id="edit-bio"
              data-ocid="profile_edit.bio_input"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell people about yourself..."
              maxLength={200}
              rows={3}
              className="rounded-xl resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-avatar">Avatar URL</Label>
            <Input
              id="edit-avatar"
              data-ocid="profile_edit.avatar_input"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://example.com/your-photo.jpg"
              className="rounded-xl"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              data-ocid="profile_edit.cancel_button"
              onClick={() => onOpenChange(false)}
              className="flex-1 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              data-ocid="profile_edit.save_button"
              disabled={!displayName.trim() || isSubmitting}
              className="flex-1 rounded-xl pulse-gradient text-white border-0"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
