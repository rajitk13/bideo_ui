"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchVideos, searchVideos } from "@/utility/requests";
import VideoCard from "@/components/video/VideoCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { InfiniteData } from "@tanstack/react-query";
import { MESSAGES } from "@/constants/messages";
import { Search, X, Film, Tag } from "lucide-react";
import { VideoDTO, PaginatedVideoResponse } from "@/types/video";

const CATEGORIES: { label: string; value: string }[] = [
  { label: "All", value: "ALL" },
  { label: "Tech", value: "TECH" },
  { label: "Education", value: "EDUCATION" },
  { label: "Gaming", value: "GAMING" },
  { label: "Entertainment", value: "ENTERTAINMENT" },
  { label: "Music", value: "MUSIC" },
  { label: "News", value: "NEWS" },
  { label: "Sports", value: "SPORTS" },
  { label: "Lifestyle", value: "LIFESTYLE" },
  { label: "Other", value: "OTHER" },
];

function ExploreContent() {
  const searchParams = useSearchParams();
  const observerRef = useRef<HTMLDivElement | null>(null);

  const initialQuery = searchParams.get("query") || "";
  const initialCategory = searchParams.get("category") || "ALL";
  const initialTag = searchParams.get("tag") || "";

  const [searchInput, setSearchInput] = useState(initialQuery);
  const [activeQuery, setActiveQuery] = useState(initialQuery);
  const [activeCategory, setActiveCategory] = useState<string>(initialCategory);
  const [activeTag, setActiveTag] = useState<string>(initialTag);

  // Sync state if URL searchParams change (e.g. clicking tag on watch page)
  useEffect(() => {
    const q = searchParams.get("query") || "";
    const cat = searchParams.get("category") || "ALL";
    const t = searchParams.get("tag") || "";

    if (q !== activeQuery) {
      setSearchInput(q);
      setActiveQuery(q);
    }
    if (cat !== activeCategory) {
      setActiveCategory(cat);
    }
    if (t !== activeTag) {
      setActiveTag(t);
    }
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  // Debounce search input for live results as user types (350ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setActiveQuery(searchInput.trim());
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const isFiltered =
    activeQuery.trim().length > 0 ||
    activeCategory !== "ALL" ||
    activeTag.trim().length > 0;

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
    ["videos", string, string, string],
    number
  >({
    queryKey: ["videos", activeQuery, activeCategory, activeTag],
    initialPageParam: 0,
    queryFn: ({ pageParam }) => {
      if (isFiltered) {
        return searchVideos(
          activeQuery,
          activeCategory === "ALL" ? undefined : activeCategory,
          activeTag || undefined,
          pageParam,
          12
        );
      }
      return fetchVideos(pageParam);
    },
    getNextPageParam: (lastPage) =>
      lastPage.last ? undefined : lastPage.number + 1,
    staleTime: 60 * 1000,
    retry: 1,
  });

  // Preserve order and deduplicate
  const videoMap = new Set<number>();
  const videoList: VideoDTO[] = [];

  data?.pages.forEach((page) => {
    page.content.forEach((video) => {
      if (
        (video.videoStatus === "COMPLETED" || !video.videoStatus) &&
        !videoMap.has(video.videoId)
      ) {
        videoList.push(video);
        videoMap.add(video.videoId);
      }
    });
  });

  // Toast on error
  useEffect(() => {
    if (error) toast.error(MESSAGES.EXPLORE_VIDEO_ERROR);
  }, [error]);

  // Infinite scroll logic
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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveQuery(searchInput.trim());
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setActiveQuery("");
    setActiveTag("");
  };

  const handleCategorySelect = (categoryValue: string) => {
    setActiveCategory(categoryValue);
  };

  return (
    <div className="w-full flex justify-center py-6">
      <div className="w-full lg:max-w-[85%] sm:max-w-full px-4 space-y-6">
        {/* === Header & Search Bar Section === */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Explore Videos
            </h1>
            <p className="text-sm text-muted-foreground">
              Discover, watch, and search videos from creators around the world.
            </p>
          </div>

          {/* Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="relative w-full md:w-96"
          >
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
            <Input
              type="text"
              placeholder="Search videos by title or topic..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10 pr-20 h-11 bg-card/80 border-border/60 backdrop-blur-sm rounded-full shadow-sm text-sm focus-visible:border-primary/50"
            />
            <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {searchInput && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="p-1 rounded-full text-muted-foreground/60 hover:text-foreground hover:bg-muted transition-colors"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <Button
                type="submit"
                size="sm"
                className="h-8 rounded-full px-3 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Search
              </Button>
            </div>
          </form>
        </div>

        {/* === Category Filter Pills === */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none select-none">
          {CATEGORIES.map((cat) => {
            const isSelected = activeCategory === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => handleCategorySelect(cat.value)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 shrink-0 ${
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-card/70 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/50"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Active Filter Chips Bar */}
        {isFiltered && (
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground pt-1 border-t border-border/40">
            <div className="flex flex-wrap items-center gap-2">
              <span>Showing results for:</span>
              {activeQuery && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium border border-primary/20">
                  &ldquo;{activeQuery}&rdquo;
                  <button
                    onClick={() => {
                      setSearchInput("");
                      setActiveQuery("");
                    }}
                    className="hover:text-foreground"
                    title="Remove query filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {activeCategory !== "ALL" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium border border-primary/20">
                  {CATEGORIES.find((c) => c.value === activeCategory)?.label}
                  <button
                    onClick={() => setActiveCategory("ALL")}
                    className="hover:text-foreground"
                    title="Remove category filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {activeTag && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium border border-blue-500/20">
                  <Tag className="w-2.5 h-2.5" />
                  #{activeTag}
                  <button
                    onClick={() => setActiveTag("")}
                    className="hover:text-foreground"
                    title="Remove tag filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                handleClearSearch();
                setActiveCategory("ALL");
                setActiveTag("");
              }}
              className="h-7 text-xs text-muted-foreground hover:text-foreground"
            >
              Reset all filters
            </Button>
          </div>
        )}

        {/* Video Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="w-full aspect-video rounded-xl" />
                  <div className="flex gap-3">
                    <Skeleton className="w-9 h-9 rounded-full shrink-0" />
                    <div className="space-y-1.5 flex-1">
                      <Skeleton className="w-full h-4" />
                      <Skeleton className="w-2/3 h-3" />
                    </div>
                  </div>
                </div>
              ))
            : videoList.map((video) => (
                <VideoCard key={video.videoId} video={video} />
              ))}

          {isFetchingNextPage &&
            Array.from({ length: 4 }).map((_, i) => (
              <div key={`loading-${i}`} className="space-y-3">
                <Skeleton className="w-full aspect-video rounded-xl" />
                <div className="flex gap-3">
                  <Skeleton className="w-9 h-9 rounded-full shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="w-full h-4" />
                    <Skeleton className="w-2/3 h-3" />
                  </div>
                </div>
              </div>
            ))}
        </div>

        {/* Empty Search Results */}
        {!isLoading && videoList.length === 0 && (
          <div className="py-16 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-muted/60 flex items-center justify-center mx-auto text-muted-foreground/60 border border-border/50">
              <Film className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-lg text-foreground">
                No videos found
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                {isFiltered
                  ? "We couldn't find any videos matching your search or filters. Try searching with broader terms or check other categories."
                  : "No public videos are available at the moment. Be the first to upload one!"}
              </p>
            </div>
            {isFiltered && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  handleClearSearch();
                  setActiveCategory("ALL");
                  setActiveTag("");
                }}
              >
                Clear Search & Filters
              </Button>
            )}
          </div>
        )}

        <div ref={observerRef} className="h-1" />

        {!hasNextPage && videoList.length > 0 && (
          <p className="text-center text-muted-foreground py-6 text-sm">
            {MESSAGES.END_OF_VIDEO_LIST}
          </p>
        )}
      </div>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense
      fallback={
        <div className="w-full flex justify-center py-6">
          <div className="w-full lg:max-w-[85%] px-4 space-y-6">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-11 w-full max-w-md rounded-full" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pt-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="w-full aspect-video rounded-xl" />
                  <div className="flex gap-3">
                    <Skeleton className="w-9 h-9 rounded-full shrink-0" />
                    <div className="space-y-1.5 flex-1">
                      <Skeleton className="w-full h-4" />
                      <Skeleton className="w-2/3 h-3" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      }
    >
      <ExploreContent />
    </Suspense>
  );
}
