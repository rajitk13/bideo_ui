"use client";

import React, { forwardRef } from "react";
import ReactPlayer from "react-player";
import {
  MediaController,
  MediaControlBar,
  MediaTimeRange,
  MediaTimeDisplay,
  MediaVolumeRange,
  MediaPlaybackRateButton,
  MediaPlayButton,
  MediaSeekBackwardButton,
  MediaSeekForwardButton,
  MediaMuteButton,
  MediaFullscreenButton,
  MediaPipButton,
  MediaPreviewThumbnail,
} from "media-chrome/react";

interface VideoPlayerProps {
  src: string;
  poster?: string;
  vttUrl?: string;
  storyboardUrl?: string;
  onTimeUpdate?: () => void;
}

const VideoPlayer = forwardRef<any, VideoPlayerProps>(
  ({ src, poster, vttUrl, onTimeUpdate }, ref) => {
    return (
      <MediaController
        style={{
          width: "100%",
          aspectRatio: "16/9",
        }}
      >
        <ReactPlayer
          ref={ref}
          slot="media"
          src={`/proxy/proxy-m3u8?url=${encodeURIComponent(src)}`}
          playing={false}
          light={poster}
          style={{
            width: "100%",
            height: "100%",
          }}
          controls={false}
          pip={true}
          onProgress={onTimeUpdate}
        />

        {vttUrl && (
          <track
            default
            kind="metadata"
            label="thumbnails"
            src={vttUrl}
          />
        )}

        <MediaControlBar>
          <MediaPlayButton />
          <MediaSeekBackwardButton seekOffset={10} />
          <MediaSeekForwardButton seekOffset={10} />
          <MediaTimeRange>
            {vttUrl && <MediaPreviewThumbnail slot="preview" />}
          </MediaTimeRange>
          <MediaTimeDisplay showDuration />
          <MediaMuteButton />
          <MediaVolumeRange />
          <MediaPlaybackRateButton />
          <MediaPipButton />
          <MediaFullscreenButton />
        </MediaControlBar>
      </MediaController>
    );
  }
);

VideoPlayer.displayName = "VideoPlayer";

export default VideoPlayer;
