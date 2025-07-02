import { Badge } from "@/components/ui/badge";

interface VideoCardProps {
  title: string;
  thumbnailUrl: string;
  badges?: string[];
}

export function VideoCard({ title, thumbnailUrl, badges = [] }: VideoCardProps) {
  return (
    <div className="relative w-120 h-80 overflow-hidden border border-gray-200 shadow-sm">
      {/* Thumbnail as full background */}
      <img
        src={thumbnailUrl}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Text & badges at bottom */}
      <div className="absolute bottom-0 left-0 w-full bg-black/60 text-white text-xs p-2">
        <div className="truncate">{title}</div>
        {badges?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {badges.map((badge, idx) => (
              <Badge
                key={idx}
                variant="secondary"
                className="bg-white/70 text-black text-[10px] px-1 py-0.5"
              >
                {badge}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
