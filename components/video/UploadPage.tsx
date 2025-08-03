"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import axios from "axios";
import { api_instance } from "@/global";

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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/store/auth-context";
import { MESSAGES } from "@/constants/messages";

const formSchema = z.object({
  videoTitle: z.string().min(1, "Title is required").max(100, "Title too long"),
  file: z
    .any()
    .refine((file) => file instanceof File, "Video file is required"),
  userId: z.string(),
});

export default function UploadPage() {
  const { user, token } = useAuth();
  const [uploadProgress, setUploadProgress] = useState(0);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      videoTitle: "",
      file: null,
      userId: user?.userId,
    },
  });

  const { setValue, reset } = form;

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
      reset({ videoTitle: "", file: null, userId: user?.userId });
    } catch (error) {
      console.error(error);
      toast.error(MESSAGES.FILE_UPLOAD_FAILED);
    } finally {
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  useEffect(() => {
    if (user) {
      reset({
        userId: user.userId,
      });
    }
  }, [user, reset]);

  return (
    <div className="max-w-xl mx-auto py-12">
      <Card>
        <CardHeader>
          <CardTitle>Upload a Video</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="flex flex-col gap-6"
            >
              <FormField
                control={form.control}
                name="videoTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Video Title</FormLabel>
                    <FormControl>
                      <Input placeholder="My Awesome Video" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="file"
                render={() => (
                  <FormItem>
                    <FormLabel>Select Video File</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept="video/*"
                        onChange={(e) =>
                          setValue("file", e.target.files?.[0] || null)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="inline">
                <Badge variant="outline" className="mr-1">
                  50MB Max
                </Badge>
                <Badge variant="outline">mp4</Badge>
              </div>

              {uploadProgress > 0 && (
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-500 h-2.5 rounded-full transition-all duration-200 ease-in-out"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    Uploading... {uploadProgress}%
                  </>
                ) : (
                  "Upload Video"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
