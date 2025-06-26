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

export function Navbar() {
  const { theme, setTheme } = useTheme();
  return (
    <header className="w-full border-b px-4 py-2">
      <div className="container mx-auto flex items-center justify-between">
        {/* Org Name */}
        <div className="text-xl font-semibold">MyOrg</div>

        {/* Center Navigation Menu */}
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Videos</NavigationMenuTrigger>
              <NavigationMenuContent className="p-4">
                <NavigationMenuLink>All Videos</NavigationMenuLink>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        <Button
          variant="outline"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          Toggle Theme
        </Button>

        {/* Sign In Button */}
        <Button variant="outline">Sign In</Button>
      </div>
    </header>
  );
}
