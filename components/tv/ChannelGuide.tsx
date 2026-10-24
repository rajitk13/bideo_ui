"use client";

import React, { useState, useMemo } from "react";
import {
  LiveChannel,
  ChannelCategory,
  CHANNEL_CATEGORIES,
} from "@/constants/liveChannels";
import { ChannelCard } from "./ChannelCard";
import { Input } from "@/components/ui/input";
import { Search, Tv, X, Radio } from "lucide-react";
import clsx from "clsx";

interface ChannelGuideProps {
  channels: LiveChannel[];
  activeChannel: LiveChannel;
  onSelectChannel: (channel: LiveChannel) => void;
}

export function ChannelGuide({
  channels,
  activeChannel,
  onSelectChannel,
}: ChannelGuideProps) {
  const [selectedCategory, setSelectedCategory] = useState<ChannelCategory>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredChannels = useMemo(() => {
    return channels.filter((channel) => {
      // Category filter
      if (selectedCategory !== "ALL" && channel.category !== selectedCategory) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = channel.name.toLowerCase().includes(query);
        const matchesHindi = channel.hindiName.includes(query);
        const matchesNumber = channel.channelNumber.includes(query);
        const matchesDesc = channel.description.toLowerCase().includes(query);
        const matchesBroadcaster = channel.broadcaster.toLowerCase().includes(query);
        const matchesLang = channel.language.some((l) =>
          l.toLowerCase().includes(query)
        );
        return (
          matchesName ||
          matchesHindi ||
          matchesNumber ||
          matchesDesc ||
          matchesBroadcaster ||
          matchesLang
        );
      }
      return true;
    });
  }, [channels, selectedCategory, searchQuery]);

  // Compute category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: channels.length };
    channels.forEach((ch) => {
      counts[ch.category] = (counts[ch.category] || 0) + 1;
    });
    return counts;
  }, [channels]);

  return (
    <section aria-labelledby="live-channel-guide-title" className="space-y-3.5">
      {/* 1. Header: Title + Live Badge (Clean full width row) */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <Tv className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2
                id="live-channel-guide-title"
                className="text-base font-bold text-foreground leading-tight whitespace-nowrap"
              >
                Channel Guide
              </h2>
              <span className="whitespace-nowrap shrink-0 inline-flex flex-row items-center gap-1.5 text-[10px] font-mono font-bold text-red-500 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shrink-0" />
                <span>{filteredChannels.length} Live</span>
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground font-medium truncate mt-0.5">
              Official Indian Free-To-Air Broadcasts
            </p>
          </div>
        </div>
      </div>

      {/* 2. Full-Width Search Bar */}
      <div className="relative w-full">
        <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search channels, numbers, languages..."
          className="pl-8 pr-8 h-8 text-xs bg-card/60 border-border/50 rounded-xl focus-visible:ring-1 focus-visible:ring-primary w-full"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Category Filter Pills with counts */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
        {CHANNEL_CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const count = categoryCounts[cat.id] || 0;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={clsx(
                "px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 border flex items-center gap-1.5",
                isSelected
                  ? "bg-primary text-primary-foreground border-primary shadow-xs"
                  : "bg-card/70 hover:bg-card text-muted-foreground hover:text-foreground border-border/40"
              )}
            >
              <span>{cat.label}</span>
              <span
                className={clsx(
                  "text-[10px] px-1.5 py-0.2 rounded-full font-mono",
                  isSelected
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Vertical Channels List */}
      <div
        role="list"
        aria-label="Indian Live TV Channels List"
        className="space-y-2.5 max-h-[560px] overflow-y-auto pr-1.5 scrollbar-thin scrollbar-thumb-border/50"
      >
        {filteredChannels.length > 0 ? (
          filteredChannels.map((channel) => (
            <div key={channel.id} role="listitem">
              <ChannelCard
                channel={channel}
                isActive={activeChannel.id === channel.id}
                onSelect={onSelectChannel}
              />
            </div>
          ))
        ) : (
          <div className="py-12 text-center space-y-2 rounded-xl bg-card/40 border border-border/40">
            <Radio className="w-8 h-8 text-muted-foreground/60 mx-auto animate-pulse" />
            <p className="text-sm font-semibold text-foreground">No channels match your filter</p>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              Try searching for &quot;DD&quot;, &quot;News&quot;, or select &quot;All Channels&quot;.
            </p>
            <button
              onClick={() => {
                setSelectedCategory("ALL");
                setSearchQuery("");
              }}
              className="text-xs text-primary font-semibold hover:underline mt-2 inline-block"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
export default ChannelGuide;
