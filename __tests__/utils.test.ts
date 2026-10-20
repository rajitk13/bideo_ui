import { cn } from "@/lib/utils";
import { MESSAGES } from "@/constants/messages";
import { AVATARS } from "@/constants/avatars";

describe("Utility Functions & Constants", () => {
  describe("cn (classnames merge)", () => {
    it("merges multiple class strings", () => {
      expect(cn("px-4", "py-2")).toBe("px-4 py-2");
    });

    it("resolves Tailwind conflicts favoring the last class", () => {
      expect(cn("px-4", "px-6")).toBe("px-6");
      expect(cn("bg-red-500", "bg-blue-500")).toBe("bg-blue-500");
    });

    it("handles conditional and falsey values cleanly", () => {
      const isVisible = false;
      const isPrimary = true;
      expect(
        cn("text-sm", isVisible && "block", isPrimary && "text-primary", null, undefined)
      ).toBe("text-sm text-primary");
    });
  });

  describe("Constants Integrity", () => {
    it("exports all required user and video messages", () => {
      expect(MESSAGES.USER_NOT_AUTHENTICATED).toBeDefined();
      expect(MESSAGES.FILE_UPLOADED).toBeDefined();
      expect(MESSAGES.FILE_UPLOAD_FAILED).toBeDefined();
      expect(MESSAGES.EXPLORE_VIDEO_ERROR).toBeDefined();
      expect(MESSAGES.END_OF_VIDEO_LIST).toBeDefined();
    });

    it("exports non-empty avatar presets with image paths", () => {
      expect(Array.isArray(AVATARS)).toBe(true);
      expect(AVATARS.length).toBeGreaterThan(0);
      AVATARS.forEach((avatar) => {
        expect(avatar).toHaveProperty("label");
        expect(avatar).toHaveProperty("src");
        expect(avatar).toHaveProperty("fallback");
        expect(typeof avatar.src).toBe("string");
      });
    });
  });
});
