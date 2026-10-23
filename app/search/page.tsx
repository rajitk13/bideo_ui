"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { VideoDTO, VideoCategory } from "@/types/video";
import { searchVideos, searchUsers } from "@/utility/requests";
import { CategoryFilterBar } from "@/components/search/CategoryFilterBar";
import VideoCard from "@/components/video/VideoCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { Search, X, Tag, Sparkles, User } from "lucide-react";
import { UserDTO } from "@/types/user";

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialQuery = searchParams.get("query") || "";
  const initialCategoryParam = searchParams.get("category");
  const initialTagParam = searchParams.get("tag");

  const [inputVal, setInputVal] = useState(initialQuery);
  const [query, setQuery] = useState(initialQuery);
  const [selectedCategories, setSelectedCategories] = useState<VideoCategory[]>(
    initialCategoryParam
      ? (initialCategoryParam.split(",").filter(Boolean) as VideoCategory[])
      : []
  );
  const [selectedTags, setSelectedTags] = useState<string[]>(
    initialTagParam ? initialTagParam.split(",").filter(Boolean) : []
  );

  const [videos, setVideos] = useState<VideoDTO[]>([]);
  const [matchingCreators, setMatchingCreators] = useState<UserDTO[]>([]);
  const [loading, setLoading] = useState(true);

  // Sync state if URL changes externally
  useEffect(() => {
    const q = searchParams.get("query") || "";
    const cat = searchParams.get("category");
    const t = searchParams.get("tag");

    setInputVal(q);
    setQuery(q);
    setSelectedCategories(
      cat ? (cat.split(",").filter(Boolean) as VideoCategory[]) : []
    );
    setSelectedTags(t ? t.split(",").filter(Boolean) : []);
  }, [searchParams]);

  // Update URL search parameters when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (query.trim()) params.set("query", query.trim());
    if (selectedCategories.length > 0)
      params.set("category", selectedCategories.join(","));
    if (selectedTags.length > 0) params.set("tag", selectedTags.join(","));

    const newQueryString = params.toString();
    const currentQueryString = searchParams.toString();

    if (newQueryString !== currentQueryString) {
      router.push(`/search${newQueryString ? `?${newQueryString}` : ""}`, {
        scroll: false,
      });
    }
  }, [query, selectedCategories, selectedTags, router, searchParams]);

  // Fetch videos and creators whenever query, categories, or tags change
  useEffect(() => {
    let isCancelled = false;

    const fetchResults = async () => {
      setLoading(true);
      try {
        const [videosRes, creatorsRes] = await Promise.all([
          searchVideos({
            query,
            categories: selectedCategories,
            tags: selectedTags,
            page: 0,
            size: 24,
          }),
          query.trim() && typeof searchUsers === "function"
            ? searchUsers(query.trim(), 6)
            : Promise.resolve([]),
        ]);

        if (!isCancelled) {
          setVideos(videosRes.content || []);
          setMatchingCreators(creatorsRes || []);
        }
      } catch (err) {
        console.error("Failed to load search results", err);
        if (!isCancelled) {
          setVideos([]);
          setMatchingCreators([]);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchResults();

    return () => {
      isCancelled = true;
    };
  }, [query, selectedCategories, selectedTags]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(inputVal.trim());
  };

  const removeTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tagToRemove));
  };

  const clearAllFilters = () => {
    setInputVal("");
    setQuery("");
    setSelectedCategories([]);
    setSelectedTags([]);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      {/* 1. Search Bar Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-2xl">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Search videos, topics, creators..."
            className="pl-10 pr-20 h-11 rounded-full bg-card/80 border-border/50 shadow-xs focus-visible:ring-primary text-sm"
          />
          {inputVal && (
            <button
              type="button"
              onClick={() => {
                setInputVal("");
                setQuery("");
              }}
              className="absolute right-12 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
              aria-label="Clear query"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <Button
            type="submit"
            size="sm"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 rounded-full px-3 text-xs font-semibold"
          >
            Search
          </Button>
        </form>

        {(query || selectedCategories.length > 0 || selectedTags.length > 0) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-xs text-muted-foreground hover:text-destructive self-end sm:self-center"
          >
            Reset Filters
          </Button>
        )}
      </div>

      {/* 2. Multi-Select Category Filter Bar */}
      <div className="border-b border-border/40 pb-1">
        <CategoryFilterBar
          selectedCategories={selectedCategories}
          onChange={setSelectedCategories}
        />
      </div>

      {/* 3. Active Tag Badges */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 py-1">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Tag className="w-3 h-3" /> Filtered by tags:
          </span>
          {selectedTags.map((tag) => (
            <span
              key={tag}
              className="bg-muted text-foreground text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-border/50 font-medium"
            >
              #{tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="text-muted-foreground hover:text-foreground cursor-pointer text-xs ml-0.5"
                aria-label={`Remove tag ${tag}`}
              >
                ✕
              </button>
            </span>
          ))}
          <button
            type="button"
            onClick={() => setSelectedTags([])}
            className="text-xs text-primary hover:underline ml-2 cursor-pointer font-medium"
          >
            Clear all tags
          </button>
        </div>
      )}

      {/* 4. Active Filters Indicator */}
      {(selectedCategories.length > 0 || selectedTags.length > 0 || query) && (
        <div className="text-xs text-muted-foreground flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span>
            Showing results for{" "}
            {query && <span className="font-semibold text-foreground">&ldquo;{query}&rdquo;</span>}
            {query && selectedCategories.length > 0 && " in "}
            {selectedCategories.length > 0 && (
              <span className="font-semibold text-foreground">
                {selectedCategories.join(", ")}
              </span>
            )}
            {!loading && ` (${videos.length} ${videos.length === 1 ? "video" : "videos"})`}
          </span>
        </div>
      )}

      {/* 4.5 Matching Creators & Channels */}
      {!loading && matchingCreators.length > 0 && (
        <div className="space-y-3 pb-3 border-b border-border/40">
          <h3 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-primary" />
            Matching Creators & Channels
          </h3>
          <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
            {matchingCreators.map((creator) => {
              const handle = creator.username || creator.user_name || "";
              const displayName =
                creator.fullName || creator.user_name || "Creator";
              const channelHref = creator.username
                ? `/channel/@${creator.username}`
                : `/channel/${creator.userId}`;

              return (
                <Link
                  key={creator.userId}
                  href={channelHref}
                  className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-card/70 hover:bg-card border border-border/50 hover:border-primary/40 transition-all shrink-0 group"
                >
                  <Avatar className="h-8 w-8 ring-1 ring-border/50 group-hover:ring-primary/40 transition-all">
                    <AvatarImage
                      src={creator.avatar_url || ""}
                      alt={displayName}
                    />
                    <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold">
                      {displayName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate max-w-[140px]">
                      {displayName}
                    </span>
                    {handle && (
                      <span className="text-[11px] font-mono text-muted-foreground truncate max-w-[140px]">
                        @{handle.replace(/^@/, "")}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. Results Grid or Skeletons or Empty State */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-video w-full rounded-xl" />
              <div className="flex gap-3">
                <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-20 bg-card/40 border border-border/40 rounded-2xl p-8 space-y-3">
          <h2 className="text-xl font-semibold text-foreground">No videos found</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Try adjusting your search query, or deselecting some categories or tags.
          </p>
          <Button variant="outline" size="sm" onClick={clearAllFilters} className="mt-2">
            Clear all filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {videos.map((video) => (
            <VideoCard key={video.videoId} video={video} />
          ))}
        </div>
      )}
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
          <Skeleton className="h-11 w-full max-w-2xl rounded-full" />
          <Skeleton className="h-10 w-full rounded-full" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 pt-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="aspect-video w-full rounded-xl" />
            ))}
          </div>
        </main>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
