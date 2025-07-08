"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/store/auth-context";
import { useRouter } from "next/navigation";
import { z } from "zod";

// Schema
const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

type ProfileFormData = z.infer<typeof schema>;

export default function EditProfile() {
  const { user } = useAuth(); // assume updateProfile exists
  const router = useRouter();

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    // updateProfile(data);
    console.log("Profile updated:", data);
    router.push("/profile"); // Redirect to view profile page
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
        <CardDescription>Update your personal information.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-6"
        >
          <div className="grid gap-3">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" {...form.register("name")} />
          </div>
          <div className="grid gap-3">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...form.register("email")} />
          </div>
          <Button type="submit" className="w-full">
            Save Changes
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
