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
    <Card>
      <CardHeader className="flex flex-col items-center text-center">
        <Avatar className="h-20 w-20 mb-4">
          <AvatarImage src={user?.thumbnail_url || ""} />
          <AvatarFallback>
            {user?.user_name?.[0]?.toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
        <CardTitle>{user?.user_name || "Your Name"}</CardTitle>
        <CardDescription>
          This is your public profile information
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form className="flex flex-col gap-6">
          <div className="grid gap-3">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" value={user?.user_name || ""} disabled />
          </div>

          <div className="grid gap-3">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={user?.user_email || ""} disabled />
          </div>

          <div className="grid gap-3">
            <Label htmlFor="role">Role</Label>
            <Input id="role" value={"User"} disabled />
          </div>

          <div className="flex flex-col gap-3">
            <Link href="/profile/edit">
              <Button className="w-full">Edit Profile</Button>
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
