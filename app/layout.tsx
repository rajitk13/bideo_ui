import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "../components/partials/Navbar";
import { Footer } from "@/components/partials/Footer";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AuthProvider } from "@/store/auth-context";
import { Toaster } from "@/components/ui/sonner";
import { ReactQueryProvider } from "@/components/providers/react-query-provider";
import {
  SITE_URL,
  generateWebSiteSchema,
  generateOrganizationSchema,
} from "@/utility/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "BuzzClips - Next-Gen Video Streaming & Entertainment Platform",
    template: "%s | BuzzClips",
  },
  description:
    "Explore, share, and stream high-quality videos on BuzzClips. Powered by adaptive HLS streaming, fast discovery, creator channels, and community entertainment.",
  keywords: [
    "buzzclips",
    "buzzclips app",
    "video streaming",
    "watch videos",
    "shorts",
    "reels",
    "video platform",
    "HLS streaming",
    "video creators",
    "video sharing",
    "entertainment platform",
  ],
  icons: {
    icon: "/favicon.ico",
  },
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "BuzzClips",
    title: "BuzzClips - Next-Gen Video Streaming Platform",
    description:
      "Explore, share, and stream high-quality videos on BuzzClips. Powered by adaptive HLS streaming and creator tools.",
    images: [
      {
        url: `${SITE_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "BuzzClips - Next-Gen Video Streaming Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BuzzClips - Next-Gen Video Streaming Platform",
    description:
      "Explore, share, and stream high-quality videos on BuzzClips.",
    images: [`${SITE_URL}/opengraph-image`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const websiteSchema = generateWebSiteSchema(SITE_URL);
  const organizationSchema = generateOrganizationSchema(SITE_URL);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="dns-prefetch" href="https://buzzclips.app" />
        <link rel="preconnect" href="https://buzzclips.app" />
        <script
          id="global-website-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema),
          }}
        />
        <script
          id="global-org-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
      </head>
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
