
import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { VideoClip, VideoSegment, VideoEditorState } from "@/types/video";
import { VideoPreview, VideoPreviewRef } from "./VideoPreview";
import { VideoTimeline } from "./VideoTimeline";
import { VideoControls } from "./VideoControls";
import { toast } from "@/hooks/use-toast";

interface VideoEditorProps {
  videoClip: VideoClip;
  onTrim: (startTime: number, endTime: number) => void;
  onChangeVideo: () => void;
}

const generateRandomColor = () => {
  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

export const VideoEditor = ({ 
  videoClip, 
  onTrim, 
  onChangeVideo 
}: VideoEditorProps) => {
  const videoPreviewRef = useRef<VideoPreviewRef>(null);
  
  const [editorState, setEditorState] = useState<VideoEditorState>({
    currentTime: 0,
    isPlaying: false,
    segments: [],
    selectedSegmentId: null,
    zoom: 1
  });

  useEffect(() => {
    // Reset editor state when video changes
    setEditorState({
      currentTime: 0,
      isPlaying: false,
      segments: [],
      selectedSegmentId: null,
      zoom: 1
    });
  }, [videoClip.id]);

  const handleTimeUpdate = (time: number) => {
    setEditorState(prev => ({
      ...prev,
      currentTime: time
    }));
  };

  const handlePlayToggle = () => {
    setEditorState(prev => ({
      ...prev,
      isPlaying: !prev.isPlaying
    }));
  };

  const handleSeek = (time: number) => {
    setEditorState(prev => ({
      ...prev,
      currentTime: time
    }));
    videoPreviewRef.current?.seek(time);
  };

  const handleAddSegment = () => {
    const newSegment: VideoSegment = {
      id: `segment-${Date.now()}`,
      startTime: editorState.currentTime,
      endTime: Math.min(editorState.currentTime + 10, videoClip.duration),
      color: generateRandomColor(),
      name: `Segment ${editorState.segments.length + 1}`
    };

    setEditorState(prev => ({
      ...prev,
      segments: [...prev.segments, newSegment],
      selectedSegmentId: newSegment.id
    }));

    toast({
      title: "Segment Added",
      description: `New segment created at ${newSegment.startTime.toFixed(2)}s`,
    });
  };

  const handleSegmentMove = (segmentId: string, startTime: number, endTime: number) => {
    setEditorState(prev => ({
      ...prev,
      segments: prev.segments.map(segment =>
        segment.id === segmentId
          ? { ...segment, startTime, endTime }
          : segment
      )
    }));
  };

  const handleSegmentSelect = (segmentId: string | null) => {
    setEditorState(prev => ({
      ...prev,
      selectedSegmentId: segmentId
    }));
  };

  const handleDeleteSegment = (segmentId: string) => {
    setEditorState(prev => ({
      ...prev,
      segments: prev.segments.filter(s => s.id !== segmentId),
      selectedSegmentId: prev.selectedSegmentId === segmentId ? null : prev.selectedSegmentId
    }));

    toast({
      title: "Segment Deleted",
      description: "Segment removed from timeline",
    });
  };

  const handleZoomChange = (zoom: number) => {
    setEditorState(prev => ({
      ...prev,
      zoom
    }));
  };

  const handleSaveProject = () => {
    // TODO: Implement project saving
    toast({
      title: "Project Saved",
      description: "Your project has been saved successfully",
    });
  };

  const handleExportVideo = () => {
    if (editorState.segments.length === 0) {
      toast({
        title: "No Segments",
        description: "Please add at least one segment to export",
        variant: "destructive"
      });
      return;
    }

    // Export the first segment for now
    const firstSegment = editorState.segments[0];
    onTrim(firstSegment.startTime, firstSegment.endTime);
  };

  return (
    <div className="w-full space-y-6">
      {/* Video Preview */}
      <VideoPreview
        ref={videoPreviewRef}
        videoClip={videoClip}
        currentTime={editorState.currentTime}
        isPlaying={editorState.isPlaying}
        onTimeUpdate={handleTimeUpdate}
        onPlayToggle={handlePlayToggle}
        onSeek={handleSeek}
      />

      {/* Timeline */}
      <div className="overflow-x-auto">
        <VideoTimeline
          videoClip={videoClip}
          currentTime={editorState.currentTime}
          segments={editorState.segments}
          selectedSegmentId={editorState.selectedSegmentId}
          zoom={editorState.zoom}
          onTimeChange={handleSeek}
          onSegmentSelect={handleSegmentSelect}
          onSegmentMove={handleSegmentMove}
        />
      </div>

      {/* Controls */}
      <VideoControls
        segments={editorState.segments}
        selectedSegmentId={editorState.selectedSegmentId}
        zoom={editorState.zoom}
        onZoomChange={handleZoomChange}
        onAddSegment={handleAddSegment}
        onDeleteSegment={handleDeleteSegment}
        onSaveProject={handleSaveProject}
        onExportVideo={handleExportVideo}
      />

      {/* Action Buttons */}
      <div className="flex justify-between pt-4 border-t">
        <Button
          variant="outline"
          onClick={onChangeVideo}
        >
          Change Video
        </Button>
        
        <div className="flex gap-2">
          <Button
            onClick={handleAddSegment}
            className="flex items-center gap-2"
          >
            Add New Segment
          </Button>
        </div>
      </div>
    </div>
  );
};
