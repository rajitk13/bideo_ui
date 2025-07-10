import UploadPage from "@/components/UploadPage";

export default function Page() {
  return (
    <div className="flex min-h-[80vh] w-full items-center justify-center">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-4">Upload Video</h1>
        <UploadPage />
      </div>
    </div>
  );
}
