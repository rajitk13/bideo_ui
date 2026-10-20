const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

function resolveGitCommitSha() {
  // 1. Check environment variables
  const envSha =
    process.env.NEXT_PUBLIC_GIT_COMMIT_SHA ||
    process.env.GIT_COMMIT ||
    process.env.GITHUB_SHA;

  if (envSha && envSha.trim() && envSha.trim() !== "dev") {
    return envSha.trim().slice(0, 7);
  }

  // 2. Try git CLI if available
  try {
    const gitSha = execSync("git rev-parse --short HEAD", {
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim();
    if (gitSha) return gitSha.slice(0, 7);
  } catch {
    // git CLI unavailable or not a git repo
  }

  // 3. Inspect .git directory directly with pure Node.js (no git CLI needed)
  try {
    const gitDir = path.join(__dirname, "..", ".git");
    if (fs.existsSync(gitDir)) {
      const head = fs.readFileSync(path.join(gitDir, "HEAD"), "utf8").trim();
      if (!head.startsWith("ref:")) {
        return head.slice(0, 7);
      }
      const refPath = head.replace(/^ref:\s*/, "");
      const fullRefPath = path.join(gitDir, refPath);
      if (fs.existsSync(fullRefPath)) {
        return fs.readFileSync(fullRefPath, "utf8").trim().slice(0, 7);
      }
      const packedRefs = path.join(gitDir, "packed-refs");
      if (fs.existsSync(packedRefs)) {
        const content = fs.readFileSync(packedRefs, "utf8");
        for (const line of content.split("\n")) {
          if (line.includes(refPath)) {
            return line.split(" ")[0].slice(0, 7);
          }
        }
      }
    }
  } catch {
    // .git directory unreadable
  }

  // 4. Try existing build-info.json fallback
  try {
    const buildInfoPath = path.join(__dirname, "..", "build-info.json");
    if (fs.existsSync(buildInfoPath)) {
      const existing = JSON.parse(fs.readFileSync(buildInfoPath, "utf8"));
      if (existing.commitSha && existing.commitSha !== "dev") {
        return existing.commitSha.slice(0, 7);
      }
    }
  } catch {
    // ignore
  }

  return "dev";
}

function resolveBuildNumber() {
  const envBuild =
    process.env.NEXT_PUBLIC_BUILD_NUMBER ||
    process.env.BUILD_NUMBER ||
    "";

  if (envBuild && envBuild.trim()) {
    return envBuild.trim();
  }

  try {
    const buildInfoPath = path.join(__dirname, "..", "build-info.json");
    if (fs.existsSync(buildInfoPath)) {
      const existing = JSON.parse(fs.readFileSync(buildInfoPath, "utf8"));
      if (existing.buildNumber) return existing.buildNumber.toString();
    }
  } catch {
    // ignore
  }

  return "";
}

const commitSha = resolveGitCommitSha();
const buildNumber = resolveBuildNumber();

const buildInfo = {
  commitSha,
  buildNumber,
  generatedAt: new Date().toISOString(),
};

const rootDir = path.join(__dirname, "..");
const buildInfoPath = path.join(rootDir, "build-info.json");
fs.writeFileSync(buildInfoPath, JSON.stringify(buildInfo, null, 2) + "\n");

// Write to .env.production.local for Next.js build-time inlining
const envProdPath = path.join(rootDir, ".env.production.local");
const envContent = [
  `NEXT_PUBLIC_GIT_COMMIT_SHA=${commitSha}`,
  `NEXT_PUBLIC_BUILD_NUMBER=${buildNumber}`,
].join("\n") + "\n";

fs.writeFileSync(envProdPath, envContent);

console.log(
  `✅ Generated build metadata: commit=${commitSha}, build=${buildNumber || "none"}`
);
