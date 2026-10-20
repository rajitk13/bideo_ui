import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { EditVideoModal } from "@/components/video/EditVideoModal";
import { useAuth } from "@/store/auth-context";
import { updateVideoMetadata } from "@/utility/requests";
import { toast } from "sonner";
import { VideoDTO } from "@/types/video";

jest.mock("@/store/auth-context", () => ({
  useAuth: jest.fn(),
}));

jest.mock("@/utility/requests", () => ({
  updateVideoMetadata: jest.fn(),
}));

const mockInvalidateQueries = jest.fn();
jest.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({
    invalidateQueries: mockInvalidateQueries,
  }),
}));

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe("EditVideoModal Component", () => {
  const mockVideo: VideoDTO = {
    videoId: 10,
    video_title: "Original Video Title",
    description: "Original Description",
    category: "TECH",
    visibility: "PUBLIC",
    tags: ["tech", "coding"],
    video_uploadDate: "2026-01-01T00:00:00Z",
    video_views: 100,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders trigger button and opens dialog with current video metadata", () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { userId: "user-1" },
      token: "tok-1",
    });

    render(<EditVideoModal video={mockVideo} />);
    const trigger = screen.getByRole("button", { name: /^edit video$/i });
    expect(trigger).toBeInTheDocument();

    fireEvent.click(trigger);

    expect(screen.getByText("Edit Video Details")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Original Video Title")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Original Description")).toBeInTheDocument();
    expect(screen.getByDisplayValue("tech, coding")).toBeInTheDocument();
  });

  it("submits updated metadata and refreshes queries on success", async () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { userId: "user-1" },
      token: "tok-1",
    });
    (updateVideoMetadata as jest.Mock).mockResolvedValue({
      ...mockVideo,
      video_title: "Brand New Title",
    });

    render(<EditVideoModal video={mockVideo} />);
    fireEvent.click(screen.getByRole("button", { name: /^edit video$/i }));

    const titleInput = screen.getByDisplayValue("Original Video Title");
    fireEvent.change(titleInput, { target: { value: "Brand New Title" } });

    const saveButton = screen.getByRole("button", { name: /save changes/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(updateVideoMetadata).toHaveBeenCalledWith(
        10,
        "user-1",
        expect.objectContaining({
          videoTitle: "Brand New Title",
          description: "Original Description",
          tags: ["tech", "coding"],
        }),
        "tok-1"
      );
    });

    expect(toast.success).toHaveBeenCalledWith("Video metadata updated successfully!");
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ["userVideos"] });
  });

  it("disables save button and prevents submit when title is emptied", async () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { userId: "user-1" },
      token: "tok-1",
    });

    render(<EditVideoModal video={mockVideo} />);
    fireEvent.click(screen.getByRole("button", { name: /^edit video$/i }));

    const titleInput = screen.getByDisplayValue("Original Video Title");
    fireEvent.change(titleInput, { target: { value: "   " } });

    const saveButton = screen.getByRole("button", { name: /save changes/i });
    expect(saveButton).toBeDisabled();

    // Directly submitting form should trigger validation error toast
    const form = screen.getByRole("dialog").querySelector("form")!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Video title cannot be empty");
    });
    expect(updateVideoMetadata).not.toHaveBeenCalled();
  });

  it("handles update failure with error toast", async () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { userId: "user-1" },
      token: "tok-1",
    });
    (updateVideoMetadata as jest.Mock).mockRejectedValue(
      new Error("Database connection lost")
    );

    render(<EditVideoModal video={mockVideo} />);
    fireEvent.click(screen.getByRole("button", { name: /^edit video$/i }));

    const saveButton = screen.getByRole("button", { name: /save changes/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Database connection lost");
    });
  });
});
