import React from "react";
import { render, screen } from "@testing-library/react";
import { ReelsContainer } from "@/components/reels/ReelsContainer";
import { VideoDTO } from "@/types/video";

// Mock react-player
jest.mock("react-player", () => {
  return function MockReactPlayer() {
    return <div data-testid="mock-react-player" />;
  };
});

// Mock Auth Context
jest.mock("@/store/auth-context", () => ({
  useAuth: () => ({
    token: null,
    isAuthenticated: false,
    user: null,
  }),
}));

const mockVideos: VideoDTO[] = [
  {
    videoId: 101,
    video_title: "Top 5 Tech Tips for Web Developers",
    slug: "top-5-tech-tips",
    video_uploadDate: "2026-06-01T00:00:00Z",
    video_views: 1200,
    m3u8Url: "https://example.com/stream1.m3u8",
    category: "TECH",
    video_uploader: {
      userId: "u1",
      user_name: "TechGuru",
      username: "techguru",
      fullName: "Tech Guru",
    },
  },
  {
    videoId: 102,
    video_title: "Insane Cricket Six in Last Over",
    slug: "cricket-six",
    video_uploadDate: "2026-06-02T00:00:00Z",
    video_views: 45000,
    m3u8Url: "https://example.com/stream2.m3u8",
    category: "SPORTS",
    video_uploader: {
      userId: "u2",
      user_name: "SportsFan",
      username: "sportsfan",
      fullName: "Sports Fanatic",
    },
  },
];

describe("ReelsContainer Component", () => {
  it("renders empty state when no videos are provided", () => {
    render(<ReelsContainer initialVideos={[]} />);
    expect(screen.getByText("No Reels Available Yet")).toBeInTheDocument();
  });

  it("renders video reels when video list is provided", () => {
    render(<ReelsContainer initialVideos={mockVideos} />);
    expect(
      screen.getByText("Top 5 Tech Tips for Web Developers")
    ).toBeInTheDocument();
    expect(screen.getByText("Insane Cricket Six in Last Over")).toBeInTheDocument();
  });

  it("displays creator names and desktop reel index counter", () => {
    render(<ReelsContainer initialVideos={mockVideos} />);
    expect(screen.getByText("Tech Guru")).toBeInTheDocument();
    expect(screen.getByText(/1 \/ 2/)).toBeInTheDocument();
  });
});
