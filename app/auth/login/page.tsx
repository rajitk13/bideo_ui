import { Suspense } from "react";
import { LoginForm } from "@/components/LoginForm";

export default function Page() {

  return (
    <div className="flex min-h-[80vh] w-full items-center justify-center">
      <div className="w-full max-w-sm">
        <Suspense fallback={<div>Loading login form...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
