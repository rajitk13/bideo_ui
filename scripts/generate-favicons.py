#!/usr/bin/env python3
"""
Generate Google Search-compliant Favicons and App Icons for BuzzClips.

Google Search Favicon Guidelines:
- Must be a multiple of 48px square (48x48, 96x96, 144x144, 192x192, etc.).
- 16x16 / 32x32 alone is ignored by Google Search.
- Must be crawlable by Googlebot and Googlebot-Image.
- Supported formats: SVG, PNG, ICO.
"""

import math
from PIL import Image, ImageDraw

def create_buzzclips_icon(size=512):
    """
    Renders the official BuzzClips badge at the given pixel resolution.
    Gradient: #3b82f6 (blue) -> #a855f7 (purple) -> #ec4899 (pink)
    Inner symbol: centered white play triangle
    """
    # Supersample 4x for ultra-smooth anti-aliasing
    scale = 4
    w = size * scale
    h = size * scale

    # Create high-res image with transparent background
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Rounded rectangle dimensions with ~6% padding to survive Google's circular crop
    pad = int(w * 0.05)
    r = int(w * 0.22)  # Corner radius

    # Generate multi-stop diagonal gradient mask
    # From top-left (blue) to bottom-right (pink)
    # Stop 0.0: #3b82f6 (59, 130, 246)
    # Stop 0.5: #a855f7 (168, 85, 247)
    # Stop 1.0: #ec4899 (236, 72, 153)
    c1 = (59, 130, 246)
    c2 = (168, 85, 247)
    c3 = (236, 72, 153)

    grad = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    grad_draw = ImageDraw.Draw(grad)

    for y in range(h):
        for x in range(w):
            # Diagonal factor: (x + y) / (w + h)
            t = (x + y) / (w + h)
            t = max(0.0, min(1.0, t))
            if t < 0.5:
                sub_t = t / 0.5
                red = int(c1[0] + (c2[0] - c1[0]) * sub_t)
                green = int(c1[1] + (c2[1] - c1[1]) * sub_t)
                blue = int(c1[2] + (c2[2] - c1[2]) * sub_t)
            else:
                sub_t = (t - 0.5) / 0.5
                red = int(c2[0] + (c3[0] - c2[0]) * sub_t)
                green = int(c2[1] + (c3[1] - c2[1]) * sub_t)
                blue = int(c2[2] + (c3[2] - c2[2]) * sub_t)
            # Store pixel directly (faster via scanline or draw point)

    # An optimized way to draw gradient: draw lines perpendicular to diagonal
    diag_max = w + h
    for d in range(diag_max):
        t = d / diag_max
        if t < 0.5:
            sub_t = t / 0.5
            r_col = int(c1[0] + (c2[0] - c1[0]) * sub_t)
            g_col = int(c1[1] + (c2[1] - c1[1]) * sub_t)
            b_col = int(c1[2] + (c2[2] - c1[2]) * sub_t)
        else:
            sub_t = (t - 0.5) / 0.5
            r_col = int(c2[0] + (c3[0] - c2[0]) * sub_t)
            g_col = int(c2[1] + (c3[1] - c2[1]) * sub_t)
            b_col = int(c2[2] + (c3[2] - c2[2]) * sub_t)
        color = (r_col, g_col, b_col, 255)
        # Line from (d, 0) to (0, d)
        grad_draw.line([(d, 0), (0, d)], fill=color, width=2)

    # Mask for squircle
    mask = Image.new("L", (w, h), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.rounded_rectangle(
        [pad, pad, w - pad, h - pad],
        radius=r,
        fill=255
    )

    # Composite gradient with mask
    badge = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    badge.paste(grad, (0, 0), mask=mask)

    # Draw centered Play triangle inside badge
    play_draw = ImageDraw.Draw(badge)
    # Triangle geometry (optical center slightly shifted right to account for arrow centroid)
    center_x = w / 2.0 + (w * 0.02)
    center_y = h / 2.0
    tri_size = w * 0.28  # Radius

    # Equilateral triangle pointing right:
    # Right vertex: center_x + tri_size, center_y
    # Top-left vertex: center_x - tri_size * 0.5, center_y - tri_size * 0.866
    # Bottom-left vertex: center_x - tri_size * 0.5, center_y + tri_size * 0.866
    p1 = (center_x + tri_size * 1.05, center_y)
    p2 = (center_x - tri_size * 0.55, center_y - tri_size * 0.92)
    p3 = (center_x - tri_size * 0.55, center_y + tri_size * 0.92)

    play_draw.polygon([p1, p2, p3], fill=(255, 255, 255, 255))

    # Downsample using high quality Lanczos filter
    final_img = badge.resize((size, size), Image.Resampling.LANCZOS)
    return final_img

def main():
    print("Generating Google-compliant BuzzClips icons...")

    # 1. Generate base 512x512 master icon
    master_512 = create_buzzclips_icon(512)
    master_512.save("public/icon-512.png", "PNG", optimize=True)
    print("Saved public/icon-512.png (512x512)")

    # 2. Generate 192x192 (PWA / Google multiple: 48 * 4)
    icon_192 = master_512.resize((192, 192), Image.Resampling.LANCZOS)
    icon_192.save("public/icon-192.png", "PNG", optimize=True)
    print("Saved public/icon-192.png (192x192)")

    # 3. Generate 180x180 (Apple Touch Icon)
    icon_180 = master_512.resize((180, 180), Image.Resampling.LANCZOS)
    icon_180.save("public/apple-touch-icon.png", "PNG", optimize=True)
    print("Saved public/apple-touch-icon.png (180x180)")

    # 4. Generate 144x144 (Google multiple: 48 * 3)
    icon_144 = master_512.resize((144, 144), Image.Resampling.LANCZOS)
    icon_144.save("public/icon-144.png", "PNG", optimize=True)
    print("Saved public/icon-144.png (144x144)")

    # 5. Generate 96x96 (Google multiple: 48 * 2)
    icon_96 = master_512.resize((96, 96), Image.Resampling.LANCZOS)
    icon_96.save("public/icon-96.png", "PNG", optimize=True)
    print("Saved public/icon-96.png (96x96)")

    # 6. Generate 48x48 (Google minimum multiple: 48 * 1)
    icon_48 = master_512.resize((48, 48), Image.Resampling.LANCZOS)
    icon_48.save("public/icon-48.png", "PNG", optimize=True)
    print("Saved public/icon-48.png (48x48)")

    # 7. Generate 32x32 & 16x16 for ICO embedding
    icon_32 = master_512.resize((32, 32), Image.Resampling.LANCZOS)
    icon_16 = master_512.resize((16, 16), Image.Resampling.LANCZOS)

    # 8. Multi-size favicon.ico (includes 16, 32, 48, 64, 128, 256)
    master_512.save(
        "public/favicon.ico",
        format="ICO",
        sizes=[(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
    )
    print("Saved public/favicon.ico with multi-resolution layers (16, 32, 48, 64, 128, 256)")

    # Also copy 48x48 icon to app/ for Next.js App Router default discovery
    icon_48.save("app/icon.png", "PNG", optimize=True)
    icon_180.save("app/apple-icon.png", "PNG", optimize=True)
    master_512.save(
        "app/favicon.ico",
        format="ICO",
        sizes=[(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
    )
    print("Saved app/icon.png, app/apple-icon.png, app/favicon.ico for Next.js file-based discovery")

if __name__ == "__main__":
    main()
