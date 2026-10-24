import type { Metadata } from "next";
import { SITE_URL } from "@/utility/seo";

export const metadata: Metadata = {
  title: "Search Videos & Creators | BuzzClips",
  description: "Search for trending videos, topics, and creators on BuzzClips.",
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: `${SITE_URL}/search`,
  },
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
