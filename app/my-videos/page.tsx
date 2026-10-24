import type { Metadata } from "next";
import MyVideos from "@/components/user/MyVideos";

export const metadata: Metadata = {
  title: "My Videos | BuzzClips",
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return <MyVideos />;
}
