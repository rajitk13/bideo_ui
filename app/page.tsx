import React from "react";
import { VideoCard } from "../components/VideoCard";

const videoData = Array.from({ length: 10 }, (_, i) => ({
  title: `Introduction to React #${i + 1}`,
  thumbnailUrl: "https://img.youtube.com/vi/dQw4w9WgXcQ/0.jpg",
  badges: ["React", "Beginner", "Frontend"],
}));

export default function Home() {
  return (
    <div className="min-h-screen py-10 px-4">
      <h1 className="text-4xl font-bold text-center mb-10">Welcome to My App</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-2 gap-6 max-w-7xl mx-auto">
        {videoData.map((video, index) => (
          <VideoCard
            key={index}
            title={video.title}
            thumbnailUrl={video.thumbnailUrl}
            badges={video.badges}
          />
        ))}
      </div>
      {/* <MediaPlayerPage/> */}
    </div>
  );
}
