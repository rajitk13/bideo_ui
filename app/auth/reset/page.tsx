import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/user/ResetPasswordForm";

export default function Page() {
  return (
    <div className="flex min-h-[80vh] w-full items-center justify-center">
      <div className="w-full max-w-sm">
        <Suspense fallback={<div>Loading reset form...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
