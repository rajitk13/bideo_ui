"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/store/auth-context";
import { MESSAGES } from "@/constants/messages";
import { uploadVideo } from "@/utility/requests";

const formSchema = z.object({
  videoTitle: z.string().min(1, "Title is required"),
  file: z
    .any()
    .refine((file) => file instanceof File, "Video file is required"),
  userId: z.string(),
});

export default function UploadPage() {
  const { user, token } = useAuth();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      videoTitle: "",
      file: null,
      userId: user?.userId,
    },
  });

  const { setValue, reset } = form;

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log(values);
    if (!token) {
      toast.error(MESSAGES.USER_NOT_AUTHENTICATED);
      return;
    }
    await uploadVideo(values, token)
      .then(() => {
        toast.success(MESSAGES.FILE_UPLOADED);
      })
      .catch(() => {
        toast.error(MESSAGES.FILE_UPLOAD_FAILED);
      });
  };

  useEffect(() => {
    if (user) {
      reset({
        userId: user.userId,
      });
    }
  }, []);

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

              <Button
                type="submit"
                className="w-full"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    Uploading...
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
