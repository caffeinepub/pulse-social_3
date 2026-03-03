import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useDarkMode } from "@/hooks/useDarkMode";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useSubscription } from "@/hooks/useSubscription";
import { useSocial } from "@/store/socialStore";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  LogIn,
  LogOut,
  Moon,
  Search,
  ShieldCheck,
  Sparkles,
  Sun,
  User,
  Zap,
} from "lucide-react";

interface TopNavProps {
  currentPrincipalId: string | null;
  isAdmin: boolean;
}

export function TopNav({ currentPrincipalId, isAdmin }: TopNavProps) {
  const { login, clear, isLoggingIn } = useInternetIdentity();
  const { getProfile } = useSocial();
  const navigate = useNavigate();
  const { isSubscribed, subscribe } = useSubscription(isAdmin);
  const { isDark, toggle } = useDarkMode();

  const profile = currentPrincipalId
    ? getProfile(currentPrincipalId)
    : undefined;

  return (
    <header className="sticky top-0 z-50 glass shadow-nav">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-1.5 shrink-0">
          <div className="h-8 w-8 rounded-xl silver-icon flex items-center justify-center">
            <Zap className="h-4 w-4 text-white fill-white drop-shadow" />
          </div>
          <span className="font-display font-bold text-lg tracking-tight silver-shine-text">
            Pulse
          </span>
        </Link>

        {/* Search (cosmetic) */}
        <div className="flex-1 max-w-xs hidden sm:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search Pulse..."
              className="pl-9 h-9 rounded-xl bg-muted border-transparent focus:border-primary text-sm"
              readOnly
              onClick={() => navigate({ to: "/explore" })}
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Dark mode toggle */}
          <button
            type="button"
            data-ocid="nav.dark_mode_toggle"
            onClick={toggle}
            className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            aria-label="Toggle dark mode"
          >
            {isDark ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>

          {!currentPrincipalId ? (
            <Button
              data-ocid="nav.login_button"
              onClick={login}
              disabled={isLoggingIn}
              size="sm"
              className="rounded-xl pulse-gradient text-white border-0 shadow-glow"
            >
              <LogIn className="h-4 w-4 mr-1.5" />
              {isLoggingIn ? "Signing in..." : "Sign in"}
            </Button>
          ) : (
            <>
              {/* Subscription status indicator */}
              {isSubscribed ? (
                <Badge
                  variant="secondary"
                  className="hidden sm:flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium bg-secondary text-secondary-foreground border border-border"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-foreground animate-pulse" />
                  Active
                </Badge>
              ) : (
                <button
                  type="button"
                  data-ocid="topnav.subscribe_button"
                  onClick={subscribe}
                  className="hidden sm:flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors px-2.5 py-1 rounded-lg hover:bg-primary/5"
                >
                  <Sparkles className="h-3 w-3" />
                  Subscribe
                </button>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    data-ocid="nav.avatar_button"
                    className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <div className="relative">
                      <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                        <AvatarImage src={profile?.avatarUrl} />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                          {profile?.displayName?.slice(0, 2).toUpperCase() ??
                            "ME"}
                        </AvatarFallback>
                      </Avatar>
                      {isSubscribed && (
                        <span
                          aria-label="Active subscription"
                          className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-foreground border-2 border-background"
                        />
                      )}
                    </div>
                    <span className="text-sm font-medium hidden sm:block max-w-[120px] truncate">
                      {profile?.displayName ?? "Me"}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  data-ocid="nav.user_dropdown"
                  align="end"
                  className="w-52 rounded-xl"
                >
                  <DropdownMenuItem
                    data-ocid="nav.profile_link"
                    className="cursor-pointer rounded-lg"
                    onClick={() =>
                      navigate({ to: `/profile/${currentPrincipalId}` })
                    }
                  >
                    <User className="h-4 w-4 mr-2" />
                    My Profile
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem
                      data-ocid="nav.admin_link"
                      className="cursor-pointer rounded-lg"
                      onClick={() => navigate({ to: "/admin" })}
                    >
                      <ShieldCheck className="h-4 w-4 mr-2" />
                      Admin Panel
                    </DropdownMenuItem>
                  )}
                  {!isSubscribed && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        data-ocid="topnav.subscribe_button"
                        className="cursor-pointer rounded-lg text-primary focus:text-primary"
                        onClick={subscribe}
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Subscribe — ₹99/week
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    data-ocid="nav.logout_button"
                    className="cursor-pointer rounded-lg text-destructive focus:text-destructive"
                    onClick={clear}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
