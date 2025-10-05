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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <ReactQueryProvider>
            <AuthProvider>
              <Navbar />
              {children}
            </AuthProvider>
            <Toaster />
            <Footer />
          </ReactQueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
