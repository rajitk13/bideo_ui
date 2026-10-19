"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useEffect, useState, useRef } from "react";
import {
  Loader2,
  UploadCloud,
  FileVideo,
  X,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  LogIn,
  Film,
} from "lucide-react";
import axios from "axios";
import { api_instance } from "@/global";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "../ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useAuth } from "@/store/auth-context";
import { MESSAGES } from "@/constants/messages";

const MAX_FILE_SIZE_MB = 50;

const formSchema = z.object({
  videoTitle: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title cannot exceed 100 characters"),
  file: z
    .any()
    .refine(
      (file) => typeof window !== "undefined" && file instanceof File,
      "Video file is required"
    ),
  userId: z.string(),
});


export default function UploadPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      videoTitle: "",
      file: null as unknown as File,
      userId: user?.userId || "",
    },
  });

  const { setValue, watch, reset, formState } = form;
  const selectedFile: File | null = watch("file");
  const videoTitle = watch("videoTitle") || "";

  useEffect(() => {
    if (user?.userId) {
      setValue("userId", user.userId);
    }
  }, [user, setValue]);

  const handleFileSelection = (file: File | null) => {
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      toast.error("Please select a valid video file (MP4, WebM, MOV, etc.)");
      return;
    }

    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > MAX_FILE_SIZE_MB) {
      toast.error(
        `File size (${fileSizeMB.toFixed(1)}MB) exceeds the maximum limit of ${MAX_FILE_SIZE_MB}MB.`
      );
      return;
    }

    setValue("file", file, { shouldValidate: true });

    // Auto-fill title from filename if title is currently empty
    if (!videoTitle.trim()) {
      const cleanName = file.name
        .replace(/\.[^/.]+$/, "")
        .replace(/[-_]/g, " ");
      setValue("videoTitle", cleanName.slice(0, 100), { shouldValidate: true });
    }
  };

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setValue("file", null as unknown as File, { shouldValidate: true });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const uploadVideo = async (
    data: z.infer<typeof formSchema>,
    token: string,
    onProgress: (percent: number) => void
  ) => {
    const formData = new FormData();
    formData.append("videoTitle", data.videoTitle);
    formData.append("file", data.file);
    formData.append("userId", data.userId);

    return axios.post(`${api_instance}/vid/upload`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (event) => {
        if (event.total) {
          const percent = Math.round((event.loaded * 100) / event.total);
          onProgress(percent);
        }
      },
    });
  };

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!token) {
      toast.error(MESSAGES.USER_NOT_AUTHENTICATED);
      return;
    }

    setUploadProgress(0);

    try {
      await uploadVideo(values, token, setUploadProgress);
      toast.success(MESSAGES.FILE_UPLOADED);
      setIsUploaded(true);
      reset({
        videoTitle: "",
        file: null as unknown as File,
        userId: user?.userId || "",
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error(error);
      toast.error(MESSAGES.FILE_UPLOAD_FAILED);
    } finally {
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  // If user is not authenticated
  if (!user) {
    return (
      <Card className="border border-border/50 shadow-xl dark:shadow-2xl dark:shadow-primary/5 bg-card/85 backdrop-blur-md rounded-2xl text-center p-8 space-y-5">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
          <UploadCloud className="w-7 h-7" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-xl font-bold tracking-tight">Upload Studio</h2>
          <p className="text-sm text-muted-foreground">
            You need to be logged in to upload and share videos on bideo.
          </p>
        </div>
        <Link href="/auth/login" className="block pt-2">
          <Button className="w-full h-11 font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/20">
            <LogIn className="w-4 h-4 mr-2" />
            Sign In to Upload
          </Button>
        </Link>
      </Card>
    );
  }

  // Upload success screen
  if (isUploaded) {
    return (
      <Card className="border border-border/50 shadow-xl dark:shadow-2xl dark:shadow-primary/5 bg-card/85 backdrop-blur-md rounded-2xl overflow-hidden text-center p-8 space-y-6">
        <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 ring-8 ring-emerald-500/5">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">
            Upload Successful!
          </h2>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Your video has been uploaded and queued for HLS transcoding. It will
            be available in your library shortly.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Button
            variant="outline"
            onClick={() => setIsUploaded(false)}
            className="h-10"
          >
            Upload Another Video
          </Button>
          <Button
            onClick={() => router.push("/my-videos")}
            className="h-10 font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md shadow-blue-500/20"
          >
            View My Videos
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border border-border/50 shadow-xl dark:shadow-2xl dark:shadow-primary/5 bg-card/85 backdrop-blur-md rounded-2xl overflow-hidden">
      {/* Decorative gradient top bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

      <CardHeader className="space-y-1.5 pb-4">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 w-fit mb-1">
          <Sparkles className="w-3 h-3" />
          Upload Studio
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">
          Upload a Video
        </CardTitle>
        <CardDescription className="text-muted-foreground text-sm">
          Publish your video to bideo. Automatic HLS encoding will generate adaptive streams.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-2">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            {/* Drag and Drop Zone */}
            <FormField
              control={form.control}
              name="file"
              render={() => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Video File
                  </FormLabel>
                  <FormControl>
                    <div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="video/*"
                        className="hidden"
                        onChange={(e) =>
                          handleFileSelection(e.target.files?.[0] || null)
                        }
                        disabled={formState.isSubmitting}
                      />

                      {!selectedFile ? (
                        <div
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          onClick={() => fileInputRef.current?.click()}
                          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
                            isDragging
                              ? "border-primary bg-primary/10 scale-[1.01]"
                              : "border-border/70 hover:border-primary/50 bg-muted/20 hover:bg-muted/40"
                          }`}
                        >
                          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
                            <UploadCloud className="w-6 h-6" />
                          </div>
                          <p className="text-sm font-semibold text-foreground">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            MP4, WebM, MOV, or MKV up to {MAX_FILE_SIZE_MB}MB
                          </p>
                          <div className="flex items-center justify-center gap-2 mt-4">
                            <Badge
                              variant="outline"
                              className="text-[11px] font-medium bg-background/50"
                            >
                              Up to {MAX_FILE_SIZE_MB}MB
                            </Badge>
                            <Badge
                              variant="outline"
                              className="text-[11px] font-medium bg-background/50"
                            >
                              Auto Transcoding
                            </Badge>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between p-4 rounded-xl border border-border/60 bg-muted/30">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                              <FileVideo className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold truncate text-foreground">
                                {selectedFile.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {(
                                  selectedFile.size /
                                  (1024 * 1024)
                                ).toFixed(2)}{" "}
                                MB • Ready to upload
                              </p>
                            </div>
                          </div>

                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={handleRemoveFile}
                            disabled={formState.isSubmitting}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                            title="Remove file"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Video Title Input */}
            <FormField
              control={form.control}
              name="videoTitle"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Video Title
                    </FormLabel>
                    <span className="text-[11px] text-muted-foreground">
                      {videoTitle.length}/100
                    </span>
                  </div>
                  <FormControl>
                    <div className="relative">
                      <Film className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                      <Input
                        placeholder="e.g. My Amazing Video"
                        className="pl-10 h-11 bg-muted/30 border-muted-foreground/15 rounded-lg text-sm focus-visible:border-primary/50"
                        maxLength={100}
                        disabled={formState.isSubmitting}
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Upload Progress Bar */}
            {uploadProgress > 0 && (
              <div className="space-y-2 pt-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5 font-medium text-foreground">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                    Uploading video...
                  </span>
                  <span className="font-semibold text-primary">
                    {uploadProgress}%
                  </span>
                </div>
                <div className="w-full bg-muted/60 rounded-full h-2 overflow-hidden ring-1 ring-border/30">
                  <div
                    className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 h-2 rounded-full transition-all duration-200 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={
                formState.isSubmitting || !selectedFile || !videoTitle.trim()
              }
              className="w-full h-11 font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/20 transition-all duration-300 disabled:opacity-50"
            >
              {formState.isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="animate-spin h-4 w-4" />
                  Uploading... {uploadProgress}%
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <UploadCloud className="w-4 h-4" />
                  Publish Video
                </span>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
