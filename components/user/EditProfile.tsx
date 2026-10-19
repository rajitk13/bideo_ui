"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LoaderOverlay } from "../Loader";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { useAuth } from "@/store/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import clsx from "clsx";
import { AVATARS } from "@/constants/avatars";
import { MESSAGES } from "@/constants/messages";
import { updateUser } from "@/utility/requests";
import { toast } from "sonner";
import { redirect } from "next/navigation";

// Schema
export interface User {
  userId: string;
  user_email: string;
  user_name: string;
  avatar_url: string;
}

const schema = z.object({
  userId: z.string(),
  user_name: z.string().min(1, "Name is required"),
  user_email: z.string().email("Invalid email address"),
  avatar_url: z.string().url(),
});

type ProfileFormData = z.infer<typeof schema>;

export default function EditProfile() {
  const { user, setUserInfo, fetchUser, token } = useAuth();

  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      userId: "",
      user_name: "",
      user_email: "",
      avatar_url: AVATARS[0].src,
    },
  });

  // Reset form when user data is loaded
  useEffect(() => {
    if (user) {
      form.reset({
        userId: user.userId,
        user_name: user.user_name,
        user_email: user.user_email,
        avatar_url: user.avatar_url || AVATARS[0].src,
      });
      setIsLoading(false);
    } else {
      fetchUser(); // ensure user is fetched
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const onSubmit = async (data: ProfileFormData) => {
    let userUpdated = false;
    try {
      if (!token) {
        toast.error(MESSAGES.USER_NOT_AUTHENTICATED);
        return;
      }
      await updateUser(data, token);
      setUserInfo(data);
      toast.success(MESSAGES.PROFILE_UPDATED);
      userUpdated = true;
    } catch (err) {
      console.error(err);
      toast.error(MESSAGES.PROFILE_UPDATE_FAILED);
    }

    if (userUpdated) redirect("/profile");
  };

  if (isLoading) return <LoaderOverlay />;

  return (
    <Card className="border border-border/50 shadow-xl dark:shadow-2xl dark:shadow-primary/5 bg-card/85 backdrop-blur-md rounded-2xl">
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
        <CardDescription>Update your personal information.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-6"
          >
            {/* Name */}
            <FormField
              control={form.control}
              name="user_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Avatar */}
            <FormField
              control={form.control}
              name="avatar_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Choose your avatar</FormLabel>
                  <FormControl>
                    <div className="flex gap-3 flex-wrap">
                      {AVATARS.map((avatar) => (
                        <button
                          type="button"
                          key={avatar.src}
                          onClick={() => field.onChange(avatar.src)}
                          className={clsx(
                            "rounded-full p-0.5 transition-all duration-200",
                            field.value === avatar.src
                              ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-110"
                              : "ring-1 ring-muted-foreground/10 hover:ring-muted-foreground/30 opacity-60 hover:opacity-100"
                          )}
                        >
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={avatar.src} alt={avatar.label} />
                            <AvatarFallback>{avatar.fallback}</AvatarFallback>
                          </Avatar>
                        </button>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email */}
            <FormField
              control={form.control}
              name="user_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      {...field}
                      disabled={true}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full h-11 font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/20 dark:shadow-blue-500/10 transition-all duration-300"
            >
              Save Changes
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
