import React, { useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, SkipBack, SkipForward } from "lucide-react";
import { VideoClip } from "@/types/video";
import { formatTime } from "@/lib/utils";

interface VideoPreviewProps {
  videoClip: VideoClip;
  currentTime: number;
  isPlaying: boolean;
  onTimeUpdate: (time: number) => void;
  onPlayToggle: () => void;
  onSeek: (time: number) => void;
}

export interface VideoPreviewRef {
  seek: (time: number) => void;
  play: () => void;
  pause: () => void;
}

export const VideoPreview = forwardRef<VideoPreviewRef, VideoPreviewProps>(({
  videoClip,
  currentTime,
  isPlaying,
  onTimeUpdate,
  onPlayToggle,
  onSeek
}, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useImperativeHandle(ref, () => ({
    seek: (time: number) => {
      if (videoRef.current) {
        videoRef.current.currentTime = time;
      }
    },
    play: () => {
      if (videoRef.current) {
        videoRef.current.play();
      }
    },
    pause: () => {
      if (videoRef.current) {
        videoRef.current.pause();
      }
    }
  }));

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      onTimeUpdate(video.currentTime);
    };

    const handleEnded = () => {
      onTimeUpdate(video.currentTime);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
    };
  }, [onTimeUpdate]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.play().catch(console.error);
    } else {
      video.pause();
    }
  }, [isPlaying]);

  const handleSkipBack = () => {
    const newTime = Math.max(0, currentTime - 10);
    onSeek(newTime);
  };

  const handleSkipForward = () => {
    const newTime = Math.min(videoClip.duration, currentTime + 10);
    onSeek(newTime);
  };

  return (
    <div className="relative rounded-lg overflow-hidden bg-black">
      <video
        ref={videoRef}
        src={videoClip.src}
        className="w-full h-auto max-h-[60vh] object-contain"
        onClick={onPlayToggle}
      />
      
      <div className="absolute bottom-4 left-4 right-4">
        <div className="bg-black/70 backdrop-blur-sm rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white hover:bg-white/20 h-8 w-8"
                onClick={handleSkipBack}
              >
                <SkipBack className="h-4 w-4" />
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white hover:bg-white/20 h-10 w-10"
                onClick={onPlayToggle}
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white hover:bg-white/20 h-8 w-8"
                onClick={handleSkipForward}
              >
                <SkipForward className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="text-white text-sm font-mono">
              {formatTime(currentTime)} / {formatTime(videoClip.duration)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

VideoPreview.displayName = "VideoPreview";