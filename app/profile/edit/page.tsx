import EditProfile from "@/components/user/EditProfile";

export default function Page() {
  return (
    <div className="flex-1 flex w-full items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-sm">
        <EditProfile />
      </div>
    </div>
  );
}
