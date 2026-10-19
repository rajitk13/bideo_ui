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
    <div className="relative min-h-[calc(100vh-4.5rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden">
      {/* Background ambient decorative glows */}
      <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden select-none">
        <div className="absolute -top-32 -left-32 w-80 h-80 sm:w-96 sm:h-96 bg-blue-500/10 dark:bg-blue-500/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 sm:w-96 sm:h-96 bg-purple-500/10 dark:bg-purple-500/15 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 sm:w-[480px] sm:h-[480px] bg-pink-500/5 dark:bg-pink-500/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {children}
      </div>
    </div>
  );
}
