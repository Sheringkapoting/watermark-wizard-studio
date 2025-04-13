
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { VideoUploader } from "./VideoUploader";
import { VideoEditor } from "./VideoEditor";
import { VideoClipList } from "./VideoClipList";
import { VideoClip } from "@/types/video";
import { toast } from "@/hooks/use-toast";

export const VideoTab = () => {
  const [sourceVideo, setSourceVideo] = useState<VideoClip | null>(null);
  const [videoClips, setVideoClips] = useState<VideoClip[]>([]);
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);

  const handleVideoUpload = (src: string, name: string, type: string, duration: number) => {
    const newVideo: VideoClip = {
      id: `video-${Date.now()}`,
      src,
      name,
      type,
      startTime: 0,
      endTime: duration,
      duration
    };
    
    setSourceVideo(newVideo);
    // If it's the first video, also add it to clips
    if (videoClips.length === 0) {
      setVideoClips([newVideo]);
      setSelectedClipId(newVideo.id);
    }
  };

  const handleTrim = (startTime: number, endTime: number) => {
    if (!sourceVideo) return;
    
    // Create a new clip with the trimmed portion
    const newClip: VideoClip = {
      id: `clip-${Date.now()}`,
      src: sourceVideo.src,
      name: `${sourceVideo.name}-clip-${videoClips.length + 1}`,
      type: sourceVideo.type,
      startTime,
      endTime,
      duration: sourceVideo.duration,
    };
    
    setVideoClips(prev => [...prev, newClip]);
    setSelectedClipId(newClip.id);
    
    toast({
      title: "Clip Created",
      description: `New clip created from ${formatTime(startTime)} to ${formatTime(endTime)}`,
    });
  };

  const handleSelectClip = (clipId: string) => {
    const clip = videoClips.find(c => c.id === clipId);
    if (clip) {
      setSourceVideo(clip);
      setSelectedClipId(clipId);
    }
  };

  const handleDeleteClip = (clipId: string) => {
    setVideoClips(prev => prev.filter(clip => clip.id !== clipId));
    
    // If the deleted clip was selected, select the first available clip
    if (selectedClipId === clipId) {
      const remainingClips = videoClips.filter(clip => clip.id !== clipId);
      setSelectedClipId(remainingClips.length > 0 ? remainingClips[0].id : null);
      setSourceVideo(remainingClips.length > 0 ? remainingClips[0] : null);
    }
  };

  const resetVideo = () => {
    if (videoClips.length > 0) {
      // Just reset to the first clip
      setSourceVideo(videoClips[0]);
      setSelectedClipId(videoClips[0].id);
    } else {
      setSourceVideo(null);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_350px] gap-6">
      <Card className="p-6">
        {!sourceVideo ? (
          <VideoUploader
            id="source-video-upload"
            onUpload={handleVideoUpload}
            buttonText="Upload Video"
            description="Upload a video to edit (MP4, WebM, etc.)"
          />
        ) : (
          <VideoEditor
            videoClip={sourceVideo}
            onTrim={handleTrim}
            onChangeVideo={resetVideo}
          />
        )}
      </Card>
      
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Video Clips</h2>
        <VideoClipList
          clips={videoClips}
          onSelectClip={handleSelectClip}
          onDeleteClip={handleDeleteClip}
          selectedClipId={selectedClipId}
        />
      </Card>
    </div>
  );
};
