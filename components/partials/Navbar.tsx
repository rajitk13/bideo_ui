"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { Moon, Sun, Play, Search, Upload, ChevronDown } from "lucide-react";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
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
    <header className="w-full border-b border-border/50 px-4 py-2.5 sticky top-0 z-50 backdrop-blur-md bg-background/80 shadow-xs">
      <div className="container mx-auto flex items-center justify-between gap-4">
        {/* === Left: Brand Logo === */}
        <motion.div
          className="cursor-pointer shrink-0"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 12 }}
        >
          <Link href="/" className="group flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-md shadow-purple-500/20 group-hover:shadow-purple-500/40 transition-shadow">
              <Play className="w-4 h-4 text-white fill-white ml-0.5" />
            </div>
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent font-logo">
              buzzclips
            </span>
          </Link>
        </motion.div>

        {/* === Center: Navigation === */}
        <NavigationMenu className="hidden md:block">
          <NavigationMenuList className="gap-1">
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link
                  href="/"
                  className="text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-full hover:bg-muted/70 text-foreground/80 hover:text-foreground transition-colors"
                >
                  Home
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>

            {/* Categories Dropdown in Header */}
            <NavigationMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-1 text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-full hover:bg-muted/70 text-foreground/80 hover:text-foreground transition-colors cursor-pointer"
                  >
                    <span>Categories</span>
                    <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48 p-1.5 rounded-xl">
                  <DropdownMenuItem asChild>
                    <Link href="/category/tech" className="cursor-pointer">
                      💻 Tech & Coding
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/category/gaming" className="cursor-pointer">
                      🎮 Gaming Highlights
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/category/entertainment" className="cursor-pointer">
                      🎬 Entertainment & Shorts
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/category/music" className="cursor-pointer">
                      🎵 Music & Beats
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/category/education" className="cursor-pointer">
                      🎓 Education & Tutorials
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/category/sports" className="cursor-pointer">
                      ⚽ Sports & Fitness
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/category/lifestyle" className="cursor-pointer">
                      🌿 Lifestyle & Vlogs
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </NavigationMenuItem>

            {isAuthenticated && (
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    href="/video/upload"
                    className="flex items-center gap-1 text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-full hover:bg-primary/10 text-primary transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Upload Video
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            )}
          </NavigationMenuList>
        </NavigationMenu>

        {/* === Right: Search, Auth, Theme === */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Search Shortcut */}
          <Link
            href="/search"
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card/60 hover:bg-muted/80 border border-border/50 text-xs text-muted-foreground hover:text-foreground transition-all duration-200"
            title="Search videos"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Search</span>
          </Link>

          {/* Auth Section */}
          {!isAuthenticated ? (
            <Link href="/auth/login">
              <Button size="sm" variant="outline" className="rounded-full px-4 text-xs font-semibold">
                Sign In
              </Button>
            </Link>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="cursor-pointer ring-2 ring-transparent hover:ring-primary/40 transition-all w-8 h-8">
                  <AvatarImage
                    src={user?.avatar_url || ""}
                    alt={user?.user_name || "User"}
                  />
                  <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold">
                    {user?.user_name?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl w-44">
                <DropdownMenuItem asChild>
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/my-videos">My Videos</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout} className="text-red-500">
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Theme Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Toggle theme" className="rounded-full w-8 h-8">
                <Sun className="h-[1.1rem] w-[1.1rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                <Moon className="absolute h-[1.1rem] w-[1.1rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl">
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
