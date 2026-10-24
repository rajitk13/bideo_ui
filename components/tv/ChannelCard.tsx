"use client";

import React from "react";
import Image from "next/image";
import { LiveChannel } from "@/constants/liveChannels";
import { Badge } from "@/components/ui/badge";
import { Volume2 } from "lucide-react";
import clsx from "clsx";

interface ChannelCardProps {
  channel: LiveChannel;
  isActive: boolean;
  onSelect: (channel: LiveChannel) => void;
}

export function ChannelCard({ channel, isActive, onSelect }: ChannelCardProps) {
  return (
    <button
      onClick={() => onSelect(channel)}
      className={clsx(
        "group relative w-full text-left rounded-xl p-3 border transition-all duration-200 overflow-hidden flex items-center gap-3.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        isActive
          ? "bg-primary/10 border-primary shadow-md shadow-primary/10 ring-1 ring-primary/40"
          : "bg-card/70 hover:bg-card border-border/40 hover:border-border/80"
      )}
    >
      {/* Channel Logo / Thumbnail */}
      <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-black/40 border border-border/40 shrink-0">
        <Image
          src={channel.logo}
          alt={channel.name}
          fill
          sizes="56px"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {isActive && (
          <div className="absolute inset-0 bg-primary/20 backdrop-blur-xs flex items-center justify-center">
            <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md animate-pulse">
              <Volume2 className="w-3.5 h-3.5" />
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <p className={clsx(
            "text-sm font-bold truncate leading-tight transition-colors",
            isActive ? "text-primary" : "text-foreground group-hover:text-primary"
          )}>
            {channel.name}
          </p>
          {isActive ? (
            <span className="flex items-center gap-1 text-[10px] font-bold text-red-500 uppercase tracking-wider shrink-0 bg-red-500/10 px-1.5 py-0.5 rounded-full border border-red-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping inline-block" />
              Playing
            </span>
          ) : (
            <span className="text-[10px] text-muted-foreground shrink-0 font-medium font-mono">
              {channel.hindiName}
            </span>
          )}
        </div>

        <p className="text-xs text-muted-foreground truncate leading-normal">
          {channel.currentProgram || channel.description}
        </p>

        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
          <Badge variant="outline" className="text-[10px] py-0 px-1.5 bg-background/50 border-border/40">
            {channel.category}
          </Badge>
          <span className="text-[10px] text-muted-foreground">
            {channel.language.join(", ")}
          </span>
        </div>
      </div>
    </button>
  );
}
