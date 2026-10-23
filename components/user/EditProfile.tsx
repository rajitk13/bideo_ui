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
import { useAuth, User } from "@/store/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import clsx from "clsx";
import { AVATARS } from "@/constants/avatars";
import { MESSAGES } from "@/constants/messages";
import { updateUser } from "@/utility/requests";
import { toast } from "sonner";
import { redirect } from "next/navigation";
import { AtSign, CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { useUsernameAvailability, cleanHandle } from "@/utility/useUsernameAvailability";

const schema = z.object({
  userId: z.string(),
  fullName: z.string().min(1, "Display name is required").max(100),
  username: z
    .string()
    .min(3, "Handle must be 3-30 characters")
    .max(30, "Handle must be 3-30 characters"),
  user_email: z.string().email("Invalid email address"),
  avatar_url: z.string().url(),
});

type ProfileFormData = z.infer<typeof schema>;

export default function EditProfile() {
  const { user, setUserInfo, fetchUser, token } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  const initialHandle = user?.username || user?.user_name || "";
  const {
    setUsername: setCheckedUsername,
    status,
    message,
    isAvailable,
    isChecking,
  } = useUsernameAvailability(initialHandle);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      userId: "",
      fullName: "",
      username: "",
      user_email: "",
      avatar_url: AVATARS[0].src,
    },
  });

  // Reset form when user data is loaded
  useEffect(() => {
    if (user) {
      const handle = user.username || user.user_name || "";
      form.reset({
        userId: user.userId,
        fullName: user.fullName || user.user_name || "",
        username: handle,
        user_email: user.user_email,
        avatar_url: user.avatar_url || AVATARS[0].src,
      });
      setCheckedUsername(handle);
      setIsLoading(false);
    } else {
      fetchUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const currentHandle = cleanHandle(form.watch("username"));
  const originalHandle = cleanHandle(user?.username || user?.user_name || "");
  const isUnchangedHandle = currentHandle.toLowerCase() === originalHandle.toLowerCase();

  const canSave = isUnchangedHandle || isAvailable;

  const onSubmit = async (data: ProfileFormData) => {
    const handle = cleanHandle(data.username);
    if (!isUnchangedHandle && !isAvailable) {
      toast.error("Please pick an available handle before saving.");
      return;
    }

    let userUpdated = false;
    try {
      if (!token) {
        toast.error(MESSAGES.USER_NOT_AUTHENTICATED);
        return;
      }
      const updatedUserPayload: User = {
        userId: data.userId,
        user_email: data.user_email,
        user_name: handle,
        username: handle,
        fullName: data.fullName.trim(),
        avatar_url: data.avatar_url,
        user_role: user?.user_role,
      };

      await updateUser(updatedUserPayload, token);
      setUserInfo(updatedUserPayload);
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
        <CardDescription>Update your creator details and public identity.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-6"
          >
            {/* Display Name / Full Name */}
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Name / Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Marques Brownlee" {...field} />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Human-readable name shown on your channel, videos, and comments.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Unique Handle (@username) */}
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Unique Handle</FormLabel>
                    {!isUnchangedHandle && status !== "idle" && (
                      <span
                        className={clsx(
                          "inline-flex items-center gap-1 text-[11px] font-semibold lowercase px-2 py-0.5 rounded-full border",
                          status === "available" && "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
                          status === "taken" && "text-rose-500 bg-rose-500/10 border-rose-500/20",
                          status === "checking" && "text-primary bg-primary/10 border-primary/20",
                          status === "invalid" && "text-amber-500 bg-amber-500/10 border-amber-500/20"
                        )}
                      >
                        {status === "checking" && <Loader2 className="w-3 h-3 animate-spin" />}
                        {status === "available" && <CheckCircle2 className="w-3 h-3" />}
                        {status === "taken" && <XCircle className="w-3 h-3" />}
                        {status === "invalid" && <AlertCircle className="w-3 h-3" />}
                        {message}
                      </span>
                    )}
                  </div>
                  <FormControl>
                    <div className="relative">
                      <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                      <Input
                        placeholder="mkbhd"
                        className={clsx(
                          "pl-10 font-mono text-sm",
                          !isUnchangedHandle && status === "available" && "border-emerald-500/50",
                          !isUnchangedHandle && status === "taken" && "border-rose-500/50",
                          !isUnchangedHandle && status === "invalid" && "border-amber-500/50"
                        )}
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          setCheckedUsername(e.target.value);
                        }}
                      />
                    </div>
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Alphanumeric and underscores only (3-30 chars). Used for routing (/channel/@handle).
                  </p>
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
              disabled={form.formState.isSubmitting || (!isUnchangedHandle && (!canSave || isChecking))}
              className="w-full h-11 font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/20 dark:shadow-blue-500/10 transition-all duration-300 disabled:opacity-50"
            >
              Save Changes
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
