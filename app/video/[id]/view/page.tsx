"use client";

import ViewVideo from "@/components/ViewVideo";
import { useParams } from "next/navigation";

export default function Page() {
  const params = useParams();
  const id = params.id as string;

  if (!id) {
    return (
      <div className="w-screen h-screen flex items-center justify-center text-muted-foreground">
        Loading video...
      </div>
    );
  }

  return (
    <div className="w-screen h-screen overflow-hidden">
      <ViewVideo id={id} />
    </div>
  );
}
