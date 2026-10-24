import type { Metadata } from "next";
import UploadPage from "@/components/video/UploadPage";

export const metadata: Metadata = {
  title: "Upload Video | BuzzClips",
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return (
    <div className="flex-1 flex w-full items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-xl">
        <UploadPage />
      </div>
    </div>
  );
}
