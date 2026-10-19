import UploadPage from "@/components/video/UploadPage";

export default function Page() {
  return (
    <div className="flex-1 flex w-full items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-sm">
        <UploadPage />
      </div>
    </div>
  );
}
