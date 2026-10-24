"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { LiveChannel, INDIAN_LIVE_CHANNELS } from "@/constants/liveChannels";
import { LiveTvPlayer } from "./LiveTvPlayer";
import { ChannelGuide } from "./ChannelGuide";
import { Card, CardContent } from "@/components/ui/card";
import { Radio, ShieldCheck, Zap, Sparkles, Tv } from "lucide-react";
import clsx from "clsx";

interface LiveTvClientProps {
  initialChannelId?: string;
}

export function LiveTvClient({ initialChannelId }: LiveTvClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Find initial channel
  const channelParam = searchParams.get("channel") || initialChannelId;
  const initialChannel =
    INDIAN_LIVE_CHANNELS.find((c) => c.id === channelParam) ||
    INDIAN_LIVE_CHANNELS[0];

  const [activeChannel, setActiveChannel] = useState<LiveChannel>(initialChannel);

  // Sync state if URL query param changes
  useEffect(() => {
    const param = searchParams.get("channel");
    if (param && param !== activeChannel.id) {
      const match = INDIAN_LIVE_CHANNELS.find((c) => c.id === param);
      if (match) {
        setActiveChannel(match);
      }
    }
  }, [searchParams, activeChannel.id]);

  const handleSelectChannel = (channel: LiveChannel) => {
    setActiveChannel(channel);
    router.replace(`/tv?channel=${channel.id}`, { scroll: false });
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-6 sm:space-y-8">
      {/* "Made in India" Sleek Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden p-5 sm:p-6 bg-gradient-to-r from-orange-500/10 via-background to-emerald-500/10 border border-border/50 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-500/15 text-orange-500 border border-orange-500/30">
                <span>🇮🇳</span>
                <span>Made in India • Built for India</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                100% Free Public TV
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-foreground">
              Indian Free-To-Air Live TV & Public Broadcasts
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
              Stream official Doordarshan national, news, sports, and parliamentary channels with zero buffer, zero login, and adaptive HLS playback.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-card/60 border border-border/40 backdrop-blur-xs">
              <Radio className="w-4 h-4 text-red-500 animate-pulse" />
              <div className="text-left">
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Status</p>
                <p className="text-xs font-semibold text-foreground">12 Channels Live</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Player & Channel Guide Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Left Column: Active Player (Col 7 on desktop) */}
        <div className="lg:col-span-7 space-y-4">
          <LiveTvPlayer channel={activeChannel} />

          {/* Mobile Quick-Dial Carousel (Visible only on mobile/tablet) */}
          <div className="block lg:hidden space-y-2 pt-1">
            <div className="flex items-center justify-between text-xs font-semibold px-0.5">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Tv className="w-3.5 h-3.5 text-primary" />
                Quick Dial Channels
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">
                Swipe ➔
              </span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none -mx-1 px-1">
              {INDIAN_LIVE_CHANNELS.map((ch) => {
                const isCur = activeChannel.id === ch.id;
                return (
                  <button
                    key={ch.id}
                    onClick={() => handleSelectChannel(ch)}
                    className={clsx(
                      "flex items-center gap-2 px-3 py-2 rounded-xl border shrink-0 text-left transition-all active:scale-95",
                      isCur
                        ? "bg-primary text-primary-foreground border-primary shadow-xs font-semibold ring-1 ring-primary/40"
                        : "bg-card/80 hover:bg-card text-foreground border-border/50"
                    )}
                  >
                    <span
                      className={clsx(
                        "w-6 h-6 rounded-md flex items-center justify-center font-mono text-xs font-black shrink-0",
                        isCur
                          ? "bg-primary-foreground text-primary"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {ch.channelNumber}
                    </span>
                    <div className="truncate max-w-[110px]">
                      <p className="text-xs truncate leading-tight font-bold">
                        {ch.name}
                      </p>
                      <p
                        className={clsx(
                          "text-[10px] truncate leading-tight",
                          isCur ? "opacity-80" : "text-muted-foreground"
                        )}
                      >
                        {ch.hindiName}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Channel Guide (Col 5 on desktop) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="border border-border/50 bg-card/75 backdrop-blur-sm rounded-2xl p-4 sm:p-5 shadow-lg shadow-black/5">
            <CardContent className="p-0">
              <ChannelGuide
                channels={INDIAN_LIVE_CHANNELS}
                activeChannel={activeChannel}
                onSelectChannel={handleSelectChannel}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Value Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-border/40">
        <div className="p-4 rounded-xl bg-card/40 border border-border/40 space-y-1.5">
          <div className="flex items-center gap-2 text-primary font-semibold text-sm">
            <Zap className="w-4 h-4" />
            <span>Buffer-Free HLS Streaming</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Direct adaptive bitrate switching ensures instant connection without lag on both 4G/5G mobile and broadband.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-card/40 border border-border/40 space-y-1.5">
          <div className="flex items-center gap-2 text-emerald-500 font-semibold text-sm">
            <ShieldCheck className="w-4 h-4" />
            <span>Official & Legal FTA Channels</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Broadcasting authorized public service feeds from Prasar Bharati and recognized Indian news networks.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-card/40 border border-border/40 space-y-1.5">
          <div className="flex items-center gap-2 text-purple-500 font-semibold text-sm">
            <Sparkles className="w-4 h-4" />
            <span>No Subscription, No Sign-In</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Completely free to watch for everyone in India and abroad. Tap any channel and start streaming immediately.
          </p>
        </div>
      </div>

      {/* Semantic SEO & Discovery Guide for BuzzClips TV */}
      <article
        aria-labelledby="about-buzzclips-tv-title"
        className="mt-10 pt-8 border-t border-border/40 space-y-6 text-foreground"
      >
        <div className="space-y-2">
          <h2
            id="about-buzzclips-tv-title"
            className="text-lg sm:text-xl font-bold tracking-tight text-foreground"
          >
            About BuzzClips TV — Free Indian Live TV Streaming
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            BuzzClips TV is India&apos;s premier web-first live TV streaming portal, offering instant, unrestricted access to official Indian Free-To-Air (FTA) national broadcasts, public service television, breaking news, live parliamentary debates, and premier sports. Powered by ultra-low latency adaptive HLS, BuzzClips TV delivers crisp 1080p Full HD video playback with zero buffering and zero login requirements.
          </p>
        </div>

        {/* Channel Directory Grid for SEO Indexing */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Official Indian Live TV Channels Lineup
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {INDIAN_LIVE_CHANNELS.map((ch) => (
              <button
                key={ch.id}
                onClick={() => handleSelectChannel(ch)}
                className="text-left p-2.5 rounded-xl border border-border/40 bg-card/40 hover:bg-card hover:border-primary/40 transition-all group"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] font-bold text-muted-foreground group-hover:text-primary">
                    CH {ch.channelNumber}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse ml-auto" />
                </div>
                <p className="text-xs font-bold text-foreground truncate mt-1">
                  {ch.name}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {ch.hindiName}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Frequently Asked Questions (FAQ Section) */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Frequently Asked Questions about BuzzClips TV
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <details className="group p-3.5 rounded-xl border border-border/40 bg-card/30 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex items-center justify-between cursor-pointer font-semibold text-xs text-foreground group-open:text-primary">
                <span>What is BuzzClips TV?</span>
                <span className="text-xs text-muted-foreground group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                BuzzClips TV is a free online streaming service by BuzzClips providing live Indian television channels, including DD National, DD Sports, DD News, Sansad TV, and regional public broadcasts, directly in your browser.
              </p>
            </details>

            <details className="group p-3.5 rounded-xl border border-border/40 bg-card/30 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex items-center justify-between cursor-pointer font-semibold text-xs text-foreground group-open:text-primary">
                <span>Is BuzzClips TV free and legal to watch?</span>
                <span className="text-xs text-muted-foreground group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                Yes, 100%. All channels featured on BuzzClips TV are official Free-To-Air (FTA) public broadcasts transmitted by Prasar Bharati and authorized news networks. No paid subscription, account registration, or payment is ever required.
              </p>
            </details>

            <details className="group p-3.5 rounded-xl border border-border/40 bg-card/30 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex items-center justify-between cursor-pointer font-semibold text-xs text-foreground group-open:text-primary">
                <span>What channels can I watch on BuzzClips TV?</span>
                <span className="text-xs text-muted-foreground group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                You can watch 12+ live television channels, including DD National (डीडी नेशनल), DD News, DD India, DD Sports, DD Bharati, Sansad TV Lok Sabha, Sansad TV Rajya Sabha, and major national news networks in HD.
              </p>
            </details>

            <details className="group p-3.5 rounded-xl border border-border/40 bg-card/30 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex items-center justify-between cursor-pointer font-semibold text-xs text-foreground group-open:text-primary">
                <span>Does BuzzClips TV work on mobile devices?</span>
                <span className="text-xs text-muted-foreground group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                Yes! BuzzClips TV is fully responsive and optimized for mobile smartphones (iOS &amp; Android), tablets, laptops, and desktop screens with full-screen theater viewing and native touch controls.
              </p>
            </details>
          </div>
        </div>
      </article>
    </div>
  );
}
