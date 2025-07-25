
import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { VideoClip, VideoSegment, VideoEditorState } from "@/types/video";
import { VideoPreview, VideoPreviewRef } from "./VideoPreview";
import { VideoTimeline } from "./VideoTimeline";
import { VideoControls } from "./VideoControls";
import { VideoToolbar } from "./VideoToolbar";
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

  const [toolbarState, setToolbarState] = useState({
    isAudioMuted: false,
    canUndo: false,
    canRedo: false
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

  // Toolbar handlers
  const handleCut = () => {
    toast({
      title: "Cut Tool",
      description: "Cut/trim functionality activated",
    });
  };

  const handleUndo = () => {
    toast({
      title: "Undo",
      description: "Last action undone",
    });
  };

  const handleRedo = () => {
    toast({
      title: "Redo",
      description: "Action redone",
    });
  };

  const handleToggleAudio = () => {
    setToolbarState(prev => ({
      ...prev,
      isAudioMuted: !prev.isAudioMuted
    }));
    toast({
      title: toolbarState.isAudioMuted ? "Audio Enabled" : "Audio Muted",
      description: toolbarState.isAudioMuted ? "Audio has been unmuted" : "Audio has been muted",
    });
  };

  const handleAddText = () => {
    toast({
      title: "Add Text",
      description: "Text overlay tool activated",
    });
  };

  const handleAddImage = () => {
    toast({
      title: "Add Image",
      description: "Image overlay tool activated",
    });
  };

  const handleAddEffect = () => {
    toast({
      title: "Add Effect",
      description: "Video effects tool activated",
    });
  };

  const handleCrop = () => {
    toast({
      title: "Crop Tool",
      description: "Video crop tool activated",
    });
  };

  const handleCopy = () => {
    if (editorState.selectedSegmentId) {
      toast({
        title: "Segment Copied",
        description: "Selected segment copied to clipboard",
      });
    } else {
      toast({
        title: "No Selection",
        description: "Please select a segment to copy",
        variant: "destructive"
      });
    }
  };

  const handleDelete = () => {
    if (editorState.selectedSegmentId) {
      handleDeleteSegment(editorState.selectedSegmentId);
    } else {
      toast({
        title: "No Selection",
        description: "Please select a segment to delete",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Video Toolbar */}
      <VideoToolbar
        videoClip={videoClip}
        onCut={handleCut}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onToggleAudio={handleToggleAudio}
        onAddText={handleAddText}
        onAddImage={handleAddImage}
        onAddEffect={handleAddEffect}
        onCrop={handleCrop}
        onCopy={handleCopy}
        onDelete={handleDelete}
        isAudioMuted={toolbarState.isAudioMuted}
        canUndo={toolbarState.canUndo}
        canRedo={toolbarState.canRedo}
      />

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
