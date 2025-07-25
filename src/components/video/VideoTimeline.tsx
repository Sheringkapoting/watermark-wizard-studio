import React, { useRef, useEffect, useState } from "react";
import { VideoClip, VideoSegment } from "@/types/video";
import { formatTime } from "@/lib/utils";

interface VideoTimelineProps {
  videoClip: VideoClip;
  currentTime: number;
  segments: VideoSegment[];
  selectedSegmentId: string | null;
  zoom: number;
  onTimeChange: (time: number) => void;
  onSegmentSelect: (segmentId: string | null) => void;
  onSegmentMove: (segmentId: string, startTime: number, endTime: number) => void;
}

export const VideoTimeline = ({
  videoClip,
  currentTime,
  segments,
  selectedSegmentId,
  zoom,
  onTimeChange,
  onSegmentSelect,
  onSegmentMove
}: VideoTimelineProps) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragSegmentId, setDragSegmentId] = useState<string | null>(null);
  const [dragType, setDragType] = useState<'move' | 'resize-start' | 'resize-end' | null>(null);

  const timelineWidth = 800 * zoom;
  const pixelsPerSecond = timelineWidth / videoClip.duration;

  const handleTimelineClick = (e: React.MouseEvent) => {
    if (!timelineRef.current || isDragging) return;
    
    const rect = timelineRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickTime = (clickX / timelineWidth) * videoClip.duration;
    
    onTimeChange(Math.max(0, Math.min(videoClip.duration, clickTime)));
  };

  const handleMouseDown = (e: React.MouseEvent, segmentId: string, type: 'move' | 'resize-start' | 'resize-end') => {
    e.stopPropagation();
    setIsDragging(true);
    setDragSegmentId(segmentId);
    setDragType(type);
    onSegmentSelect(segmentId);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !dragSegmentId || !timelineRef.current) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseTime = (mouseX / timelineWidth) * videoClip.duration;
    
    const segment = segments.find(s => s.id === dragSegmentId);
    if (!segment) return;

    let newStartTime = segment.startTime;
    let newEndTime = segment.endTime;

    if (dragType === 'move') {
      const duration = segment.endTime - segment.startTime;
      newStartTime = Math.max(0, Math.min(videoClip.duration - duration, mouseTime - duration / 2));
      newEndTime = newStartTime + duration;
    } else if (dragType === 'resize-start') {
      newStartTime = Math.max(0, Math.min(segment.endTime - 0.1, mouseTime));
    } else if (dragType === 'resize-end') {
      newEndTime = Math.max(segment.startTime + 0.1, Math.min(videoClip.duration, mouseTime));
    }

    onSegmentMove(dragSegmentId, newStartTime, newEndTime);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragSegmentId(null);
    setDragType(null);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragSegmentId, dragType]);

  // Generate timeline markers
  const generateTimeMarkers = () => {
    const markers = [];
    const step = videoClip.duration > 60 ? 10 : videoClip.duration > 30 ? 5 : 1;
    
    for (let i = 0; i <= videoClip.duration; i += step) {
      const position = (i / videoClip.duration) * 100;
      markers.push(
        <div
          key={i}
          className="absolute top-0 flex flex-col items-center"
          style={{ left: `${position}%` }}
        >
          <div className="w-px h-4 bg-gray-400" />
          <span className="text-xs text-gray-600 mt-1">{formatTime(i)}</span>
        </div>
      );
    }
    
    return markers;
  };

  return (
    <div className="w-full bg-gray-100 rounded-lg p-4">
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Timeline</h3>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>0:00</span>
          <span>{formatTime(videoClip.duration)}</span>
        </div>
      </div>
      
      <div 
        ref={timelineRef}
        className="relative h-20 bg-gray-200 rounded cursor-pointer overflow-hidden"
        style={{ width: `${timelineWidth}px` }}
        onClick={handleTimelineClick}
      >
        {/* Time markers */}
        <div className="absolute inset-0">
          {generateTimeMarkers()}
        </div>
        
        {/* Segments */}
        {segments.map((segment) => {
          const left = (segment.startTime / videoClip.duration) * 100;
          const width = ((segment.endTime - segment.startTime) / videoClip.duration) * 100;
          const isSelected = segment.id === selectedSegmentId;
          
          return (
            <div
              key={segment.id}
              className={`absolute top-8 h-8 rounded cursor-move transition-all ${
                isSelected ? 'ring-2 ring-blue-500 ring-offset-1' : ''
              }`}
              style={{
                left: `${left}%`,
                width: `${width}%`,
                backgroundColor: segment.color,
                opacity: 0.8
              }}
              onMouseDown={(e) => handleMouseDown(e, segment.id, 'move')}
            >
              {/* Resize handles */}
              <div
                className="absolute left-0 top-0 w-2 h-full bg-black/20 cursor-w-resize"
                onMouseDown={(e) => handleMouseDown(e, segment.id, 'resize-start')}
              />
              <div
                className="absolute right-0 top-0 w-2 h-full bg-black/20 cursor-e-resize"
                onMouseDown={(e) => handleMouseDown(e, segment.id, 'resize-end')}
              />
              
              {/* Segment label */}
              <div className="px-2 py-1 text-xs text-white font-medium truncate">
                {segment.name}
              </div>
            </div>
          );
        })}
        
        {/* Playhead */}
        <div
          className="absolute top-0 w-0.5 h-full bg-red-500 z-10"
          style={{ left: `${(currentTime / videoClip.duration) * 100}%` }}
        >
          <div className="absolute -top-2 -left-2 w-4 h-4 bg-red-500 rotate-45 transform origin-center" />
        </div>
      </div>
    </div>
  );
};