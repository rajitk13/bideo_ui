import { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Contribute to Bideo.tech",
  description:
    "Overview of the Bideo.tech project and how to contribute to its UI and backend",
};

export default function ContributeLandingPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-4">📽️ Contribute to Bideo.tech</h1>

      <p className="text-muted-foreground mb-6">
        <strong>Bideo.tech</strong> is a modern video-sharing platform built
        with a microfrontend architecture using:
      </p>
      <ul className="list-disc pl-5 space-y-1 mb-4 text-muted-foreground">
        <li>
          🌐 <strong>Next.js + shadcn/ui</strong> for the user interface
        </li>
        <li>
          🚀 <strong>Spring Boot</strong> backend with secure REST APIs
        </li>
        <li>
          ☁️ Firebase Auth, S3 for video storage, and RabbitMQ for async
          processing
        </li>
      </ul>

      <Separator className="my-6" />

      <h2 className="text-2xl font-semibold mb-4">🧑‍💻 Contribution Areas</h2>

      <Card className="mb-6">
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold mb-2">Frontend (UI)</h3>
          <p className="text-muted-foreground mb-4">
            The UI is built using Next.js App Router and styled with Tailwind
            CSS and shadcn/ui. It includes pages like Explore, Watch, and
            Upload.
          </p>
          <Link href="/contribute/ui">
            <Button>📂 View UI Contribution Guide</Button>
          </Link>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold mb-2">Backend (Spring Boot)</h3>
          <p className="text-muted-foreground mb-4">
            The backend handles video processing, user authentication (via
            Firebase), and REST APIs for video upload/viewing. Built with Spring
            Boot 3.x.
          </p>
          <Link href="/contribute/backend">
            <Button variant="secondary">
              📂 View Backend Contribution Guide
            </Button>
          </Link>
        </CardContent>
      </Card>

      <Separator className="my-6" />

      <p className="text-center text-muted-foreground mt-8">
        🧠 Whether you re fixing a bug or building a feature — your contribution
        matters.
      </p>
    </div>
  );
}
