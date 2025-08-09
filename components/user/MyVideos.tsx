"use client";

import { useEffect, useRef, useMemo } from "react";
import { useInfiniteQuery, InfiniteData } from "@tanstack/react-query";
import { fetchUserVideos } from "@/utility/requests";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { MESSAGES } from "@/constants/messages";
import { useAuth } from "@/store/auth-context";
import Image from "next/image";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type UserDTO = {
  userId: string;
  user_name: string;
  user_email: string;
  avatar_url: string;
};

type Video = {
  videoId: number;
  video_title: string;
  video_uploadDate: string;
  video_views: number;
  m3u8Url: string;
  video_uploader: UserDTO;
  video_duration: string;
  thumbnail_url: string;
  videoStatus: "PENDING" | "PROCESSING" | "COMPLETED" | string;
};

type PaginatedVideoResponse = {
  content: Video[];
  number: number;
  last: boolean;
};

export default function MyVideos() {
  const { user, token } = useAuth();
  const observerRef = useRef<HTMLDivElement | null>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useInfiniteQuery<
    PaginatedVideoResponse,
    Error,
    InfiniteData<PaginatedVideoResponse>,
    ["userVideos", string],
    number
  >({
    queryKey: ["userVideos", user?.userId ?? ""],
    enabled: !!user?.userId,
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      fetchUserVideos(pageParam, user?.userId as string, token as string),
    getNextPageParam: (lastPage) =>
      lastPage.last ? undefined : lastPage.number + 1,
    staleTime: 60 * 1000,
    retry: 1,
  });

  const videoList: Video[] = data?.pages.flatMap((page) => page.content) ?? [];

  useEffect(() => {
    if (error) toast.error(MESSAGES.EXPLORE_VIDEO_ERROR);
  }, [error]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 1 }
    );
    const el = observerRef.current;
    if (el) observer.observe(el);
    return () => {
      if (el) observer.unobserve(el);
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      PENDING: "bg-yellow-500/10 text-yellow-600",
      PROCESSING: "bg-blue-500/10 text-blue-600",
      COMPLETED: "bg-green-500/10 text-green-600",
    };
    return (
      <Badge
        className={`${
          variants[status] ?? "bg-gray-500/10 text-gray-600"
        } font-medium capitalize px-2 py-0.5 whitespace-nowrap`}
      >
        {status}
      </Badge>
    );
  };

  const columns = useMemo<ColumnDef<Video>[]>(
    () => [
      {
        header: "Thumbnail",
        cell: ({ row }) => {
          const video = row.original;
          return video.videoStatus === "PROCESSING" ? (
            <Skeleton className="w-24 h-14 rounded" />
          ) : (
            <Image
              src={video.thumbnail_url}
              alt={video.video_title}
              className="w-24 h-14 rounded object-cover"
              width={96}
              height={56}
            />
          );
        },
      },
      {
        header: "Title",
        accessorKey: "video_title",
        cell: ({ getValue }) => (
          <span className="block max-w-[150px] truncate sm:max-w-none">
            {getValue() as string}
          </span>
        ),
      },
      {
        header: "Uploader",
        cell: ({ row }) => (
          <span className="block max-w-[100px] truncate sm:max-w-none">
            {row.original.video_uploader.user_name}
          </span>
        ),
      },
      {
        header: "Upload Date",
        cell: ({ row }) =>
          new Date(row.original.video_uploadDate).toLocaleString(),
      },
      {
        header: "Views",
        accessorKey: "video_views",
      },
      {
        header: "Status",
        cell: ({ row }) => getStatusBadge(row.original.videoStatus),
      },
      {
        header: "Actions",
        cell: () => (
          <Button
            variant="destructive"
            size="sm"
            className="rounded whitespace-nowrap"
          >
            Delete
          </Button>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: videoList,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="w-full flex justify-center min-h-screen py-4 px-2 sm:px-4">
      <div className="w-full lg:max-w-[95%]">
        <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 tracking-tight">
          My Uploaded Videos (under construction)
        </h1>

        {/* Responsive Table Container */}
        <div className="rounded-md border overflow-x-auto">
          <Table className="min-w-[700px]">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="whitespace-nowrap text-xs sm:text-sm"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading && videoList.length === 0 ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={columns.length}>
                      <Skeleton className="w-full h-10 rounded" />
                    </TableCell>
                  </TableRow>
                ))
              ) : table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} className="text-xs sm:text-sm">
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="whitespace-nowrap">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No videos found.
                  </TableCell>
                </TableRow>
              )}

              {isFetchingNextPage &&
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={`loading-${i}`}>
                    <TableCell colSpan={columns.length}>
                      <Skeleton className="w-full h-10 rounded" />
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>

        <div ref={observerRef} className="h-1" />

        {!hasNextPage && videoList.length > 0 && (
          <p className="text-center py-6 text-xs sm:text-sm text-muted-foreground">
            {MESSAGES.END_OF_VIDEO_LIST}
          </p>
        )}
      </div>
    </div>
  );
}
