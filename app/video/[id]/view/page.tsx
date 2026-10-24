import { redirect, RedirectType } from "next/navigation";

export default async function LegacyVideoViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/watch/${id}`, RedirectType.replace);
}
