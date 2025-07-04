'use client';
import { LoginForm } from "@/components/LoginForm";
import { loginUser } from "@/utility/getRequests";
import { useEffect } from "react";

export default function Page() {

  return (
    <div className="flex min-h-svh w-full items-center justify-center">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}
