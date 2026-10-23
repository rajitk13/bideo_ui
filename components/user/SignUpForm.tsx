"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import clsx from "clsx";
import { createUser } from "../../utility/requests";
import { toast } from "sonner";
import { redirect, RedirectType } from "next/navigation";
import { MESSAGES } from "@/constants/messages";
import { AVATARS } from "@/constants/avatars"; // Adjust the import path as necessary
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Loader2, UserPlus } from "lucide-react";

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
  user_name: z.string().min(2, { message: "username is too short" }),
  avatar_url: z.string().url({ message: "Invalid avatar URL" }),
});

export function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      user_name: "",
      avatar_url: AVATARS[0].src,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await createUser(values);
      toast.success(MESSAGES.ACCOUNT_CREATED);
      setTimeout(() => {
        redirect("/auth/login?status=account-created", RedirectType.replace);
      }, 500);
    } catch (err) {
      toast.error(MESSAGES.ACCOUNT_CREATION_FAILED + `: ${err}`);
    }
  };

  return (
    <Card className="border border-border/50 shadow-xl dark:shadow-2xl dark:shadow-purple-500/5 bg-card/85 backdrop-blur-md rounded-2xl">
      <CardHeader className="space-y-1 pb-2">
        {/* Decorative gradient bar */}
        <div className="h-1 w-16 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 mb-4" />

        <CardTitle className="text-2xl font-bold tracking-tight">
          Create your account
        </CardTitle>
        <CardDescription className="text-muted-foreground/80">
          Join BuzzClips and start sharing videos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Avatar Selection */}
            <FormField
              control={form.control}
              name="avatar_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Choose your avatar
                  </FormLabel>
                  <div className="flex gap-3 flex-wrap">
                    {AVATARS.map((avatar) => (
                      <button
                        type="button"
                        key={avatar.src}
                        onClick={() => {
                          field.onChange(avatar.src);
                        }}
                        className={clsx(
                          "rounded-full p-0.5 transition-all duration-200",
                          field.value === avatar.src
                            ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-110"
                            : "ring-1 ring-muted-foreground/10 hover:ring-muted-foreground/30 opacity-60 hover:opacity-100"
                        )}
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={avatar.src} alt={avatar.label} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
                            {avatar.fallback}
                          </AvatarFallback>
                        </Avatar>
                      </button>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Name */}
            <FormField
              control={form.control}
              name="user_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Username
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                      <Input
                        placeholder="johndoe"
                        className="pl-10 h-11 bg-muted/30 border-muted-foreground/10 focus-visible:border-primary/50 transition-colors"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Email
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                      <Input
                        placeholder="you@example.com"
                        className="pl-10 h-11 bg-muted/30 border-muted-foreground/10 focus-visible:border-primary/50 transition-colors"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Password
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-10 pr-10 h-11 bg-muted/30 border-muted-foreground/10 focus-visible:border-primary/50 transition-colors"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                        tabIndex={-1}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-11 font-semibold bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white shadow-lg shadow-pink-500/20 dark:shadow-pink-500/10 transition-all duration-300 hover:shadow-xl hover:shadow-pink-500/30"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating account...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Create Account
                  <ArrowRight className="h-4 w-4 ml-1" />
                </span>
              )}
            </Button>
          </form>
        </Form>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-muted-foreground/10" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-card px-3 text-muted-foreground/60">or</span>
          </div>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            Sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
