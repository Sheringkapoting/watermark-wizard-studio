
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

  const [history, setHistory] = useState<VideoEditorState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isCutMode, setIsCutMode] = useState(false);
  const [cropMode, setCropMode] = useState(false);

  useEffect(() => {
    // Reset editor state when video changes
    setEditorState({
      currentTime: 0,
      isPlaying: false,
      segments: [],
      selectedSegmentId: null,
      zoom: 1
    });
    setHistory([]);
    setHistoryIndex(-1);
  }, [videoClip.id]);

  // Update undo/redo availability
  useEffect(() => {
    setToolbarState(prev => ({
      ...prev,
      canUndo: historyIndex > 0,
      canRedo: historyIndex < history.length - 1
    }));
  }, [historyIndex, history.length]);

  const saveToHistory = (state: VideoEditorState) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(state);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

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

    const newState = {
      ...editorState,
      segments: [...editorState.segments, newSegment],
      selectedSegmentId: newSegment.id
    };

    setEditorState(newState);
    saveToHistory(newState);

    toast({
      title: "Segment Added",
      description: `New segment created at ${newSegment.startTime.toFixed(2)}s`,
    });
  };

  const handleSegmentMove = (segmentId: string, startTime: number, endTime: number) => {
    const newState = {
      ...editorState,
      segments: editorState.segments.map(segment =>
        segment.id === segmentId
          ? { ...segment, startTime, endTime }
          : segment
      )
    };
    setEditorState(newState);
    saveToHistory(newState);
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
    if (!editorState.selectedSegmentId) {
      // Create a new segment from current time for cutting
      const cutSegment: VideoSegment = {
        id: `cut-${Date.now()}`,
        startTime: editorState.currentTime,
        endTime: Math.min(editorState.currentTime + 5, videoClip.duration),
        color: generateRandomColor(),
        name: `Cut ${editorState.segments.length + 1}`
      };

      const newState = {
        ...editorState,
        segments: [...editorState.segments, cutSegment],
        selectedSegmentId: cutSegment.id
      };

      setEditorState(newState);
      saveToHistory(newState);
      setIsCutMode(true);

      toast({
        title: "Cut Mode",
        description: "Select segment edges on timeline to trim. Click again to exit cut mode.",
      });
    } else {
      setIsCutMode(!isCutMode);
      toast({
        title: isCutMode ? "Cut Mode Off" : "Cut Mode On",
        description: isCutMode ? "Cut mode deactivated" : "Adjust segment edges to cut video",
      });
    }
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setEditorState(history[newIndex]);
      toast({
        title: "Undo",
        description: "Last action undone",
      });
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setEditorState(history[newIndex]);
      toast({
        title: "Redo",
        description: "Action redone",
      });
    }
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
    setCropMode(!cropMode);
    toast({
      title: cropMode ? "Crop Mode Off" : "Crop Mode On",
      description: cropMode ? "Crop mode deactivated" : "Crop functionality activated - implementation in progress",
    });
  };

  const handleCopy = () => {
    if (editorState.selectedSegmentId) {
      const segmentToCopy = editorState.segments.find(s => s.id === editorState.selectedSegmentId);
      if (segmentToCopy) {
        const copiedSegment: VideoSegment = {
          ...segmentToCopy,
          id: `segment-${Date.now()}`,
          name: `${segmentToCopy.name} (Copy)`,
          startTime: Math.min(segmentToCopy.endTime, videoClip.duration - (segmentToCopy.endTime - segmentToCopy.startTime))
        };
        copiedSegment.endTime = Math.min(copiedSegment.startTime + (segmentToCopy.endTime - segmentToCopy.startTime), videoClip.duration);

        const newState = {
          ...editorState,
          segments: [...editorState.segments, copiedSegment],
          selectedSegmentId: copiedSegment.id
        };

        setEditorState(newState);
        saveToHistory(newState);

        toast({
          title: "Segment Copied",
          description: "Segment duplicated successfully",
        });
      }
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
