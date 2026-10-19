import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentication | bideo",
  description: "Sign in or register for your bideo account",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
