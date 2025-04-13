
import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { VideoClip, VideoTrimming } from "@/types/video";
import { Play, Pause, Scissors, Download } from "lucide-react";
import { formatTime } from "@/lib/utils";

interface VideoEditorProps {
  videoClip: VideoClip;
  onTrim: (startTime: number, endTime: number) => void;
  onChangeVideo: () => void;
}

export const VideoEditor = ({ 
  videoClip, 
  onTrim, 
  onChangeVideo 
}: VideoEditorProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [trimming, setTrimming] = useState<VideoTrimming>({
    currentTime: 0,
    startTrim: 0,
    endTrim: videoClip.duration,
  });
  const [isSeeking, setIsSeeking] = useState(false);

  useEffect(() => {
    // Update end trim when video duration changes
    setTrimming(prev => ({
      ...prev,
      endTrim: videoClip.duration
    }));
  }, [videoClip.duration]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => {
      setTrimming(prev => ({
        ...prev,
        currentTime: video.currentTime
      }));
    };

    const handleEnd = () => {
      setIsPlaying(false);
    };

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('ended', handleEnd);

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('ended', handleEnd);
    };
  }, []);

  // When seeking on the timeline
  const handleTimelineChange = (value: number[]) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value[0];
      setTrimming(prev => ({
        ...prev,
        currentTime: value[0]
      }));
    }
  };

  const handleTrimStartChange = (value: number[]) => {
    setTrimming(prev => ({
      ...prev,
      startTrim: Math.min(value[0], prev.endTrim - 1)
    }));
  };

  const handleTrimEndChange = (value: number[]) => {
    setTrimming(prev => ({
      ...prev,
      endTrim: Math.max(value[0], prev.startTrim + 1)
    }));
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      // If at the end of the trim range, go back to start
      if (trimming.currentTime >= trimming.endTrim) {
        videoRef.current.currentTime = trimming.startTrim;
      }
      
      // Check if we're before the start trim
      if (trimming.currentTime < trimming.startTrim) {
        videoRef.current.currentTime = trimming.startTrim;
      }
      
      videoRef.current.play();
    }
    
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    // Watch for current time reaching end trim
    if (isPlaying && trimming.currentTime >= trimming.endTrim && videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [trimming.currentTime, trimming.endTrim, isPlaying]);

  const handleTrimmingComplete = () => {
    onTrim(trimming.startTrim, trimming.endTrim);
  };

  return (
    <div className="w-full">
      <div className="relative rounded-md overflow-hidden bg-black">
        <video
          ref={videoRef}
          src={videoClip.src}
          className="w-full h-auto max-h-[60vh]"
          onClick={togglePlay}
        />
        
        <div className="absolute bottom-4 left-4 right-4 bg-black/50 p-2 rounded-md flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white"
            onClick={togglePlay}
          >
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </Button>
          <div className="text-white text-xs ml-2 min-w-[80px]">
            {formatTime(trimming.currentTime)} / {formatTime(videoClip.duration)}
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-6">
        <div>
          <div className="flex justify-between mb-2 text-sm font-medium">
            <span>Timeline</span>
            <span>{formatTime(trimming.currentTime)}</span>
          </div>
          <Slider
            min={0}
            max={videoClip.duration}
            step={0.01}
            value={[trimming.currentTime]}
            onValueChange={handleTimelineChange}
            className="cursor-grab active:cursor-grabbing"
          />
        </div>

        <div>
          <div className="flex justify-between mb-2 text-sm font-medium">
            <span>Trim Range</span>
            <span>{formatTime(trimming.startTrim)} - {formatTime(trimming.endTrim)}</span>
          </div>
          <div className="relative pt-5">
            {/* Background track */}
            <div className="absolute w-full h-2 bg-gray-200 rounded-full" />
            
            {/* Selected range */}
            <div 
              className="absolute h-2 bg-primary rounded-full" 
              style={{
                left: `${(trimming.startTrim / videoClip.duration) * 100}%`,
                width: `${((trimming.endTrim - trimming.startTrim) / videoClip.duration) * 100}%`
              }}
            />
            
            {/* Start trim handle */}
            <Slider
              min={0}
              max={videoClip.duration}
              step={0.01}
              value={[trimming.startTrim]}
              onValueChange={handleTrimStartChange}
              className="absolute w-full cursor-grab active:cursor-grabbing"
            />
            
            {/* End trim handle */}
            <Slider
              min={0}
              max={videoClip.duration}
              step={0.01}
              value={[trimming.endTrim]}
              onValueChange={handleTrimEndChange}
              className="absolute w-full cursor-grab active:cursor-grabbing"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={onChangeVideo}
        >
          Change Video
        </Button>
        
        <div className="flex gap-2">
          <Button
            onClick={handleTrimmingComplete}
            className="flex items-center"
          >
            <Scissors className="h-4 w-4 mr-2" />
            Trim Clip
          </Button>
          
          <Button
            variant="secondary"
            className="flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </div>
    </div>
  );
};
