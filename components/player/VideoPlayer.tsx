"use client";

import React, {
  forwardRef,
  useRef,
  useState,
  useEffect,
  useImperativeHandle,
  useCallback,
} from "react";
import Hls from "hls.js";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Volume1,
  Maximize,
  Minimize,
  PictureInPicture2,
  RotateCcw,
  RotateCw,
  Settings,
  Check,
  Radio,
  Sliders,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import clsx from "clsx";

export interface VideoPlayerProps {
  src: string;
  poster?: string;
  vttUrl?: string;
  storyboardUrl?: string;
  onTimeUpdate?: () => void;
  isLive?: boolean;
}

const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5, 2];

export const VideoPlayer = forwardRef<any, VideoPlayerProps>(
  ({ src, poster, onTimeUpdate, isLive = false }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const hlsRef = useRef<Hls | null>(null);
    const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const seekRippleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Player State
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [bufferedEnd, setBufferedEnd] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [seekRipple, setSeekRipple] = useState<"forward" | "backward" | null>(null);
    const [centerPulse, setCenterPulse] = useState<"play" | "pause" | null>(null);

    // Quality levels from HLS
    const [qualityLevels, setQualityLevels] = useState<{ id: number; height: number; bitrate: number }[]>([]);
    const [currentQuality, setCurrentQuality] = useState<number>(-1); // -1 = Auto

    // Hover tooltip state
    const [hoverTime, setHoverTime] = useState<number | null>(null);
    const [hoverPos, setHoverPos] = useState<number>(0);

    // Proxy the m3u8 source URL
    const proxySrc = src
      ? src.startsWith("/proxy")
        ? src
        : `/proxy/proxy-m3u8?url=${encodeURIComponent(src)}`
      : "";

    // Expose imperative API for parent components (useResumePlayback, etc.)
    useImperativeHandle(ref, () => ({
      seekTo: (seconds: number) => {
        if (videoRef.current) {
          videoRef.current.currentTime = seconds;
        }
      },
      getCurrentTime: () => videoRef.current?.currentTime || 0,
      getDuration: () => videoRef.current?.duration || 0,
      play: () => videoRef.current?.play(),
      pause: () => videoRef.current?.pause(),
      getInternalPlayer: () => videoRef.current,
    }));

    // Format seconds into MM:SS or HH:MM:SS
    const formatTime = (seconds: number) => {
      if (isNaN(seconds) || seconds < 0) return "0:00";
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = Math.floor(seconds % 60);
      if (h > 0) {
        return `${h}:${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
      }
      return `${m}:${s < 10 ? "0" : ""}${s}`;
    };

    // Initialize Hls.js or native video
    useEffect(() => {
      const video = videoRef.current;
      if (!video || !proxySrc) return;

      if (Hls.isSupported()) {
        if (hlsRef.current) {
          hlsRef.current.destroy();
        }

        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: isLive,
          backBufferLength: isLive ? 30 : 90,
          maxBufferLength: 30,
          maxMaxBufferLength: 60,
        });

        hls.loadSource(proxySrc);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
          const levels = data.levels.map((lvl, index) => ({
            id: index,
            height: lvl.height,
            bitrate: lvl.bitrate,
          }));
          setQualityLevels(levels);
          setCurrentQuality(hls.currentLevel);
        });

        hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
          setCurrentQuality(hls.autoLevelEnabled ? -1 : data.level);
        });

        hls.on(Hls.Events.ERROR, (_, err) => {
          if (err.fatal) {
            switch (err.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                hls.recoverMediaError();
                break;
              default:
                hls.destroy();
                break;
            }
          }
        });

        hlsRef.current = hls;

        return () => {
          hls.destroy();
          hlsRef.current = null;
        };
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        // Native Safari HLS
        video.src = proxySrc;
      }
    }, [proxySrc, isLive]);

    // Handle Controls Visibility on Mouse Activity
    const handleActivity = useCallback(() => {
      setShowControls(true);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      controlsTimeoutRef.current = setTimeout(() => {
        if (isPlaying) setShowControls(false);
      }, 2800);
    }, [isPlaying]);

    useEffect(() => {
      if (!isPlaying) {
        setShowControls(true);
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      }
    }, [isPlaying]);

    // Play / Pause Toggle
    const togglePlay = useCallback(() => {
      const video = videoRef.current;
      if (!video) return;

      if (video.paused) {
        video.play().catch(() => {});
        setCenterPulse("play");
      } else {
        video.pause();
        setCenterPulse("pause");
      }
      setTimeout(() => setCenterPulse(null), 500);
    }, []);

    // Seek Helper
    const seekRelative = useCallback((deltaSeconds: number) => {
      const video = videoRef.current;
      if (!video) return;

      video.currentTime = Math.max(0, Math.min(video.duration || 0, video.currentTime + deltaSeconds));
      setSeekRipple(deltaSeconds > 0 ? "forward" : "backward");
      if (seekRippleTimeoutRef.current) clearTimeout(seekRippleTimeoutRef.current);
      seekRippleTimeoutRef.current = setTimeout(() => setSeekRipple(null), 600);
    }, []);

    // Fullscreen Toggle
    const toggleFullscreen = useCallback(() => {
      const container = containerRef.current;
      if (!container) return;

      if (!document.fullscreenElement) {
        container.requestFullscreen().catch(() => {});
        setIsFullscreen(true);
      } else {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }, []);

    // Sync fullscreen state with Esc key or native exit
    useEffect(() => {
      const handleFullscreenChange = () => {
        setIsFullscreen(!!document.fullscreenElement);
      };
      document.addEventListener("fullscreenchange", handleFullscreenChange);
      return () => {
        document.removeEventListener("fullscreenchange", handleFullscreenChange);
      };
    }, []);

    // PiP Toggle
    const togglePip = useCallback(async () => {
      const video = videoRef.current;
      if (!video) return;

      try {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
        } else if (document.pictureInPictureEnabled) {
          await video.requestPictureInPicture();
        }
      } catch {
        // ignore
      }
    }, []);

    // Volume Change
    const handleVolumeChange = useCallback((newVol: number) => {
      const video = videoRef.current;
      if (!video) return;
      video.volume = newVol;
      setVolume(newVol);
      setIsMuted(newVol === 0);
    }, []);

    const toggleMute = useCallback(() => {
      const video = videoRef.current;
      if (!video) return;
      setIsMuted((prev) => {
        const nextMuted = !prev;
        video.muted = nextMuted;
        return nextMuted;
      });
    }, []);

    // Quality selection
    const handleQualityChange = (levelIndex: number) => {
      if (!hlsRef.current) return;
      hlsRef.current.currentLevel = levelIndex;
      setCurrentQuality(levelIndex);
    };

    // Playback rate selection
    const handleRateChange = (rate: number) => {
      const video = videoRef.current;
      if (!video) return;
      video.playbackRate = rate;
      setPlaybackRate(rate);
    };

    // Progress Bar Scrubbing
    const handleScrub = (e: React.MouseEvent<HTMLDivElement>) => {
      const video = videoRef.current;
      const rect = e.currentTarget.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      if (video && video.duration) {
        video.currentTime = pos * video.duration;
      }
    };

    const handleScrubHover = (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      setHoverPos(e.clientX - rect.left);
      if (duration > 0) {
        setHoverTime(pos * duration);
      }
    };

    // Keyboard Shortcuts (Space, K, J, L, F, M, Arrows)
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        // Ignore if user is typing in input or textarea
        const activeTag = (document.activeElement?.tagName || "").toLowerCase();
        if (activeTag === "input" || activeTag === "textarea") return;

        switch (e.key.toLowerCase()) {
          case " ":
          case "k":
            e.preventDefault();
            togglePlay();
            break;
          case "j":
          case "arrowleft":
            e.preventDefault();
            seekRelative(-10);
            break;
          case "l":
          case "arrowright":
            e.preventDefault();
            seekRelative(10);
            break;
          case "arrowup":
            e.preventDefault();
            setVolume((prevVol) => {
              const newVol = Math.min(1, Number((prevVol + 0.1).toFixed(2)));
              if (videoRef.current) videoRef.current.volume = newVol;
              setIsMuted(newVol === 0);
              return newVol;
            });
            break;
          case "arrowdown":
            e.preventDefault();
            setVolume((prevVol) => {
              const newVol = Math.max(0, Number((prevVol - 0.1).toFixed(2)));
              if (videoRef.current) videoRef.current.volume = newVol;
              setIsMuted(newVol === 0);
              return newVol;
            });
            break;
          case "m":
            e.preventDefault();
            toggleMute();
            break;
          case "f":
            e.preventDefault();
            toggleFullscreen();
            break;
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, [togglePlay, seekRelative, toggleFullscreen, toggleMute]);

    // Sync HTML5 Video Events
    const handleTimeUpdate = () => {
      const video = videoRef.current;
      if (!video) return;
      setCurrentTime(video.currentTime);
      if (video.buffered.length > 0) {
        setBufferedEnd(video.buffered.end(video.buffered.length - 1));
      }
      onTimeUpdate?.();
    };

    const playedPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
    const bufferedPercent = duration > 0 ? (bufferedEnd / duration) * 100 : 0;

    return (
      <div
        ref={containerRef}
        onMouseMove={handleActivity}
        onMouseEnter={handleActivity}
        onMouseLeave={() => isPlaying && setShowControls(false)}
        className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden select-none group shadow-2xl ring-1 ring-border/40 focus:outline-none"
        tabIndex={0}
      >
        {/* Native Video Element */}
        <video
          ref={videoRef}
          poster={poster}
          playsInline
          onClick={togglePlay}
          onDoubleClick={toggleFullscreen}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={() => {
            if (videoRef.current) setDuration(videoRef.current.duration);
          }}
          className="w-full h-full object-contain cursor-pointer"
        />

        {/* Center Ripple Icons for Tap / Playback Feedback */}
        {centerPulse && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white scale-110 animate-ping">
              {centerPulse === "play" ? (
                <Play className="w-8 h-8 fill-current ml-1" />
              ) : (
                <Pause className="w-8 h-8 fill-current" />
              )}
            </div>
          </div>
        )}

        {/* Double-tap Seek Animations */}
        {seekRipple && (
          <div
            className={clsx(
              "absolute inset-y-0 w-1/3 flex items-center justify-center pointer-events-none z-20 bg-white/5 backdrop-blur-xs",
              seekRipple === "backward" ? "left-0" : "right-0"
            )}
          >
            <div className="flex flex-col items-center gap-1 text-white font-bold text-xs animate-bounce">
              {seekRipple === "backward" ? (
                <>
                  <RotateCcw className="w-7 h-7" />
                  <span>-10s</span>
                </>
              ) : (
                <>
                  <RotateCw className="w-7 h-7" />
                  <span>+10s</span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Floating Top Bar (Live Badge / Status) */}
        <div
          className={clsx(
            "absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-30 transition-opacity duration-300 pointer-events-none",
            showControls ? "opacity-100" : "opacity-0"
          )}
        >
          {isLive && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/90 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-600/20 backdrop-blur-md">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>LIVE</span>
            </div>
          )}
        </div>

        {/* Bottom Floating Control Bar */}
        <div
          className={clsx(
            "absolute bottom-0 left-0 right-0 p-3 sm:p-4 bg-gradient-to-t from-black/95 via-black/60 to-transparent z-30 transition-all duration-300 space-y-2",
            showControls ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
          )}
        >
          {/* Custom Precision Scrubber Bar (Only for non-live VOD) */}
          {!isLive && (
            <div
              onClick={handleScrub}
              onMouseMove={handleScrubHover}
              onMouseLeave={() => setHoverTime(null)}
              className="relative w-full py-2 -my-2 cursor-pointer group/scrub"
            >
              <div className="relative w-full h-1.5 group-hover/scrub:h-2.5 bg-white/25 rounded-full transition-all duration-150 overflow-hidden">
                {/* Buffer Bar */}
                <div
                  style={{ width: `${bufferedPercent}%` }}
                  className="absolute top-0 left-0 bottom-0 bg-white/40 rounded-full transition-all duration-200"
                />
                {/* Played Bar */}
                <div
                  style={{ width: `${playedPercent}%` }}
                  className="absolute top-0 left-0 bottom-0 bg-red-600 rounded-full"
                />
              </div>
              {/* Scrubber Thumb */}
              <div
                style={{ left: `${playedPercent}%` }}
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-white border-2 border-red-600 shadow-md scale-0 group-hover/scrub:scale-100 transition-transform pointer-events-none"
              />
              {/* Hover Time Tooltip */}
              {hoverTime !== null && (
                <div
                  style={{ left: `${hoverPos}px` }}
                  className="absolute -top-7 -translate-x-1/2 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-black/90 text-white border border-white/25 shadow-lg pointer-events-none"
                >
                  {formatTime(hoverTime)}
                </div>
              )}
            </div>
          )}

          {/* Control Buttons Row */}
          <div className="flex items-center justify-between text-white select-none">
            {/* Left Controls: Play/Pause, Seek, Volume, Time */}
            <div className="flex items-center gap-1.5 sm:gap-2.5">
              <Button
                variant="ghost"
                size="icon"
                onClick={togglePlay}
                className="h-9 w-9 text-white hover:text-white hover:bg-white/15 rounded-full transition-transform active:scale-90"
                title={isPlaying ? "Pause (k / space)" : "Play (k / space)"}
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
              </Button>

              {!isLive && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => seekRelative(-10)}
                    className="h-8 w-8 text-white/90 hover:text-white hover:bg-white/15 rounded-full hidden sm:inline-flex"
                    title="Rewind 10s (j / left arrow)"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => seekRelative(10)}
                    className="h-8 w-8 text-white/90 hover:text-white hover:bg-white/15 rounded-full hidden sm:inline-flex"
                    title="Forward 10s (l / right arrow)"
                  >
                    <RotateCw className="w-4 h-4" />
                  </Button>
                </>
              )}

              {/* Volume Slider Group - Always Nicely Visible */}
              <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-xs px-2 py-1 rounded-full border border-white/15">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMute}
                  className="h-7 w-7 text-white/90 hover:text-white hover:bg-white/15 rounded-full p-0"
                  title={isMuted ? "Unmute (m)" : "Mute (m)"}
                  aria-label={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4 text-red-400" />
                  ) : volume < 0.5 ? (
                    <Volume1 className="w-4 h-4 text-white" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-white" />
                  )}
                </Button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  style={{
                    background: `linear-gradient(to right, #ef4444 ${isMuted ? 0 : Math.round(volume * 100)}%, rgba(255,255,255,0.25) ${isMuted ? 0 : Math.round(volume * 100)}%)`,
                  }}
                  className="w-14 sm:w-20 hover:w-24 transition-all duration-200 h-1.5 rounded-full accent-red-500 cursor-pointer shadow-xs focus:outline-none"
                  title={`Volume: ${isMuted ? 0 : Math.round(volume * 100)}% (Up/Down arrow)`}
                  aria-label="Volume slider"
                />
              </div>

              {/* Time Display */}
              <div className="text-xs font-mono text-white/90 pl-1 sm:pl-2">
                {isLive ? (
                  <span className="flex items-center gap-1.5 text-red-500 font-bold bg-red-500/10 px-2.5 py-1 rounded-full border border-red-500/20">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    LIVE STREAM
                  </span>
                ) : (
                  <span className="px-1.5 py-0.5 rounded bg-black/40">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                )}
              </div>
            </div>

            {/* Right Controls: Quality, Speed, PiP, Fullscreen */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Quality Selector Menu */}
              {qualityLevels.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-xs font-semibold text-white/90 hover:text-white hover:bg-white/10 rounded-full gap-1"
                      title="Quality"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">
                        {currentQuality === -1 ? "Auto" : `${qualityLevels[currentQuality]?.height}p`}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    container={containerRef.current}
                    align="end"
                    className="w-36 bg-zinc-900/95 border-zinc-800 text-white text-xs z-[9999]"
                  >
                    <DropdownMenuLabel className="text-[11px] text-zinc-400">Stream Quality</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-zinc-800" />
                    <DropdownMenuItem
                      onClick={() => handleQualityChange(-1)}
                      className="justify-between cursor-pointer focus:bg-zinc-800"
                    >
                      <span>Auto</span>
                      {currentQuality === -1 && <Check className="w-3.5 h-3.5 text-primary" />}
                    </DropdownMenuItem>
                    {qualityLevels.map((lvl) => (
                      <DropdownMenuItem
                        key={lvl.id}
                        onClick={() => handleQualityChange(lvl.id)}
                        className="justify-between cursor-pointer focus:bg-zinc-800"
                      >
                        <span>{lvl.height}p</span>
                        {currentQuality === lvl.id && <Check className="w-3.5 h-3.5 text-primary" />}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Playback Speed Menu (non-live) */}
              {!isLive && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-xs font-semibold text-white/90 hover:text-white hover:bg-white/10 rounded-full gap-1"
                      title="Playback Speed"
                    >
                      <Settings className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{playbackRate}x</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    container={containerRef.current}
                    align="end"
                    className="w-32 bg-zinc-900/95 border-zinc-800 text-white text-xs z-[9999]"
                  >
                    <DropdownMenuLabel className="text-[11px] text-zinc-400">Playback Speed</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-zinc-800" />
                    {PLAYBACK_RATES.map((rate) => (
                      <DropdownMenuItem
                        key={rate}
                        onClick={() => handleRateChange(rate)}
                        className="justify-between cursor-pointer focus:bg-zinc-800"
                      >
                        <span>{rate === 1 ? "Normal" : `${rate}x`}</span>
                        {playbackRate === rate && <Check className="w-3.5 h-3.5 text-primary" />}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Picture in Picture */}
              <Button
                variant="ghost"
                size="icon"
                onClick={togglePip}
                className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/10 rounded-full hidden sm:inline-flex"
                title="Picture in Picture"
              >
                <PictureInPicture2 className="w-4 h-4" />
              </Button>

              {/* Fullscreen */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleFullscreen}
                className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/10 rounded-full"
                title={isFullscreen ? "Exit Fullscreen (f)" : "Fullscreen (f)"}
              >
                {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

VideoPlayer.displayName = "VideoPlayer";
export default VideoPlayer;
