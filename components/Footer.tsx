import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full border-t mt-10 bg-background text-muted-foreground">
      <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row justify-between items-start gap-6 text-sm">
        {/* About / Brand Info */}
        <div className="max-w-md">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            About | bideo{" "}
            <span className="ml-1 text-muted-foreground text-sm font-normal">
              (ビデオ)
            </span>
          </h3>
          <p>
            Bideo is a modern platform built to share, explore, and enjoy videos
            from around the world. Crafted with passion by a small team of
            developers who love video and tech.
          </p>
        </div>

        {/* Creator Info */}
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Creators
          </h3>
          <ul className="space-y-1">
            <li>
              <Link
                href="https://github.com/rajitkuthiala"
                target="_blank"
                className="hover:underline"
              >
                Rajit Kuthiala
              </Link>
            </li>
            <li>
              <Link
                href="https://linkedin.com/in/rajitkuthiala"
                target="_blank"
                className="hover:underline"
              >
                LinkedIn
              </Link>
            </li>
          </ul>
        </div>

        {/* Quick Links */}
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Quick Links
          </h3>
          <ul className="space-y-1">
            <li>
              <Link href="/" className="hover:underline">
                Home
              </Link>
            </li>
            <li>
              <Link href="/videos" className="hover:underline">
                All Videos
              </Link>
            </li>
            <li>
              <Link href="/video/upload" className="hover:underline">
                Upload
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t text-center py-4 text-xs text-muted-foreground">
        © {new Date().getFullYear()} Bideo (ビデオ) MIT License
      </div>
    </footer>
  );
}
