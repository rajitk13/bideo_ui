"use client";

import React, { useState, useMemo } from "react";
import {
  LiveChannel,
  ChannelCategory,
  CHANNEL_CATEGORIES,
} from "@/constants/liveChannels";
import { ChannelCard } from "./ChannelCard";
import { Input } from "@/components/ui/input";
import { Search, Tv } from "lucide-react";
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
        const matchesDesc = channel.description.toLowerCase().includes(query);
        const matchesBroadcaster = channel.broadcaster.toLowerCase().includes(query);
        const matchesLang = channel.language.some((l) =>
          l.toLowerCase().includes(query)
        );
        return matchesName || matchesHindi || matchesDesc || matchesBroadcaster || matchesLang;
      }
      return true;
    });
  }, [channels, selectedCategory, searchQuery]);

  return (
    <div className="space-y-4">
      {/* Search & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Tv className="w-5 h-5 text-primary" />
          <h2 className="text-base sm:text-lg font-bold text-foreground">
            Live Channel Guide
          </h2>
          <span className="text-xs text-muted-foreground font-mono bg-muted/50 px-2 py-0.5 rounded-full">
            {filteredChannels.length} Live
          </span>
        </div>

        {/* Channel Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search channels, languages..."
            className="pl-9 h-9 text-xs bg-card/60 border-border/50 rounded-full"
          />
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {CHANNEL_CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={clsx(
                "px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 border",
                isSelected
                  ? "bg-primary text-primary-foreground border-primary shadow-xs"
                  : "bg-card/70 hover:bg-card text-muted-foreground hover:text-foreground border-border/40"
              )}
            >
              <span>{cat.label}</span>
              <span className="ml-1 text-[10px] opacity-70">({cat.hindiLabel})</span>
            </button>
          );
        })}
      </div>

      {/* Channels List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1">
        {filteredChannels.length > 0 ? (
          filteredChannels.map((channel) => (
            <ChannelCard
              key={channel.id}
              channel={channel}
              isActive={activeChannel.id === channel.id}
              onSelect={onSelectChannel}
            />
          ))
        ) : (
          <div className="col-span-full py-12 text-center space-y-2 rounded-xl bg-card/40 border border-border/40">
            <Tv className="w-8 h-8 text-muted-foreground/60 mx-auto" />
            <p className="text-sm font-semibold text-foreground">No channels found</p>
            <p className="text-xs text-muted-foreground">
              Try adjusting your search query or category filter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
