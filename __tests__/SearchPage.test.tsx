import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SearchPage from "@/app/search/page";
import { searchVideos } from "@/utility/requests";
import { VideoDTO } from "@/types/video";

const mockPush = jest.fn();
let mockParams = new URLSearchParams();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => mockParams,
}));

jest.mock("@/utility/requests", () => ({
  searchVideos: jest.fn(),
}));

jest.mock("@/components/video/VideoCard", () => ({
  __esModule: true,
  default: ({ video }: { video: VideoDTO }) => (
    <div data-testid="video-card">{video.video_title}</div>
  ),
}));

describe("SearchPage Component", () => {
  const sampleVideos: VideoDTO[] = [
    {
      videoId: 101,
      video_title: "Learn Next.js 15",
      video_uploadDate: "2026-01-01",
      video_views: 1200,
      category: "TECH",
      tags: ["nextjs", "react"],
    },
    {
      videoId: 102,
      video_title: "Advanced TypeScript Guide",
      video_uploadDate: "2026-01-02",
      video_views: 3400,
      category: "EDUCATION",
      tags: ["typescript"],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockParams = new URLSearchParams();
  });

  it("renders search page and fetches videos on initial load", async () => {
    (searchVideos as jest.Mock).mockResolvedValue({
      content: sampleVideos,
      totalPages: 1,
      number: 0,
      last: true,
    });

    render(<SearchPage />);

    expect(screen.getByPlaceholderText(/search videos/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getAllByTestId("video-card")).toHaveLength(2);
    });
    expect(screen.getByText("Learn Next.js 15")).toBeInTheDocument();
    expect(screen.getByText("Advanced TypeScript Guide")).toBeInTheDocument();
  });

  it("initializes filters from URL search params", async () => {
    mockParams = new URLSearchParams("query=react&category=TECH&tag=hooks,frontend");

    (searchVideos as jest.Mock).mockResolvedValue({
      content: [sampleVideos[0]],
      totalPages: 1,
      number: 0,
      last: true,
    });

    render(<SearchPage />);

    expect(screen.getByDisplayValue("react")).toBeInTheDocument();
    expect(screen.getByText("#hooks")).toBeInTheDocument();
    expect(screen.getByText("#frontend")).toBeInTheDocument();

    await waitFor(() => {
      expect(searchVideos).toHaveBeenCalledWith(
        expect.objectContaining({
          query: "react",
          categories: ["TECH"],
          tags: ["hooks", "frontend"],
        })
      );
    });
  });

  it("submits a new search query via search form input", async () => {
    (searchVideos as jest.Mock).mockResolvedValue({
      content: sampleVideos,
      totalPages: 1,
      number: 0,
      last: true,
    });

    render(<SearchPage />);

    const input = screen.getByPlaceholderText(/search videos/i);
    fireEvent.change(input, { target: { value: "gaming clips" } });
    fireEvent.submit(input.closest("form")!);

    await waitFor(() => {
      expect(searchVideos).toHaveBeenCalledWith(
        expect.objectContaining({
          query: "gaming clips",
        })
      );
    });
  });

  it("clears query when clicking X inside the search input", async () => {
    (searchVideos as jest.Mock).mockResolvedValue({
      content: sampleVideos,
      totalPages: 1,
      number: 0,
      last: true,
    });

    render(<SearchPage />);

    const input = screen.getByPlaceholderText(/search videos/i);
    fireEvent.change(input, { target: { value: "test query" } });
    expect(screen.getByLabelText(/clear query/i)).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText(/clear query/i));
    expect(input).toHaveValue("");
  });

  it("removes individual tag filter when ✕ is clicked on badge", async () => {
    mockParams = new URLSearchParams("tag=react,nextjs");

    (searchVideos as jest.Mock).mockResolvedValue({
      content: sampleVideos,
      totalPages: 1,
      number: 0,
      last: true,
    });

    render(<SearchPage />);

    const removeReactBtn = screen.getByLabelText("Remove tag react");
    fireEvent.click(removeReactBtn);

    expect(screen.queryByText("#react")).not.toBeInTheDocument();
    expect(screen.getByText("#nextjs")).toBeInTheDocument();
  });

  it("clears all tags when 'Clear all tags' is clicked", async () => {
    mockParams = new URLSearchParams("tag=alpha,beta");

    (searchVideos as jest.Mock).mockResolvedValue({
      content: sampleVideos,
      totalPages: 1,
      number: 0,
      last: true,
    });

    render(<SearchPage />);

    const clearAllTagsBtn = screen.getByText(/clear all tags/i);
    fireEvent.click(clearAllTagsBtn);

    expect(screen.queryByText("#alpha")).not.toBeInTheDocument();
    expect(screen.queryByText("#beta")).not.toBeInTheDocument();
  });

  it("clears all active filters when Reset Filters button is clicked", async () => {
    mockParams = new URLSearchParams("query=antigravity&category=TECH&tag=ai");

    (searchVideos as jest.Mock).mockResolvedValue({
      content: sampleVideos,
      totalPages: 1,
      number: 0,
      last: true,
    });

    render(<SearchPage />);

    const resetBtn = screen.getByRole("button", { name: /reset filters/i });
    fireEvent.click(resetBtn);

    const input = screen.getByPlaceholderText(/search videos/i);
    expect(input).toHaveValue("");
    expect(screen.queryByText("#ai")).not.toBeInTheDocument();
  });

  it("displays empty state when search returns no videos", async () => {
    (searchVideos as jest.Mock).mockResolvedValue({
      content: [],
      totalPages: 0,
      number: 0,
      last: true,
    });

    render(<SearchPage />);

    await waitFor(() => {
      expect(screen.getByText(/no videos found/i)).toBeInTheDocument();
    });

    // Test "Clear all filters" button in empty state
    const emptyClearBtn = screen.getByRole("button", { name: /clear all filters/i });
    fireEvent.click(emptyClearBtn);
  });

  it("handles API error gracefully and displays empty state", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    (searchVideos as jest.Mock).mockRejectedValue(new Error("Network Error"));

    render(<SearchPage />);

    await waitFor(() => {
      expect(screen.getByText(/no videos found/i)).toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  });
});
