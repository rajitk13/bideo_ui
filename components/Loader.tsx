import { cn } from "@/lib/utils"; // optional utility from shadcn

export function LoaderOverlay({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-cente backdrop-blur-sm",
        className
      )}
    ></div>
  );
}
