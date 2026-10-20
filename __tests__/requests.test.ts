import {
  getVideoBySlug,
  getVideoById,
  updateVideoMetadata,
  searchVideos,
} from "@/utility/requests";
import { api_instance } from "@/global";
import { VideoDTO, VideoMetadataUpdateRequest } from "@/types/video";

describe("Video Requests Utility", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  describe("getVideoBySlug", () => {
    it("should fetch video by slug successfully", async () => {
      const mockVideo: Partial<VideoDTO> = {
        videoId: 10,
        video_title: "Test Video",
        slug: "test-video",
        video_uploadDate: "2026-01-01",
        video_views: 100,
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => mockVideo,
      });

      const result = await getVideoBySlug("test-video");

      expect(global.fetch).toHaveBeenCalledWith(
        `${api_instance}/vid/slug/test-video`,
        { cache: "no-store" }
      );
      expect(result).toEqual(mockVideo);
    });

    it("should properly URL-encode the slug parameter", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ videoId: 1 }),
      });

      await getVideoBySlug("test video with spaces");

      expect(global.fetch).toHaveBeenCalledWith(
        `${api_instance}/vid/slug/test%20video%20with%20spaces`,
        { cache: "no-store" }
      );
    });

    it("should throw an error when video is not found", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 404,
        text: async () => "Not Found",
      });

      await expect(getVideoBySlug("unknown-slug")).rejects.toThrow(
        "Failed to load video by slug: 404 - Not Found"
      );
    });
  });

  describe("getVideoById", () => {
    it("should fetch video by numeric ID successfully", async () => {
      const mockVideo: Partial<VideoDTO> = {
        videoId: 42,
        video_title: "My Video",
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => mockVideo,
      });

      const result = await getVideoById(42);

      expect(global.fetch).toHaveBeenCalledWith(
        `${api_instance}/vid/view/42`,
        { cache: "no-store" }
      );
      expect(result).toEqual(mockVideo);
    });

    it("should throw an error when response is not ok", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 500,
        text: async () => "Internal Server Error",
      });

      await expect(getVideoById(999)).rejects.toThrow(
        "Failed to load video: 500 - Internal Server Error"
      );
    });
  });

  describe("updateVideoMetadata", () => {
    it("should send PUT request with updated metadata and authorization header", async () => {
      const payload: VideoMetadataUpdateRequest = {
        videoTitle: "Updated Title",
        description: "New description",
        category: "TECH",
        visibility: "PUBLIC",
        tags: ["react", "testing"],
      };

      const mockResponse: Partial<VideoDTO> = {
        videoId: 5,
        video_title: "Updated Title",
        category: "TECH",
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await updateVideoMetadata(
        5,
        "user_abc",
        payload,
        "jwt_token_123"
      );

      expect(global.fetch).toHaveBeenCalledWith(
        `${api_instance}/vid/5?userId=user_abc`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer jwt_token_123",
          },
          body: JSON.stringify(payload),
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it("should throw when update fails", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 403,
        text: async () => "Forbidden",
      });

      await expect(
        updateVideoMetadata(5, "user_abc", { videoTitle: "Test" }, "bad_token")
      ).rejects.toThrow("Failed to update video metadata: 403 - Forbidden");
    });
  });

  describe("searchVideos", () => {
    it("should construct search query string with all parameters", async () => {
      const mockResult = {
        content: [],
        number: 0,
        totalPages: 1,
        last: true,
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResult,
      });

      const result = await searchVideos("spring", "TECH", "backend", 1, 10);

      expect(global.fetch).toHaveBeenCalledWith(
        `${api_instance}/vid/search?query=spring&category=TECH&tag=backend&page=1&size=10`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      expect(result).toEqual(mockResult);
    });

    it("should ignore ALL category and empty strings in query parameters", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ content: [] }),
      });

      await searchVideos("", "ALL", "", 0, 12);

      expect(global.fetch).toHaveBeenCalledWith(
        `${api_instance}/vid/search?page=0&size=12`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    });

    it("should throw when search endpoint fails", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 500,
      });

      await expect(searchVideos("error")).rejects.toThrow(
        "Search videos failed: 500"
      );
    });
  });
});
