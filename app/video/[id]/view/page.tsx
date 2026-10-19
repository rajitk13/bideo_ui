"use client";

import ViewVideo from "@/components/video/ViewVideo";
import { useParams } from "next/navigation";

export default function Page() {
  const params = useParams();
  const id = params.id as string;

  if (!id) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return <ViewVideo id={id} />;
}
