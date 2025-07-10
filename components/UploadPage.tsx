"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function UploadPage() {
  const [videoTitle, setVideoTitle] = useState("");
  const [userId, setUserId] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !videoTitle) {
      toast.warning("Missing fields", {
        description: "Video and title are required.",
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("videoTitle", videoTitle);
    if (userId) formData.append("userId", userId);

    try {
      const res = await fetch("http://localhost:8080/upload", {
        method: "POST",
        body: formData,
      });

      const text = await res.text();
      if (res.ok) {
        toast.success("Upload successful", {
          description: text,
        });
        setFile(null);
        setVideoTitle("");
        setUserId("");
      } else {
        toast.error("Upload failed", {
          description: text,
        });
      }
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Upload error", {
        description: "Something went wrong.",
      });
    }
  };

  return (
    <div className="max-w-xl mx-auto py-12">
      <Card>
        <CardHeader>
          <CardTitle>Upload a Video</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="title">Video Title</Label>
              <Input
                id="title"
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                required
                placeholder="My Awesome Video"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="user">User ID (optional)</Label>
              <Input
                id="user"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="12345"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="file">Select Video File</Label>
              <Input
                id="file"
                type="file"
                accept="video/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                required
              />
            </div>

            <Button type="submit" className="w-full">
              Upload Video
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
