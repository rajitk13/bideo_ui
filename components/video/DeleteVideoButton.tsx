import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { MESSAGES } from "@/constants/messages";
import { deleteVideo } from "@/utility/requests";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { useAuth } from "@/store/auth-context";

export default function DeleteVideoButton({ videoId }: { videoId: number }) {
  const { user, token } = useAuth();
  const handleDelete = async () => {
    if (!user?.userId) {
      toast.error(MESSAGES.DELETED_ERROR);
      return;
    }

    try {
      await deleteVideo(user.userId, videoId, token as string);
      toast.success(MESSAGES.DELETED_SUCCESS);
    } catch (error) {
      console.error("Delete video failed:", error);
      toast.error(MESSAGES.DELETED_ERROR);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete video?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. The video will be permanently removed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>Confirm</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
