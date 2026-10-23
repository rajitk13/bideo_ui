"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/store/auth-context";
import Link from "next/link";

export default function ViewProfile() {
  const { user } = useAuth();

  return (
    <Card className="border border-border/50 shadow-xl dark:shadow-2xl dark:shadow-primary/5 bg-card/85 backdrop-blur-md rounded-2xl">
      <CardHeader className="flex flex-col items-center text-center">
        <Avatar className="h-20 w-20 mb-4">
          <AvatarImage src={user?.avatar_url || ""} />
          <AvatarFallback>
            {user?.fullName?.[0]?.toUpperCase() ||
              user?.user_name?.[0]?.toUpperCase() ||
              "U"}
          </AvatarFallback>
        </Avatar>
        <CardTitle>
          {user?.fullName || user?.user_name || "Your Name"}
        </CardTitle>
        <CardDescription>
          This is your public profile information
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form className="flex flex-col gap-6">
          <div className="grid gap-3">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={user?.fullName || user?.user_name || ""}
              disabled
            />
          </div>

          {user?.username && (
            <div className="grid gap-3">
              <Label htmlFor="handle">Handle</Label>
              <Input id="handle" value={`@${user.username}`} disabled />
            </div>
          )}

          <div className="grid gap-3">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={user?.user_email || ""} disabled />
          </div>

          <div className="grid gap-3">
            <Label htmlFor="role">Role</Label>
            <Input id="role" value={user?.user_role || "User"} disabled />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/profile/edit" className="flex-1">
              <Button className="w-full h-11 font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/20 dark:shadow-blue-500/10 transition-all duration-300">
                Edit Profile
              </Button>
            </Link>

            {user?.username && (
              <Link href={`/channel/@${user.username}`} className="flex-1">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-11 font-semibold border-border/60"
                >
                  View Channel
                </Button>
              </Link>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
