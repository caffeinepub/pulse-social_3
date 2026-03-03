import { Link, useRouterState } from "@tanstack/react-router";
import { Compass, Home, ShieldCheck, User } from "lucide-react";

interface BottomNavProps {
  currentPrincipalId: string;
  isAdmin: boolean;
}

export function BottomNav({ currentPrincipalId, isAdmin }: BottomNavProps) {
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;

  const links = [
    { to: "/", label: "Feed", icon: Home, ocid: "nav.feed_link" },
    {
      to: "/explore",
      label: "Explore",
      icon: Compass,
      ocid: "nav.explore_link",
    },
    {
      to: `/profile/${currentPrincipalId}`,
      label: "Profile",
      icon: User,
      ocid: "nav.profile_link",
    },
    ...(isAdmin
      ? [
          {
            to: "/admin",
            label: "Admin",
            icon: ShieldCheck,
            ocid: "nav.admin_link",
          },
        ]
      : []),
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 sm:hidden glass shadow-[0_-1px_0_oklch(0.9_0.01_250)]">
      <div className="flex items-center justify-around h-16 px-2 max-w-md mx-auto">
        {links.map((link) => {
          const isActive =
            link.to === "/" ? pathname === "/" : pathname.startsWith(link.to);

          return (
            <Link
              key={link.to}
              to={link.to}
              data-ocid={link.ocid}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <link.icon
                className={`h-5 w-5 ${isActive ? "scale-110" : ""} transition-transform`}
              />
              <span className="text-[10px] font-medium">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
