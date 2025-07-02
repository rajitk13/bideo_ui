"use client";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useAuth } from "@/store/auth-context";

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const { isAuthenticated, logout } = useAuth();

  const isDark = theme === "dark";

  return (
    <header className="w-full border-b bg-background px-4 py-2">
      <div className="container mx-auto flex items-center justify-between">
        {/* Left Section - Brand */}
        <div className="text-xl font-bold tracking-tight">MyOrg</div>

        {/* Center Section - Navigation */}
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Videos</NavigationMenuTrigger>
              <NavigationMenuContent className="p-4">
                <NavigationMenuLink>All Videos</NavigationMenuLink>
              </NavigationMenuContent>
            </NavigationMenuItem>
            {/* Add more NavigationMenuItems here */}
          </NavigationMenuList>
        </NavigationMenu>

        {/* Right Section - Controls */}
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Label htmlFor="theme-toggle" className="text-sm">
              {isDark ? "Dark" : "Light"}
            </Label>
            <Switch
              id="theme-toggle"
              checked={isDark}
              onCheckedChange={(checked) => {
                setTheme(checked ? "dark" : "light");
              }}
            />
          </div>
          {!isAuthenticated ? (
            <Link href="/auth/login">
              <Button variant="outline">Sign In</Button>
            </Link>
          ) : (
            <Link href="/auth/login">
              <Button variant="outline" onClick={logout}>
                Log Out
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
