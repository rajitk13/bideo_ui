"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { loginUser, verifyToken } from "../../utility/requests";
import { toast } from "sonner";
import { redirect, RedirectType } from "next/navigation";
import { useAuth } from "@/store/auth-context";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { MESSAGES } from "@/constants/messages";

const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { login } = useAuth();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("");

  useEffect(() => {
    const param = searchParams.get("status");
    if (param === "account-created") {
      setMessage(MESSAGES.ACCOUNT_CREATION_SUCCESS);
    } else if (param === "user-not-logged-in") {
      setTimeout(() => {
        toast.error(MESSAGES.USER_NOT_AUTHENTICATED);
      }, 500);
    }
  }, [searchParams]);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    let loggedIn = false;
    try {
      await loginUser(data)
        .then((res) => {
          if (!res || !res.idToken) {
            throw new Error(MESSAGES.LOGIN_FAILED_GENERIC);
          }
          return res.idToken;
        })
        .then(async (token) => {
          await verifyToken(token)
            .then((uid) => {
              if (!uid || !uid.id) {
                throw new Error(MESSAGES.LOGIN_FAILED_GENERIC);
              }
              return uid;
            })
            .then((uid) => {
              login(token, uid.id);
              toast.success(MESSAGES.LOGIN_SUCCESS);
              loggedIn = true;
            });
        });
    } catch (err) {
      console.error("Login failed", err);
      toast.error(MESSAGES.LOGIN_FAILED);
    } finally {
      setIsLoading(false);
    }

    if (loggedIn) {
      redirect("/", RedirectType.replace);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {message ? `${message}` : "Login to your account"}
        </CardTitle>
        <CardDescription>
          Enter your email below to login to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="m@example.com"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center">
                    <FormLabel>Password</FormLabel>
                    <Link
                      href="/auth/reset"
                      className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                    >
                      Forgot your password?
                    </Link>
                  </div>
                  <FormControl>
                    <Input type="password" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </Button>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/signup"
                className="underline underline-offset-4"
              >
                Sign up
              </Link>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
