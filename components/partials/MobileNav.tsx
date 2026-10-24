"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, PlusCircle, Video, User } from "lucide-react";
import { useAuth } from "@/store/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import clsx from "clsx";

export function MobileNav() {
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuth();

  const navItems = [
    {
      label: "Home",
      href: "/",
      icon: Home,
      isActive: pathname === "/",
    },
    {
      label: "Explore",
      href: "/search",
      icon: Compass,
      isActive: pathname.startsWith("/search") || pathname.startsWith("/category"),
    },
    {
      label: "Upload",
      href: isAuthenticated ? "/video/upload" : "/auth/login",
      icon: PlusCircle,
      isPrimary: true,
      isActive: pathname === "/video/upload",
    },
    {
      label: "My Clips",
      href: isAuthenticated ? "/my-videos" : "/auth/login",
      icon: Video,
      isActive: pathname === "/my-videos",
    },
    {
      label: isAuthenticated ? (user?.fullName || user?.user_name || "You") : "Sign In",
      href: isAuthenticated ? "/profile" : "/auth/login",
      icon: User,
      isProfile: true,
      isActive: pathname.startsWith("/profile") || pathname.startsWith("/channel"),
    },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t border-border/50 px-2 py-1.5 shadow-lg safe-bottom"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;

          if (item.isPrimary) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center p-1 group"
                aria-label={item.label}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-600 flex items-center justify-center shadow-md shadow-purple-500/30 group-active:scale-95 transition-transform">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-[10px] font-medium text-foreground/80 mt-0.5">
                  {item.label}
                </span>
              </Link>
            );
          }

          if (item.isProfile && isAuthenticated && user) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors min-w-[56px]",
                  item.isActive
                    ? "text-primary font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
                aria-label={item.label}
              >
                <Avatar className="w-5 h-5 ring-1 ring-border">
                  <AvatarImage src={user.avatar_url || ""} alt={item.label} />
                  <AvatarFallback className="text-[10px] bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold">
                    {(user.fullName || user.user_name || "U")[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-[10px] truncate max-w-[54px] mt-0.5">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors min-w-[56px]",
                item.isActive
                  ? "text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-label={item.label}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] mt-0.5 truncate max-w-[54px]">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
export default MobileNav;
