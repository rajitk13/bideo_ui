"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import Link from "next/link";

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
import { toast } from "sonner";
import { sendResetPasswordEmail } from "../../utility/requests";
import { Mail, ArrowLeft, Loader2, KeyRound } from "lucide-react";

const resetSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type ResetFormValues = z.infer<typeof resetSchema>;

export function ResetPasswordForm() {
  const form = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      email: "",
    },
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const onSubmit = async (data: ResetFormValues) => {
    setIsLoading(true);
    try {
      await sendResetPasswordEmail(data.email);
      setIsSent(true);
      toast.success("Reset password link sent to your email.");
    } catch (err) {
      console.error("Reset email error:", err);
      toast.error("Failed to send reset link. Try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border border-border/50 shadow-xl dark:shadow-2xl dark:shadow-purple-500/5 bg-card/85 backdrop-blur-md rounded-2xl">
      <CardHeader className="space-y-1 pb-2">
        {/* Decorative gradient bar */}
        <div className="h-1 w-16 rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 mb-4" />

        <CardTitle className="text-2xl font-bold tracking-tight">
          Reset password
        </CardTitle>
        <CardDescription className="text-muted-foreground/80">
          Enter your email and we&apos;ll send you a password reset link
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isSent ? (
          <div className="space-y-5 text-center py-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Mail className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-foreground">Check your inbox</h3>
              <p className="text-sm text-muted-foreground">
                We sent a password reset link to{" "}
                <span className="font-medium text-foreground">
                  {form.getValues("email")}
                </span>
              </p>
            </div>
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors pt-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to sign in
            </Link>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
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
                          disabled={isLoading}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full h-11 font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/20 dark:shadow-blue-500/10 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/30"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending link...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <KeyRound className="h-4 w-4" />
                    Send Reset Link
                  </span>
                )}
              </Button>

              <div className="text-center pt-1">
                <Link
                  href="/auth/login"
                  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to sign in
                </Link>
              </div>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
}
