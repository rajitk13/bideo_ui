/**
 * @jest-environment node
 */

import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import { GET as oembedHandler } from "@/app/api/oembed/route";
import { getVideoBySlug } from "@/utility/requests";

jest.mock("@/utility/requests", () => ({
  getVideoBySlug: jest.fn(),
  getVideoById: jest.fn(),
}));

describe("SEO & Indexing Infrastructure", () => {
  describe("app/robots.ts", () => {
    it("returns compliant robots rules and sitemap links", () => {
      const robotsConfig = robots();

      expect(robotsConfig.host).toBe("https://bideo.rajit.cc");
      expect(robotsConfig.sitemap).toContain(
        "https://bideo.rajit.cc/sitemap.xml"
      );
      expect(robotsConfig.sitemap).toContain(
        "https://bideo.rajit.cc/video-sitemap.xml"
      );

      const rules = Array.isArray(robotsConfig.rules)
        ? robotsConfig.rules
        : [robotsConfig.rules];

      // Verify Googlebot-Video is specifically accounted for
      const botRule = rules.find(
        (r) =>
          Array.isArray(r.userAgent) && r.userAgent.includes("Googlebot-Video")
      );
      expect(botRule).toBeDefined();
      expect(botRule?.allow).toContain("/watch/*");
      expect(botRule?.disallow).toContain("/my-videos");
    });
  });

  describe("app/sitemap.ts", () => {
    const originalFetch = global.fetch;

    afterAll(() => {
      global.fetch = originalFetch;
    });

    it("includes core static pages and video pages", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          content: [
            {
              videoId: 1,
              slug: "awesome-video",
              videoStatus: "COMPLETED",
              visibility: "PUBLIC",
              video_uploadDate: "2026-01-01T00:00:00Z",
            },
            {
              videoId: 2,
              slug: "private-video",
              videoStatus: "COMPLETED",
              visibility: "PRIVATE", // should be excluded
            },
          ],
        }),
      });

      const sitemapEntries = await sitemap();

      expect(sitemapEntries.some((e) => e.url === "https://bideo.rajit.cc")).toBe(
        true
      );
      expect(
        sitemapEntries.some(
          (e) => e.url === "https://bideo.rajit.cc/watch/awesome-video"
        )
      ).toBe(true);
      expect(
        sitemapEntries.some(
          (e) => e.url === "https://bideo.rajit.cc/watch/private-video"
        )
      ).toBe(false);
    });
    it("handles missing slug, missing uploadDate, and error fallbacks in sitemap", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          content: [
            {
              videoId: 777,
              videoStatus: undefined, // test !v.videoStatus branch
              visibility: "PUBLIC",
              video_uploadDate: null, // test fallback to new Date()
            },
          ],
        }),
      });

      const sitemapEntries = await sitemap();
      expect(
        sitemapEntries.some((e) => e.url === "https://bideo.rajit.cc/watch/777")
      ).toBe(true);

      // Test res.ok = false
      global.fetch = jest.fn().mockResolvedValue({ ok: false });
      const fallbackEntries = await sitemap();
      expect(fallbackEntries.length).toBeGreaterThan(0);

      // Test fetch exception
      global.fetch = jest.fn().mockRejectedValue(new Error("Network failure"));
      const caughtEntries = await sitemap();
      expect(caughtEntries.length).toBeGreaterThan(0);
    });
  });

  describe("app/api/oembed/route.ts", () => {
    it("returns 400 when url param is missing", async () => {
      const req = new Request("https://bideo.rajit.cc/api/oembed");
      const res = await oembedHandler(req);

      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe("Missing required 'url' parameter");
    });

    it("returns valid oEmbed video object when video is found", async () => {
      (getVideoBySlug as jest.Mock).mockResolvedValue({
        videoId: 99,
        video_title: "How to Code",
        slug: "how-to-code",
        thumbnail_url: "https://bideo.rajit.cc/thumb.jpg",
        video_uploader: {
          userId: "dev_1",
          user_name: "Coder",
        },
      });

      const req = new Request(
        "https://bideo.rajit.cc/api/oembed?url=https%3A%2F%2Fbideo.rajit.cc%2Fwatch%2Fhow-to-code&maxwidth=800&maxheight=450"
      );
      const res = await oembedHandler(req);

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.type).toBe("video");
      expect(json.title).toBe("How to Code");
      expect(json.author_name).toBe("Coder");
      expect(json.provider_name).toBe("bideo");
      expect(json.width).toBe(1280);
      expect(json.height).toBe(720);
      expect(json.html).toContain("iframe");
    });

    it("resolves numeric id via getVideoById", async () => {
      const { getVideoById } = await import("@/utility/requests");
      (getVideoById as jest.Mock).mockResolvedValue({
        videoId: 555,
        video_title: "Numeric Video",
        video_uploader: null,
      });

      const req = new Request(
        "https://bideo.rajit.cc/api/oembed?url=https%3A%2F%2Fbideo.rajit.cc%2Fwatch%2F555"
      );
      const res = await oembedHandler(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.title).toBe("Numeric Video");
      expect(json.author_name).toBe("bideo Creator");
    });

    it("returns 404 when url format is unrecognized or invalid", async () => {
      const req = new Request(
        "https://bideo.rajit.cc/api/oembed?url=https%3A%2F%2Fotherdomain.com%2Funknown"
      );
      const res = await oembedHandler(req);
      expect(res.status).toBe(404);
    });

    it("returns 404 when video cannot be resolved", async () => {
      (getVideoBySlug as jest.Mock).mockRejectedValue(new Error("Not found"));

      const req = new Request(
        "https://bideo.rajit.cc/api/oembed?url=https%3A%2F%2Fbideo.rajit.cc%2Fwatch%2Fnon-existent"
      );
      const res = await oembedHandler(req);

      expect(res.status).toBe(404);
    });
  });
});
