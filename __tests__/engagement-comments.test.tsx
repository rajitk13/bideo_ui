import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { renderHook } from "@testing-library/react";
import EngagementButtons from "@/components/video/EngagementButtons";
import CommentsSection from "@/components/video/CommentsSection";
import useResumePlayback from "@/utility/useResumePlayback";
import { useAuth } from "@/store/auth-context";

jest.mock("@/store/auth-context", () => ({
  useAuth: jest.fn(),
}));

// Mock sonner toast
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

describe("EngagementButtons & CommentsSection", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({
      token: "fake-token",
      user: { userId: "u1", user_name: "TestUser" },
      login: jest.fn(),
      logout: jest.fn(),
      isAuthenticated: true,
      isLoading: false,
    });
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  describe("EngagementButtons", () => {
    it("renders initial engagement and handles like toggling with optimistic update", async () => {
      global.fetch = jest.fn().mockImplementation((url) => {
        if (typeof url === "string" && url.includes("/engagement")) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              videoId: 42,
              likesCount: 15,
              dislikesCount: 2,
              userReaction: "NONE",
            }),
          });
        }
        if (typeof url === "string" && url.includes("/like")) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              videoId: 42,
              likesCount: 16,
              dislikesCount: 2,
              userReaction: "LIKE",
            }),
          });
        }
        return Promise.resolve({ ok: true, json: async () => ({}) });
      });

      render(
        <EngagementButtons
          videoId={42}
          initialEngagement={{
            videoId: 42,
            likesCount: 15,
            dislikesCount: 2,
            userReaction: "NONE",
          }}
        />
      );

      expect(screen.getByText("15")).toBeInTheDocument();

      const likeBtn = screen.getByLabelText("Like video");
      fireEvent.click(likeBtn);

      // Verify optimistic update
      expect(screen.getByText("16")).toBeInTheDocument();
    });

    it("requires sign in when clicking like without token", () => {
      const { toast } = require("sonner");
      (useAuth as jest.Mock).mockReturnValue({
        user: null,
        login: jest.fn(),
        logout: jest.fn(),
        isAuthenticated: false,
        isLoading: false,
      });

      render(<EngagementButtons videoId={42} />);

      const likeBtn = screen.getByLabelText("Like video");
      fireEvent.click(likeBtn);

      expect(toast.error).toHaveBeenCalledWith(
        "Please sign in to like this video"
      );
    });
  });

  describe("CommentsSection", () => {
    it("renders comments with clickable timestamps that trigger onSeekTo", async () => {
      const mockComments = {
        content: [
          {
            commentId: 1,
            videoId: 42,
            content: "Check out the intro at 01:23 and the finale at 04:50!",
            createdAt: new Date().toISOString(),
            isPinned: true,
            user: {
              userId: "u2",
              user_name: "Alice",
            },
          },
        ],
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => mockComments,
      });

      const mockSeekTo = jest.fn();

      render(<CommentsSection videoId={42} onSeekTo={mockSeekTo} />);

      await waitFor(() => {
        expect(screen.getByText("Alice")).toBeInTheDocument();
      });

      expect(screen.getByText("Pinned")).toBeInTheDocument();

      // Look for the parsed timestamp button "01:23"
      const timestampBtn = screen.getByRole("button", { name: "01:23" });
      expect(timestampBtn).toBeInTheDocument();

      fireEvent.click(timestampBtn);
      // 01:23 = 83 seconds
      expect(mockSeekTo).toHaveBeenCalledWith(83);
    });

    it("allows submitting a comment when authenticated", async () => {
      global.fetch = jest.fn().mockImplementation((url, opts) => {
        if (opts?.method === "POST") {
          return Promise.resolve({ ok: true, json: async () => ({}) });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ content: [] }),
        });
      });

      render(<CommentsSection videoId={42} />);

      const input = screen.getByPlaceholderText(/Add a comment/i);
      fireEvent.change(input, { target: { value: "Awesome tutorial!" } });

      const submitBtn = screen.getByRole("button", { name: /Comment/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining("/comments"),
          expect.objectContaining({ method: "POST" })
        );
      });
    });
  });

  describe("useResumePlayback", () => {
    it("fetches saved progress and seeks player on mount", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          videoId: 42,
          progressSeconds: 45,
          completed: false,
        }),
      });

      const mockPlayerRef = {
        current: {
          seekTo: jest.fn(),
          getCurrentTime: jest.fn().mockReturnValue(50),
          getDuration: jest.fn().mockReturnValue(300),
        },
      };

      const { result } = renderHook(() =>
        useResumePlayback({
          videoId: 42,
          playerRef: mockPlayerRef as any,
          token: "fake-token",
        })
      );

      await waitFor(() => {
        expect(mockPlayerRef.current.seekTo).toHaveBeenCalledWith(
          45,
          "seconds"
        );
      });

      // Trigger time update
      result.current.onTimeUpdate();
    });
  });
});
