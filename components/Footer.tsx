import Link from "next/link";
import { Github } from "lucide-react";

const creators = [
  {
    name: "Ayushmaan Aggarwal",
    linkedin: "https://www.linkedin.com/in/ayushmaan9/",
    github: "https://github.com/Mist-AA",
  },

  {
    name: "Rajit Kuthiala",
    linkedin: "https://linkedin.com/in/rajitkuthiala",
    github: "https://github.com/rajitk13",
  }
];

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
            2 developers who love tech.
          </p>
        </div>

        {/* Creator Info */}
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-semibold text-foreground mb-2 text-center">Creators</h3>
          <div className="flex gap-6 flex-wrap">
            {creators.map((creator) => (
              <div key={creator.name} className="flex flex-col items-center gap-1">
                <Link
                  href={creator.linkedin}
                  target="_blank"
                  className="hover:underline text-sm text-muted-foreground"
                >
                  {creator.name}
                </Link>
                <Link
                  href={creator.github}
                  target="_blank"
                  className="text-muted-foreground hover:text-black"
                >
                  <Github className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
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
