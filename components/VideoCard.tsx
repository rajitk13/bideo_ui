import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface VideoCardProps {
  title: string;
  thumbnailUrl: string;
  badges?: string[];
}

export function VideoCard({ title, thumbnailUrl, badges = [] }: VideoCardProps) {
  return (
    <Card className="w-full max-w-sm overflow-hidden rounded-2xl shadow-md">
      <CardHeader className="p-0">
        <div className="aspect-video w-full overflow-hidden">
          <img
            src={thumbnailUrl}
            alt={title}
            className="h-full w-full object-cover"
          />
        </div>
        <CardTitle className="p-4 text-lg">{title}</CardTitle>
      </CardHeader>

      <CardContent className="px-4 pb-2 flex flex-wrap gap-2">
        {badges.map((badge, idx) => (
          <Badge key={idx} variant="secondary">{badge}</Badge>
        ))}
      </CardContent>

      <CardFooter className="px-4 pb-4">
        <Button className="w-full" >
          Open Video
        </Button>
      </CardFooter>
    </Card>
  );
}
