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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useActor } from "@/hooks/useActor";
import { useSocial } from "@/store/socialStore";
import { formatDistanceToNow } from "date-fns";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Eye,
  EyeOff,
  Globe,
  Key,
  Loader2,
  RotateCcw,
  Settings,
  ShieldCheck,
  ShieldOff,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface AdminPageProps {
  isAdmin: boolean;
  currentPrincipalId: string | null;
}

export function AdminPage({ isAdmin, currentPrincipalId }: AdminPageProps) {
  const {
    getAllPosts,
    profiles,
    deletePost,
    restorePost,
    suspendUser,
    unsuspendUser,
    getProfile,
  } = useSocial();

  if (!isAdmin) {
    return (
      <main className="feed-width px-4 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-sm mx-auto"
        >
          <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <ShieldOff className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="font-display text-2xl font-bold mb-2">
            Access Denied
          </h1>
          <p className="text-muted-foreground text-sm">
            You need administrator privileges to access this panel.
          </p>
        </motion.div>
      </main>
    );
  }

  const allPosts = getAllPosts();
  const allUsers = Array.from(profiles.values());

  const handleDeletePost = (postId: string) => {
    deletePost(postId);
    toast.success("Post deleted");
  };

  const handleRestorePost = (postId: string) => {
    restorePost(postId);
    toast.success("Post restored");
  };

  const handleSuspendUser = (principalId: string) => {
    suspendUser(principalId);
    toast.success("User suspended");
  };

  const handleUnsuspendUser = (principalId: string) => {
    unsuspendUser(principalId);
    toast.success("User unsuspended");
  };

  const truncateText = (text: string, maxLen: number) => {
    if (text.length <= maxLen) return text;
    return `${text.slice(0, maxLen)}...`;
  };

  const truncatePrincipal = (id: string) => {
    if (id.length <= 20) return id;
    return `${id.slice(0, 10)}...${id.slice(-6)}`;
  };

  return (
    <main className="max-w-5xl mx-auto px-4 py-6 pb-24 sm:pb-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex items-center gap-3"
      >
        <div className="h-10 w-10 rounded-xl pulse-gradient flex items-center justify-center shadow-glow">
          <ShieldCheck className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold">Admin Panel</h1>
          <p className="text-sm text-muted-foreground">
            Content moderation & user management
          </p>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Posts", value: allPosts.length },
          {
            label: "Active Posts",
            value: allPosts.filter((p) => !p.isDeleted).length,
          },
          { label: "Total Users", value: allUsers.length },
          {
            label: "Suspended",
            value: allUsers.filter((u) => u.isSuspended).length,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-card rounded-2xl border border-border p-4 text-center"
          >
            <p className="font-display text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      <Tabs defaultValue="posts">
        <TabsList className="w-full rounded-xl bg-muted p-1 mb-4 max-w-sm">
          <TabsTrigger
            value="posts"
            data-ocid="admin.posts_tab"
            className="flex-1 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm"
          >
            Posts ({allPosts.length})
          </TabsTrigger>
          <TabsTrigger
            value="users"
            data-ocid="admin.users_tab"
            className="flex-1 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm"
          >
            Users ({allUsers.length})
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            data-ocid="admin.settings_tab"
            className="flex-1 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm"
          >
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Posts Tab */}
        <TabsContent value="posts" className="mt-0">
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border">
                    <TableHead className="text-xs font-semibold">
                      Author
                    </TableHead>
                    <TableHead className="text-xs font-semibold">
                      Content
                    </TableHead>
                    <TableHead className="text-xs font-semibold hidden sm:table-cell">
                      Date
                    </TableHead>
                    <TableHead className="text-xs font-semibold">
                      Status
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allPosts.map((post, idx) => {
                    const author = getProfile(post.authorPrincipalId);
                    const ocidIdx = idx + 1;
                    return (
                      <TableRow
                        key={post.postId}
                        data-ocid={`post.item.${ocidIdx}`}
                        className={`border-border ${post.isDeleted ? "opacity-50" : ""}`}
                      >
                        <TableCell className="py-3">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-7 w-7 shrink-0">
                              <AvatarImage src={author?.avatarUrl} />
                              <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                                {author?.displayName
                                  ?.slice(0, 2)
                                  .toUpperCase() ?? "?"}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs font-medium truncate max-w-[80px]">
                              {author?.displayName ??
                                truncatePrincipal(post.authorPrincipalId)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-3 max-w-[200px]">
                          <p className="text-xs text-foreground line-clamp-2">
                            {truncateText(post.text || "(image only)", 80)}
                          </p>
                          {post.imageUrl && (
                            <Badge
                              variant="secondary"
                              className="text-[10px] mt-1"
                            >
                              📷 Image
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="py-3 hidden sm:table-cell">
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(post.createdAt), {
                              addSuffix: true,
                            })}
                          </span>
                        </TableCell>
                        <TableCell className="py-3">
                          <Badge
                            variant={
                              post.isDeleted ? "destructive" : "secondary"
                            }
                            className="text-[10px]"
                          >
                            {post.isDeleted ? "Deleted" : "Active"}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {post.isDeleted ? (
                              <Button
                                size="sm"
                                variant="outline"
                                data-ocid={`admin.post_delete_button.${ocidIdx}`}
                                onClick={() => handleRestorePost(post.postId)}
                                className="h-7 px-2 text-xs rounded-lg"
                              >
                                <RotateCcw className="h-3 w-3 mr-1" />
                                Restore
                              </Button>
                            ) : (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    data-ocid={`admin.post_delete_button.${ocidIdx}`}
                                    className="h-7 px-2 text-xs rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive"
                                  >
                                    <Trash2 className="h-3 w-3 mr-1" />
                                    Delete
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="rounded-2xl">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Delete this post?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This post will be marked as deleted and
                                      removed from feeds.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel className="rounded-xl">
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() =>
                                        handleDeletePost(post.postId)
                                      }
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="mt-0">
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border">
                    <TableHead className="text-xs font-semibold">
                      User
                    </TableHead>
                    <TableHead className="text-xs font-semibold hidden sm:table-cell">
                      Principal ID
                    </TableHead>
                    <TableHead className="text-xs font-semibold">
                      Status
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allUsers.map((user, idx) => {
                    const ocidIdx = idx + 1;
                    const isCurrentUser =
                      user.principalId === currentPrincipalId;
                    return (
                      <TableRow
                        key={user.principalId}
                        data-ocid="admin.users_tab.row"
                        className={`border-border ${user.isSuspended ? "opacity-60" : ""}`}
                      >
                        <TableCell className="py-3">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8 shrink-0">
                              <AvatarImage src={user.avatarUrl} />
                              <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                                {user.displayName.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">
                                {user.displayName}
                                {isCurrentUser && (
                                  <span className="text-xs text-primary ml-1">
                                    (you)
                                  </span>
                                )}
                              </p>
                              <p className="text-xs text-muted-foreground line-clamp-1 max-w-[140px]">
                                {user.bio || "No bio"}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-3 hidden sm:table-cell">
                          <code className="text-xs text-muted-foreground font-mono">
                            {truncatePrincipal(user.principalId)}
                          </code>
                        </TableCell>
                        <TableCell className="py-3">
                          <Badge
                            variant={
                              user.isSuspended ? "destructive" : "secondary"
                            }
                            className="text-[10px]"
                          >
                            {user.isSuspended ? "Suspended" : "Active"}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-3 text-right">
                          {!isCurrentUser &&
                            (user.isSuspended ? (
                              <Button
                                size="sm"
                                variant="outline"
                                data-ocid={`admin.user_unsuspend_button.${ocidIdx}`}
                                onClick={() =>
                                  handleUnsuspendUser(user.principalId)
                                }
                                className="h-7 px-2 text-xs rounded-lg"
                              >
                                <ShieldCheck className="h-3 w-3 mr-1" />
                                Restore
                              </Button>
                            ) : (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    data-ocid={`admin.user_suspend_button.${ocidIdx}`}
                                    className="h-7 px-2 text-xs rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive"
                                  >
                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                    Suspend
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="rounded-2xl">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Suspend {user.displayName}?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This user will be suspended and marked
                                      accordingly. You can unsuspend them later.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel className="rounded-xl">
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() =>
                                        handleSuspendUser(user.principalId)
                                      }
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
                                    >
                                      Suspend
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            ))}
                          {isCurrentUser && (
                            <span className="text-xs text-muted-foreground">
                              Admin
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <StripeSettingsTab />
      </Tabs>
    </main>
  );
}

function StripeSettingsTab() {
  const { actor, isFetching } = useActor();
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);
  const [secretKey, setSecretKey] = useState("");
  const [countries, setCountries] = useState("IN, US, GB");
  const [showKey, setShowKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!actor || isFetching) return;
    actor
      .isStripeConfigured()
      .then((configured) => setIsConfigured(configured))
      .catch(() => setIsConfigured(false));
  }, [actor, isFetching]);

  const handleSave = async () => {
    if (!actor) return;
    if (!secretKey.trim()) {
      toast.error("Please enter a Stripe secret key");
      return;
    }
    setIsSaving(true);
    try {
      const allowedCountries = countries
        .split(",")
        .map((c) => c.trim().toUpperCase())
        .filter(Boolean);
      await actor.setStripeConfiguration({
        secretKey: secretKey.trim(),
        allowedCountries,
      });
      setIsConfigured(true);
      toast.success("Stripe settings saved");
    } catch (_err) {
      toast.error("Failed to save Stripe settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <TabsContent value="settings" className="mt-0">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="max-w-xl"
      >
        <div className="bg-card rounded-2xl border border-border p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center">
                <Settings className="h-4 w-4 text-foreground" />
              </div>
              <div>
                <h2 className="font-semibold text-base">Stripe Settings</h2>
                <p className="text-xs text-muted-foreground">
                  Configure payment processing
                </p>
              </div>
            </div>
            {/* Status badge */}
            {isConfigured === null ? (
              <Badge variant="secondary" className="text-xs gap-1.5">
                <Loader2 className="h-3 w-3 animate-spin" />
                Checking…
              </Badge>
            ) : isConfigured ? (
              <Badge
                className="text-xs gap-1.5 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/15"
                variant="outline"
              >
                <CheckCircle2 className="h-3 w-3" />
                Configured
              </Badge>
            ) : (
              <Badge
                className="text-xs gap-1.5 bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/15"
                variant="outline"
              >
                <AlertCircle className="h-3 w-3" />
                Not Configured
              </Badge>
            )}
          </div>

          <div className="h-px bg-border" />

          {/* Secret Key Field */}
          <div className="space-y-2">
            <Label
              htmlFor="stripe-secret-key"
              className="text-sm font-medium flex items-center gap-1.5"
            >
              <Key className="h-3.5 w-3.5 text-muted-foreground" />
              Stripe Secret Key
            </Label>
            <div className="relative">
              <Input
                id="stripe-secret-key"
                data-ocid="admin.stripe_key_input"
                type={showKey ? "text" : "password"}
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                placeholder="sk_live_... or sk_test_..."
                className="pr-10 rounded-xl font-mono text-sm"
                autoComplete="off"
                spellCheck={false}
              />
              <button
                type="button"
                onClick={() => setShowKey((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showKey ? "Hide secret key" : "Show secret key"}
              >
                {showKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Allowed Countries Field */}
          <div className="space-y-2">
            <Label
              htmlFor="stripe-countries"
              className="text-sm font-medium flex items-center gap-1.5"
            >
              <Globe className="h-3.5 w-3.5 text-muted-foreground" />
              Allowed Countries
            </Label>
            <Input
              id="stripe-countries"
              data-ocid="admin.stripe_countries_input"
              type="text"
              value={countries}
              onChange={(e) => setCountries(e.target.value)}
              placeholder="IN, US, GB"
              className="rounded-xl text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Enter comma-separated ISO country codes (e.g. IN, US, GB)
            </p>
          </div>

          {/* Save Button */}
          <Button
            data-ocid="admin.stripe_save_button"
            onClick={handleSave}
            disabled={isSaving || isFetching}
            className="w-full rounded-xl"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : (
              "Save Settings"
            )}
          </Button>
        </div>

        {/* Info box */}
        <div className="mt-4 bg-muted/50 rounded-2xl border border-border p-5 space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-1.5">
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
            How to set up Stripe
          </h3>
          <ul className="space-y-2 text-xs text-muted-foreground list-none">
            <li className="flex gap-2">
              <span className="text-foreground font-medium shrink-0">1.</span>
              Go to{" "}
              <a
                href="https://stripe.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-foreground transition-colors"
              >
                stripe.com
              </a>{" "}
              → Developers → API Keys to get your secret key.
            </li>
            <li className="flex gap-2">
              <span className="text-foreground font-medium shrink-0">2.</span>
              Use a <code className="font-mono">sk_test_…</code> key for testing
              and <code className="font-mono">sk_live_…</code> for production.
            </li>
            <li className="flex gap-2">
              <span className="text-foreground font-medium shrink-0">3.</span>
              Payouts are sent to the bank account connected in your Stripe
              dashboard under Settings → Bank accounts and scheduling.
            </li>
          </ul>
        </div>
      </motion.div>
    </TabsContent>
  );
}
