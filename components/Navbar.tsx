"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { Moon, Sun, Plus } from "lucide-react";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

import { useAuth } from "@/store/auth-context";

export function Navbar() {
  const { setTheme } = useTheme();
  const { isAuthenticated, logout, user } = useAuth();

  return (
    <header className="w-full border-b px-4 py-3 sticky top-0 z-50 backdrop-blur-sm bg-background/80">
      <div className="container mx-auto flex items-center justify-between">
        {/* === Left: Brand Logo === */}
        <motion.div
          className="cursor-pointer"
          whileHover={{ scale: 1.09 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <Link href="/" className="group flex flex-col leading-tight">
            <span className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent font-logo">
              bideo
            </span>
            <span className="text-sm tracking-widest text-muted-foreground font-light group-hover:tracking-[0.2em] transition-all duration-300">
              ビデオ
            </span>
          </Link>
        </motion.div>

        {/* === Center: Navigation === */}
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link
                  href="/"
                  className="text-sm font-medium px-4 py-2 hover:underline"
                >
                  Home
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>

            {isAuthenticated && (
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    href="/video/upload"
                    className="text-sm font-medium px-4 py-2 hover:underline"
                  >
                    Upload Video
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            )}
          </NavigationMenuList>
        </NavigationMenu>

        {/* === Right: Auth, Upload, Theme === */}
        <div className="flex items-center gap-4">
          {/* Auth Section */}
          {!isAuthenticated ? (
            <Link href="/auth/login">
              <Button variant="outline">Sign In</Button>
            </Link>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="cursor-pointer">
                  <AvatarImage
                    src={user?.thumbnail_url || ""}
                    alt={user?.name || "User"}
                  />
                  <AvatarFallback>
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout}>Log Out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Theme Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Toggle theme">
                <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}>
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
