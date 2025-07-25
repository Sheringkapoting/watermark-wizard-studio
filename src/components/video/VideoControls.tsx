import React from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { 
  Scissors, 
  Download, 
  ZoomIn, 
  ZoomOut, 
  Plus,
  Trash2,
  Save
} from "lucide-react";
import { VideoSegment } from "@/types/video";

interface VideoControlsProps {
  segments: VideoSegment[];
  selectedSegmentId: string | null;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onAddSegment: () => void;
  onDeleteSegment: (segmentId: string) => void;
  onSaveProject: () => void;
  onExportVideo: () => void;
}

export const VideoControls = ({
  segments,
  selectedSegmentId,
  zoom,
  onZoomChange,
  onAddSegment,
  onDeleteSegment,
  onSaveProject,
  onExportVideo
}: VideoControlsProps) => {
  const selectedSegment = segments.find(s => s.id === selectedSegmentId);

  return (
    <div className="space-y-4">
      {/* Zoom Controls */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium">Zoom:</span>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onZoomChange(Math.max(0.5, zoom - 0.25))}
          className="h-8 w-8"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Slider
          min={0.5}
          max={3}
          step={0.25}
          value={[zoom]}
          onValueChange={(value) => onZoomChange(value[0])}
          className="w-20"
        />
        <Button
          variant="outline"
          size="icon"
          onClick={() => onZoomChange(Math.min(3, zoom + 0.25))}
          className="h-8 w-8"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <span className="text-sm text-gray-600">{zoom}x</span>
      </div>

      {/* Segment Controls */}
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={onAddSegment}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Segment
        </Button>
        
        {selectedSegment && (
          <Button
            variant="destructive"
            onClick={() => onDeleteSegment(selectedSegment.id)}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete Segment
          </Button>
        )}
        
        <Button
          variant="outline"
          onClick={onSaveProject}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          Save Project
        </Button>
        
        <Button
          variant="secondary"
          onClick={onExportVideo}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Export Video
        </Button>
      </div>

      {/* Selected Segment Info */}
      {selectedSegment && (
        <div className="p-3 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-sm mb-2">Selected Segment: {selectedSegment.name}</h4>
          <div className="text-xs text-gray-600">
            Start: {(selectedSegment.startTime).toFixed(2)}s | 
            End: {(selectedSegment.endTime).toFixed(2)}s | 
            Duration: {(selectedSegment.endTime - selectedSegment.startTime).toFixed(2)}s
          </div>
        </div>
      )}
    </div>
  );
};