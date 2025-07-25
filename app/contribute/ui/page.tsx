import { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import CodeBlock from "@/components/CodeBlock";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "Contributing Guide",
  description: "How to contribute to the UI repo using ShadCN and Next.js",
};

export default function ContributePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-4">
        🛠️ Contributing to the UI Repo
      </h1>
      <p className="text-muted-foreground mb-8">
        Thanks for your interest in contributing! This UI uses{" "}
        <strong>Next.js</strong> with <strong>ShadCN UI</strong>. The theme
        provider is already set up.
      </p>

      <Separator className="my-6" />

      <h2 className="text-2xl font-semibold mt-8 mb-2">🧱 Project Structure</h2>
      <Card>
        <CardContent className="font-mono text-sm p-4 whitespace-pre">
          {`
.
├── app/                  # Next.js app directory (App Router)
├── components/           # Reusable UI components (e.g., Button, Input)
├── styles/               # Global styles and Tailwind config
├── lib/                  # Utility functions or hooks
├── theme.config.ts       # ShadCN theme setup
└── ...
`}
        </CardContent>
      </Card>

      <h2 className="text-2xl font-semibold mt-8 mb-2">🚀 Getting Started</h2>
      <CodeBlock
        code={`git clone https://github.com/your-org/ui-repo.git\ncd ui-repo\npnpm install\npnpm dev`}
      />

      <h2 className="text-2xl font-semibold mt-8 mb-2">🌈 Theming (ShadCN)</h2>
      <p className="mb-4">
        We re using the <code>ThemeProvider</code> from ShadCN, configured in{" "}
        <code>app/layout.tsx</code> or <code>providers.tsx</code>.
      </p>
      <ul className="list-disc pl-5 space-y-1">
        <li>Dark mode and system theme are supported.</li>
        <li>
          No need to re-setup ShadCN. Use components directly from{" "}
          <code>@/components/ui/</code>.
        </li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-2">🧩 Adding Components</h2>
      <CodeBlock code={`npx shadcn-ui@latest add dialog`} />

      <h2 className="text-2xl font-semibold mt-8 mb-2">
        🧪 Testing & Storybook
      </h2>
      <CodeBlock code={`pnpm test\npnpm storybook`} />
      <p className="text-sm text-muted-foreground mt-1">
        *If your project includes these tools
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-2">
        🧼 Formatting & Linting
      </h2>
      <CodeBlock code={`pnpm lint\npnpm format`} />

      <h2 className="text-2xl font-semibold mt-8 mb-2">
        ✅ Pull Request Checklist
      </h2>
      <ul className="list-disc pl-5 space-y-2">
        <li>
          Your component matches the design system (attach a screenshot if
          needed).
        </li>
        <li>Responsive and accessible (keyboard + screen reader friendly).</li>
        <li>Dark mode tested.</li>
        <li>
          Use only <code>@/components/ui</code> or <code>@/lib</code> imports.
        </li>
        <li>Run linting and formatting before pushing.</li>
      </ul>

      <Separator className="my-6" />

      <p className="text-center text-muted-foreground mt-12">
        🙏 Every contribution helps. Thank you!
      </p>
    </div>
  );
}
