import { BottomNav } from "@/components/social/BottomNav";
import { InAppBrowserBanner } from "@/components/social/InAppBrowserBanner";
import { SubscriptionGate } from "@/components/social/SubscriptionGate";
import { TopNav } from "@/components/social/TopNav";
import { Toaster } from "@/components/ui/sonner";
import { useActor } from "@/hooks/useActor";
import { useDarkMode } from "@/hooks/useDarkMode";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useIsAdmin } from "@/hooks/useQueries";
import { useSubscription } from "@/hooks/useSubscription";
import { recordPageView } from "@/hooks/useVisitorTracking";
import { AdminPage } from "@/pages/AdminPage";
import { ExplorePage } from "@/pages/ExplorePage";
import { FeedPage } from "@/pages/FeedPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { SocialProvider } from "@/store/socialStore";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  useParams,
} from "@tanstack/react-router";
import { useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";

// Extract session_id from URL once (before any React render) and clean URL
const _initialSearchParams = new URLSearchParams(window.location.search);
const _pendingSessionId = _initialSearchParams.get("session_id") ?? null;
if (_pendingSessionId) {
  _initialSearchParams.delete("session_id");
  const cleaned = _initialSearchParams.toString();
  history.replaceState(
    null,
    "",
    cleaned
      ? `${window.location.pathname}?${cleaned}`
      : window.location.pathname,
  );
}

// ---- Root Layout ----
function RootLayout() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: isAdmin = false } = useIsAdmin();

  const currentPrincipalId = identity?.getPrincipal().toString() ?? null;
  const { handlePaymentSuccess } = useSubscription(isAdmin);
  const sessionHandledRef = useRef(false);

  // Handle Stripe callback once actor is ready
  useEffect(() => {
    if (!_pendingSessionId || sessionHandledRef.current) return;
    sessionHandledRef.current = true;

    handlePaymentSuccess(_pendingSessionId).then((success) => {
      if (success) {
        toast.success("Subscription activated! Welcome to Pulse Social.", {
          duration: 5000,
        });
      } else {
        toast.error(
          "Could not verify payment. Please try again or contact support.",
        );
      }
    });
  }, [handlePaymentSuccess]);

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 rounded-2xl pulse-gradient flex items-center justify-center animate-pulse">
          <span className="text-white text-xl">⚡</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <InAppBrowserBanner />
      <TopNav currentPrincipalId={currentPrincipalId} isAdmin={isAdmin} />
      <Outlet />
      {currentPrincipalId && (
        <BottomNav currentPrincipalId={currentPrincipalId} isAdmin={isAdmin} />
      )}
      <Toaster
        position="top-center"
        toastOptions={{
          classNames: {
            toast: "rounded-xl",
          },
        }}
      />
    </div>
  );
}

// ---- Feed Route ----
function FeedRoute() {
  const { identity } = useInternetIdentity();
  const { data: isAdmin = false } = useIsAdmin();
  const currentPrincipalId = identity?.getPrincipal().toString() ?? null;

  return (
    <SubscriptionGate currentPrincipalId={currentPrincipalId} isAdmin={isAdmin}>
      <FeedPage currentPrincipalId={currentPrincipalId} isAdmin={isAdmin} />
    </SubscriptionGate>
  );
}

// ---- Explore Route ----
function ExploreRoute() {
  const { identity } = useInternetIdentity();
  const { data: isAdmin = false } = useIsAdmin();
  const currentPrincipalId = identity?.getPrincipal().toString() ?? null;

  return (
    <SubscriptionGate currentPrincipalId={currentPrincipalId} isAdmin={isAdmin}>
      <ExplorePage currentPrincipalId={currentPrincipalId} isAdmin={isAdmin} />
    </SubscriptionGate>
  );
}

// ---- Profile Route ----
function ProfileRoute() {
  const { principalId } = useParams({ strict: false }) as {
    principalId: string;
  };
  const { identity } = useInternetIdentity();
  const { data: isAdmin = false } = useIsAdmin();
  const currentPrincipalId = identity?.getPrincipal().toString() ?? null;

  return (
    <SubscriptionGate currentPrincipalId={currentPrincipalId} isAdmin={isAdmin}>
      <ProfilePage
        principalId={principalId}
        currentPrincipalId={currentPrincipalId}
        isAdmin={isAdmin}
      />
    </SubscriptionGate>
  );
}

// ---- Admin Route ----
function AdminRoute() {
  const { identity } = useInternetIdentity();
  const { data: isAdmin = false } = useIsAdmin();
  const currentPrincipalId = identity?.getPrincipal().toString() ?? null;

  return (
    <AdminPage isAdmin={isAdmin} currentPrincipalId={currentPrincipalId} />
  );
}

// ---- Router ----
const rootRoute = createRootRoute({ component: RootLayout });

const feedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: FeedRoute,
});

const exploreRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/explore",
  component: ExploreRoute,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile/$principalId",
  component: ProfileRoute,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminRoute,
});

const routeTree = rootRoute.addChildren([
  feedRoute,
  exploreRoute,
  profileRoute,
  adminRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// ---- App ----
export default function App() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  // Track every page load (anonymous + authenticated)
  useEffect(() => {
    recordPageView();
  }, []);

  // Persist dark mode to backend when user is authenticated
  const handlePersist = useCallback(
    (isDark: boolean) => {
      if (actor && identity) {
        actor.setDarkModePreference(isDark).catch(() => {
          // silently ignore – localStorage is the source of truth locally
        });
      }
    },
    [actor, identity],
  );

  const { setDark } = useDarkMode({ onPersist: handlePersist });

  // Load dark mode preference from backend once actor + identity are ready
  const syncedRef = useRef<string | null>(null);
  useEffect(() => {
    if (!actor || isFetching || !identity) return;
    const principalId = identity.getPrincipal().toString();
    // Only sync once per identity session
    if (syncedRef.current === principalId) return;
    syncedRef.current = principalId;

    actor
      .getDarkModePreference()
      .then((pref) => {
        if (pref !== null && pref !== undefined) {
          setDark(pref);
        }
      })
      .catch(() => {
        // silently ignore – keep localStorage value
      });
  }, [actor, isFetching, identity, setDark]);

  // Record first login once per session (idempotent on backend)
  const firstLoginRecordedRef = useRef<string | null>(null);
  useEffect(() => {
    if (!actor || isFetching || !identity) return;
    const principalId = identity.getPrincipal().toString();
    if (firstLoginRecordedRef.current === principalId) return;
    firstLoginRecordedRef.current = principalId;

    actor.recordFirstLogin().catch(() => {
      // fire-and-forget — silently ignore errors
    });
  }, [actor, isFetching, identity]);

  // Record visit on every authenticated session
  const visitRecordedRef = useRef<string | null>(null);
  useEffect(() => {
    if (!actor || isFetching || !identity) return;
    const principalId = identity.getPrincipal().toString();
    if (visitRecordedRef.current === principalId) return;
    visitRecordedRef.current = principalId;
    actor.recordVisit().catch(() => {}); // fire-and-forget
  }, [actor, isFetching, identity]);

  return (
    <SocialProvider>
      <RouterProvider router={router} />
    </SocialProvider>
  );
}
