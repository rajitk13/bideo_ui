import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import VideoCard from "@/components/video/VideoCard";
import { VideoDTO } from "@/types/video";

// Mock sonner toast
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe("VideoCard Component", () => {
  const baseVideo: VideoDTO = {
    videoId: 101,
    video_title: "Introduction to Antigravity",
    slug: "introduction-to-antigravity",
    video_uploadDate: new Date(Date.now() - 3600 * 1000).toISOString(), // 1 hour ago
    video_views: 4500,
    video_duration: "12:34",
    thumbnail_url: "https://example.com/thumb.jpg",
    videoStatus: "COMPLETED",
    video_uploader: {
      userId: "user_123",
      user_name: "Tech Guru",
      avatar_url: "https://example.com/avatar.jpg",
    },
  };

  it("renders video title, uploader name, and duration", () => {
    render(<VideoCard video={baseVideo} />);

    expect(screen.getByText("Introduction to Antigravity")).toBeInTheDocument();
    expect(screen.getByText("Tech Guru")).toBeInTheDocument();
    expect(screen.getByText("12:34")).toBeInTheDocument();
    expect(screen.getByText(/4\.5K views/i)).toBeInTheDocument();
  });

  it("links to /watch/[slug] when slug is present", () => {
    render(<VideoCard video={baseVideo} />);

    const links = screen.getAllByRole("link");
    const watchLink = links.find((link) =>
      link.getAttribute("href")?.includes("/watch/introduction-to-antigravity")
    );
    expect(watchLink).toBeDefined();
  });

  it("falls back to /video/[id]/view when slug is missing", () => {
    const videoWithoutSlug: VideoDTO = {
      ...baseVideo,
      slug: undefined,
      videoId: 202,
    };

    render(<VideoCard video={videoWithoutSlug} />);

    const links = screen.getAllByRole("link");
    const legacyLink = links.find((link) =>
      link.getAttribute("href")?.includes("/video/202/view")
    );
    expect(legacyLink).toBeDefined();
  });

  it("copies shareable link on clicking share button", async () => {
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockImplementation(() => Promise.resolve()),
      },
    });

    render(<VideoCard video={baseVideo} />);

    const shareButton = screen.getByRole("button", { name: /share video/i });
    fireEvent.click(shareButton);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining("/watch/introduction-to-antigravity")
    );
  });
});
