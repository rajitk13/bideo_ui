import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Playlists | BuzzClips",
  robots: {
    index: false,
    follow: false,
  },
};

export default function PlaylistsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
