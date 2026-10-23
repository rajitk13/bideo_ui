import Link from "next/link";
import { Github, Linkedin, GitCommit } from "lucide-react";

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
  },
];

let fallbackBuildInfo: { commitSha?: string; buildNumber?: string } = {};
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  fallbackBuildInfo = require("@/build-info.json");
} catch {
  // build-info.json may not exist in test runner or before build
}

export function Footer() {
  const envSha = process.env.NEXT_PUBLIC_GIT_COMMIT_SHA;
  const commitSha = envSha ?? fallbackBuildInfo.commitSha ?? "dev";
  const buildNumber =
    process.env.NEXT_PUBLIC_BUILD_NUMBER ??
    fallbackBuildInfo.buildNumber ??
    "";
  const shortSha = commitSha.length > 7 ? commitSha.slice(0, 7) : commitSha;
  const commitUrl =
    commitSha !== "dev"
      ? `https://github.com/rajitk13/bideo_ui/commit/${shortSha}`
      : "https://github.com/rajitk13/bideo_ui";

  return (
    <footer className="w-full border-t mt-auto bg-background/80 backdrop-blur-sm text-muted-foreground">
      <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row justify-between items-start gap-6 text-sm">
        {/* About / Brand Info */}
        <div className="max-w-md">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            About | BuzzClips{" "}
          </h3>
          <p>
            BuzzClips is a modern platform built to share, explore, and enjoy videos
            from around the world. Crafted with passion by a small team of 2
            developers who love tech.
          </p>
        </div>

        {/* Creator Info */}
        <div className="flex flex-col gap-4">
          <h3 className="text-xl font-bold text-foreground mb-2">Creators</h3>
          <div className="flex flex-col gap-3">
            {creators.map((creator) => (
              <div
                key={creator.name}
                className="flex items-center justify-between gap-4"
              >
                <span className="text-base font-medium text-foreground">
                  {creator.name}
                </span>
                <div className="flex gap-3">
                  <Link
                    href={creator.linkedin}
                    target="_blank"
                    aria-label={`${creator.name} on LinkedIn`}
                    className="text-muted-foreground hover:text-blue-600 transition-colors"
                  >
                    <Linkedin className="w-5 h-5" />
                  </Link>
                  <Link
                    href={creator.github}
                    target="_blank"
                    aria-label={`${creator.name} on GitHub`}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Github className="w-5 h-5" />
                  </Link>
                </div>
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
              <Link href="/video/upload" prefetch={false} className="hover:underline">
                Upload
              </Link>
            </li>
            <li>
              <Link href="/contribute" className="hover:underline">
                Contribute
              </Link>
            </li>
            <li>
              <Link href="/tech-stack" className="hover:underline">
                Tech Stack
              </Link>
            </li>
            <li>
              <Link href="/status" className="hover:underline flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                System Status
              </Link>
            </li>
          </ul>
        </div>

        {/* Legal & Policies */}
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Legal & Trust
          </h3>
          <ul className="space-y-1">
            <li>
              <Link href="/terms" className="hover:underline">
                Terms of Service
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:underline">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/dmca" className="hover:underline">
                Copyright / DMCA
              </Link>
            </li>
            <li>
              <Link href="/guidelines" className="hover:underline">
                Community Guidelines
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t py-4 text-xs text-muted-foreground">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 text-center">
          <span>© {new Date().getFullYear()} BuzzClips | MIT License</span>
          <span className="hidden sm:inline text-muted-foreground/30">•</span>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-muted/60 hover:bg-muted text-muted-foreground border border-border/50 transition-colors">
            <span className="text-[11px] font-medium text-muted-foreground/80">
              build:
            </span>
            <Link
              href={commitUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[11px] font-semibold text-foreground/80 hover:text-primary transition-colors flex items-center gap-1"
              title={
                buildNumber
                  ? `Build #${buildNumber} (${commitSha})`
                  : `Commit ${commitSha}`
              }
            >
              <GitCommit className="w-3 h-3 text-muted-foreground" />
              <span>
                {buildNumber ? `#${buildNumber} • ${shortSha}` : shortSha}
              </span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
