"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
  user_name: z.string().min(2, { message: "username is too short" }),
  avatar_url: z.string().url({ message: "Invalid avatar URL" }),
});

export function SignUpForm() {
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
    <Card>
      <CardHeader>
        <CardTitle>Create your account</CardTitle>
        <CardDescription>
          Enter your details below to create a new account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Avatar Selection */}
            <FormField
              control={form.control}
              name="avatar_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Choose your avatar</FormLabel>
                  <div className="flex gap-4">
                    {AVATARS.map((avatar) => (
                      <button
                        type="button"
                        key={avatar.src}
                        onClick={() => {
                          field.onChange(avatar.src);
                        }}
                        className={clsx(
                          "border-2 rounded-full p-1 transition-all",
                          field.value === avatar.src
                            ? "border-blue-500"
                            : "border-transparent"
                        )}
                      >
                        <Avatar>
                          <AvatarImage src={avatar.src} alt={avatar.label} />
                          <AvatarFallback>{avatar.fallback}</AvatarFallback>
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
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="jdoe" {...field} />
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
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="m@example.com" {...field} />
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
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              Sign Up
            </Button>
          </form>
        </Form>

        <div className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <Link href="/auth/login" className="underline underline-offset-4">
            Log in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
