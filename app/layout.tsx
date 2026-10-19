import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "../components/partials/Navbar";
import { Footer } from "@/components/partials/Footer";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AuthProvider } from "@/store/auth-context";
import { Toaster } from "@/components/ui/sonner";
import { ReactQueryProvider } from "@/components/providers/react-query-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "bideo",
  description: "A video sharing platform",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col relative`}
      >
        <ThemeProvider>
          <ReactQueryProvider>
            <AuthProvider>
              {/* Global Ambient Glow (consistent across entire site) */}
              <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden select-none">
                <div className="absolute -top-40 -left-40 w-80 h-80 sm:w-[500px] sm:h-[500px] bg-blue-500/10 dark:bg-blue-500/15 rounded-full blur-3xl" />
                <div className="absolute top-1/3 -right-40 w-80 h-80 sm:w-[500px] sm:h-[500px] bg-purple-500/10 dark:bg-purple-500/15 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 left-1/3 w-80 h-80 sm:w-[500px] sm:h-[500px] bg-pink-500/5 dark:bg-pink-500/10 rounded-full blur-3xl" />
              </div>

              <Navbar />
              <main className="flex-1 flex flex-col">{children}</main>
              <Footer />
            </AuthProvider>
            <Toaster />
          </ReactQueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
