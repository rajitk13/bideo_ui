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

    it("supports multi-select categories and tags via SearchVideosParams object", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ content: [] }),
      });

      await searchVideos({
        query: "nextjs",
        categories: ["TECH", "GAMING"],
        tags: ["react", "frontend"],
        page: 1,
        size: 24,
      });

      expect(global.fetch).toHaveBeenCalledWith(
        `${api_instance}/vid/search?query=nextjs&category=TECH%2CGAMING&tag=react%2Cfrontend&page=1&size=24`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    });

    it("handles single category and tag inside params object", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ content: [] }),
      });

      await searchVideos({
        category: "EDUCATION",
        tag: "#tutorial",
      });

      expect(global.fetch).toHaveBeenCalledWith(
        `${api_instance}/vid/search?category=EDUCATION&tag=tutorial&page=0&size=12`,
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

  describe("verifyToken", () => {
    it("returns verified user id object on success", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ id: "uid123" }),
      });

      const res = await (await import("@/utility/requests")).verifyToken("valid-token");
      expect(res).toEqual({ id: "uid123" });
      expect(global.fetch).toHaveBeenCalledWith(
        `${api_instance}/app/verifyToken`,
        expect.objectContaining({
          method: "POST",
          body: "valid-token",
        })
      );
    });

    it("throws on failed verification", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        text: async () => "Invalid token signature",
      });

      await expect(
        (await import("@/utility/requests")).verifyToken("bad-token")
      ).rejects.toThrow("Token verification failed: Invalid token signature");
    });
  });

  describe("loginUser", () => {
    it("logs in user and sets auth session", async () => {
      global.fetch = jest.fn().mockImplementation((url) => {
        if (url === `${api_instance}/app/login`) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ idToken: "token-1", refreshToken: "ref-1" }),
          });
        }
        if (url === `${api_instance}/app/verifyToken`) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ id: "uid-abc" }),
          });
        }
        return Promise.resolve({ ok: true, json: async () => ({}) });
      });

      const { loginUser } = await import("@/utility/requests");
      const res = await loginUser({ email: "user@test.com", password: "pwd" });
      expect(res).toEqual({
        idToken: "token-1",
        refreshToken: "ref-1",
        uid: "uid-abc",
      });
      expect(global.fetch).toHaveBeenCalledWith(
        "/ui/auth/setSession",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ token: "token-1", uid: "uid-abc" }),
        })
      );
    });

    it("throws when login endpoint fails", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 401,
        text: async () => "Unauthorized credentials",
      });

      const { loginUser } = await import("@/utility/requests");
      await expect(
        loginUser({ email: "bad@test.com", password: "pwd" })
      ).rejects.toThrow("Login failed with status 401: Unauthorized credentials");
    });
  });

  describe("createUser", () => {
    it("creates user successfully", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        statusText: "Created",
      });

      const { createUser } = await import("@/utility/requests");
      const res = await createUser({
        email: "new@test.com",
        password: "pwd",
        user_name: "NewUser",
        avatar_url: "/avatar.png",
      });

      expect(res).toBe("Created");
      expect(global.fetch).toHaveBeenCalledWith(
        `${api_instance}/app/createUser`,
        expect.objectContaining({ method: "POST" })
      );
    });

    it("throws when creation fails", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 409,
        text: async () => "Email already exists",
      });

      const { createUser } = await import("@/utility/requests");
      await expect(
        createUser({
          email: "dup@test.com",
          password: "pwd",
          user_name: "Dup",
          avatar_url: "/avatar.png",
        })
      ).rejects.toThrow("User creation failed: 409 - Email already exists");
    });
  });

  describe("getVideoData", () => {
    it("fetches video data by id", async () => {
      const mockVideo = { videoId: 101, video_title: "Video 101" };
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => mockVideo,
      });

      const { getVideoData } = await import("@/utility/requests");
      const result = await getVideoData({ id: "101" });
      expect(result).toEqual(mockVideo);
      expect(global.fetch).toHaveBeenCalledWith(
        `${api_instance}/vid/view/101`,
        { cache: "no-store" }
      );
    });

    it("throws on error", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 404,
        text: async () => "Video not found",
      });

      const { getVideoData } = await import("@/utility/requests");
      await expect(getVideoData({ id: "999" })).rejects.toThrow(
        "Failed to Load Video: 404 - Video not found"
      );
    });
  });

  describe("getUser & updateUser", () => {
    it("fetches user by uid with auth header", async () => {
      const mockUser = {
        userId: "u123",
        user_name: "Test",
        user_email: "test@example.com",
        avatar_url: "/av.png",
      };
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => mockUser,
      });

      const { getUser } = await import("@/utility/requests");
      const res = await getUser("u123", "token123");
      expect(res).toEqual(mockUser);
      expect(global.fetch).toHaveBeenCalledWith(
        `${api_instance}/user/getUser/u123`,
        {
          headers: { Authorization: "Bearer token123" },
        }
      );
    });

    it("throws on getUser error", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 404,
        text: async () => "User missing",
      });

      const { getUser } = await import("@/utility/requests");
      await expect(getUser("u999", "tok")).rejects.toThrow(
        "Get user failed: 404 - User missing"
      );
    });

    it("updates user with form data and bearer token", async () => {
      global.fetch = jest.fn().mockResolvedValue({ ok: true });

      const { updateUser } = await import("@/utility/requests");
      await updateUser(
        {
          userId: "u123",
          user_name: "New Name",
          user_email: "test@example.com",
          avatar_url: "/new.png",
        },
        "token123"
      );

      expect(global.fetch).toHaveBeenCalledWith(
        `${api_instance}/user/update`,
        expect.objectContaining({
          method: "POST",
          headers: { Authorization: "Bearer token123" },
        })
      );
    });

    it("throws on updateUser failure", async () => {
      global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 500 });

      const { updateUser } = await import("@/utility/requests");
      await expect(
        updateUser(
          {
            userId: "u123",
            user_name: "New Name",
            user_email: "test@example.com",
            avatar_url: "/new.png",
          },
          "tok"
        )
      ).rejects.toThrow("Update user failed: 500");
    });
  });

  describe("uploadVideo & sendResetPasswordEmail", () => {
    it("posts video upload FormData", async () => {
      global.fetch = jest.fn().mockResolvedValue({ ok: true });
      const fakeFile = new File(["dummy content"], "test.mp4", {
        type: "video/mp4",
      });

      const { uploadVideo } = await import("@/utility/requests");
      await uploadVideo(
        { videoTitle: "My Upload", file: fakeFile, userId: "u123" },
        "token123"
      );

      expect(global.fetch).toHaveBeenCalledWith(
        `${api_instance}/vid/upload`,
        expect.objectContaining({
          method: "POST",
          headers: { Authorization: "Bearer token123" },
        })
      );
    });

    it("throws on uploadVideo failure", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 400,
        text: async () => "Corrupted file",
      });
      const fakeFile = new File(["dummy"], "test.mp4");

      const { uploadVideo } = await import("@/utility/requests");
      await expect(
        uploadVideo(
          { videoTitle: "My Upload", file: fakeFile, userId: "u123" },
          "token"
        )
      ).rejects.toThrow("Video upload failed: 400 - Corrupted file");
    });

    it("sends reset password email", async () => {
      global.fetch = jest.fn().mockResolvedValue({ ok: true });

      const { sendResetPasswordEmail } = await import("@/utility/requests");
      await sendResetPasswordEmail("reset@example.com");

      expect(global.fetch).toHaveBeenCalledWith(
        `${api_instance}/app/reset`,
        expect.objectContaining({ method: "POST" })
      );
    });

    it("throws on reset password email failure", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        text: async () => "Account not registered",
      });

      const { sendResetPasswordEmail } = await import("@/utility/requests");
      await expect(
        sendResetPasswordEmail("notfound@example.com")
      ).rejects.toThrow("User Password could not be reset : Account not registered");
    });
  });

  describe("fetchVideos, fetchUserVideos & deleteVideo", () => {
    it("fetches paginated videos", async () => {
      const mockData = { content: [] };
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => mockData,
      });

      const { fetchVideos } = await import("@/utility/requests");
      const res = await fetchVideos(2);
      expect(res).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith(
        `${api_instance}/vid/all?page=2&size=12`,
        { headers: { "Content-Type": "application/json" } }
      );
    });

    it("throws on fetchVideos failure", async () => {
      global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 500 });
      const { fetchVideos } = await import("@/utility/requests");
      await expect(fetchVideos(1)).rejects.toThrow("Fetch videos failed: 500");
    });

    it("fetches user specific videos", async () => {
      const mockData = { content: [] };
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => mockData,
      });

      const { fetchUserVideos } = await import("@/utility/requests");
      const res = await fetchUserVideos(0, "u123", "token123");
      expect(res).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith(
        `${api_instance}/vid/user/u123?page=0&size=10`,
        expect.objectContaining({
          credentials: "include",
          headers: { Authorization: "Bearer token123" },
        })
      );
    });

    it("throws on fetchUserVideos failure", async () => {
      global.fetch = jest.fn().mockResolvedValue({ ok: false });
      const { fetchUserVideos } = await import("@/utility/requests");
      await expect(fetchUserVideos(0, "u123", "tok")).rejects.toThrow(
        "Failed to fetch user videos"
      );
    });

    it("deletes user video", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        text: async () => "Video deleted",
      });

      const { deleteVideo } = await import("@/utility/requests");
      const res = await deleteVideo("u123", 55, "token123");
      expect(res).toBe("Video deleted");
      expect(global.fetch).toHaveBeenCalledWith(
        `${api_instance}/vid/user/u123/55`,
        expect.objectContaining({
          method: "POST",
          headers: { Authorization: "Bearer token123" },
        })
      );
    });

    it("throws on deleteVideo failure", async () => {
      global.fetch = jest.fn().mockResolvedValue({ ok: false });
      const { deleteVideo } = await import("@/utility/requests");
      await expect(deleteVideo("u123", 55, "tok")).rejects.toThrow(
        "Failed to fetch user videos"
      );
    });
  });

  describe("getPublicUser & getPublicUserVideos", () => {
    it("returns public user data on success", async () => {
      const mockUser = { userId: "pub1", user_name: "PublicCreator" };
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => mockUser,
      });

      const { getPublicUser } = await import("@/utility/requests");
      const res = await getPublicUser("pub1");
      expect(res).toEqual(mockUser);
      expect(global.fetch).toHaveBeenCalledWith(
        `${api_instance}/user/getUser/pub1`,
        { next: { revalidate: 60 } }
      );
    });

    it("returns null on getPublicUser failure or network exception", async () => {
      global.fetch = jest.fn().mockResolvedValue({ ok: false });
      const { getPublicUser } = await import("@/utility/requests");
      expect(await getPublicUser("missing")).toBeNull();

      global.fetch = jest.fn().mockRejectedValue(new Error("Network failed"));
      expect(await getPublicUser("network-err")).toBeNull();
    });

    it("returns public user videos on success", async () => {
      const mockFeed = { content: [{ videoId: 1 }] };
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => mockFeed,
      });

      const { getPublicUserVideos } = await import("@/utility/requests");
      const res = await getPublicUserVideos("pub1", 0, 24);
      expect(res).toEqual(mockFeed);
      expect(global.fetch).toHaveBeenCalledWith(
        `${api_instance}/vid/user/pub1?page=0&size=24`,
        { next: { revalidate: 60 } }
      );
    });

    it("returns null on getPublicUserVideos failure or exception", async () => {
      global.fetch = jest.fn().mockResolvedValue({ ok: false });
      const { getPublicUserVideos } = await import("@/utility/requests");
      expect(await getPublicUserVideos("missing")).toBeNull();

      global.fetch = jest.fn().mockRejectedValue(new Error("Net error"));
      expect(await getPublicUserVideos("net-err")).toBeNull();
    });
  });

  describe("fetchSystemHealth & recordVideoView", () => {
    it("fetches system health successfully", async () => {
      const mockHealth = { status: "UP", timestamp: 12345, services: {} };
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => mockHealth,
      });

      const { fetchSystemHealth } = await import("@/utility/requests");
      const res = await fetchSystemHealth();
      expect(res).toEqual(mockHealth);
      expect(global.fetch).toHaveBeenCalledWith(`${api_instance}/health`, {
        cache: "no-store",
      });
    });

    it("throws on system health failure", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 503,
      });

      const { fetchSystemHealth } = await import("@/utility/requests");
      await expect(fetchSystemHealth()).rejects.toThrow(
        "Health check returned HTTP 503"
      );
    });

    it("records video view successfully", async () => {
      global.fetch = jest.fn().mockResolvedValue({ ok: true });
      const { recordVideoView } = await import("@/utility/requests");
      const res = await recordVideoView(42);
      expect(res).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        `${api_instance}/vid/42/view`,
        expect.objectContaining({ method: "POST" })
      );
    });

    it("returns false when recording video view fails or throws", async () => {
      global.fetch = jest.fn().mockResolvedValue({ ok: false });
      const { recordVideoView } = await import("@/utility/requests");
      expect(await recordVideoView(42)).toBe(false);

      global.fetch = jest.fn().mockRejectedValue(new Error("Network fail"));
      expect(await recordVideoView(42)).toBe(false);
    });
  });
});

