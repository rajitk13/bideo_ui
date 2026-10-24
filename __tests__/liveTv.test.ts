import {
  INDIAN_LIVE_CHANNELS,
  CHANNEL_CATEGORIES,
} from "@/constants/liveChannels";
import { generateLiveTvSchema } from "@/utility/seo";

describe("Indian Live TV Infrastructure & SEO", () => {
  it("has a valid and populated list of Indian FTA channels", () => {
    expect(INDIAN_LIVE_CHANNELS.length).toBeGreaterThanOrEqual(10);

    INDIAN_LIVE_CHANNELS.forEach((channel) => {
      expect(channel.id).toBeDefined();
      expect(channel.name.trim().length).toBeGreaterThan(0);
      expect(channel.hindiName.trim().length).toBeGreaterThan(0);
      expect(channel.category).toBeDefined();
      expect(channel.streamUrl).toContain(".m3u8");
      expect(channel.broadcaster.trim().length).toBeGreaterThan(0);
      expect(channel.language.length).toBeGreaterThan(0);
    });
  });

  it("includes flagship Doordarshan channels (National, News, Sports)", () => {
    const ids = INDIAN_LIVE_CHANNELS.map((c) => c.id);
    expect(ids).toContain("dd-national");
    expect(ids).toContain("dd-news");
    expect(ids).toContain("dd-sports");
    expect(ids).toContain("dd-india");
    expect(ids).toContain("sansad-tv-loksabha");
  });

  it("contains valid category definitions with Hindi translations", () => {
    expect(CHANNEL_CATEGORIES.length).toBeGreaterThanOrEqual(5);
    const categoryIds = CHANNEL_CATEGORIES.map((c) => c.id);
    expect(categoryIds).toContain("ALL");
    expect(categoryIds).toContain("NATIONAL");
    expect(categoryIds).toContain("NEWS");
    expect(categoryIds).toContain("SPORTS");

    CHANNEL_CATEGORIES.forEach((cat) => {
      expect(cat.label.length).toBeGreaterThan(0);
      expect(cat.hindiLabel.length).toBeGreaterThan(0);
    });
  });

  it("generates Google-compliant BroadcastService and BroadcastEvent Schema", () => {
    const ddNational = INDIAN_LIVE_CHANNELS.find((c) => c.id === "dd-national")!;
    const schema = generateLiveTvSchema(ddNational, "https://buzzclips.app");

    expect(schema["@context"]).toBe("https://schema.org");
    expect(schema["@graph"]).toBeInstanceOf(Array);
    expect(schema["@graph"].length).toBe(2);

    const broadcastService = schema["@graph"].find(
      (item) => item["@type"] === "BroadcastService"
    );
    expect(broadcastService).toBeDefined();
    expect(broadcastService?.areaServed).toEqual({
      "@type": "Country",
      name: "India",
    });
    expect(broadcastService?.isLiveBroadcast).toBe(true);

    const broadcastEvent = schema["@graph"].find(
      (item) => item["@type"] === "BroadcastEvent"
    );
    expect(broadcastEvent).toBeDefined();
    expect(broadcastEvent?.isLiveBroadcast).toBe(true);
    expect(broadcastEvent?.video["@type"]).toBe("VideoObject");
    expect(broadcastEvent?.video.contentUrl).toBe(ddNational.streamUrl);
  });
});
