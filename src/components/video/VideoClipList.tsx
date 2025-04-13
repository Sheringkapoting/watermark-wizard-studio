
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Play, Trash2 } from "lucide-react";
import { VideoClip } from "@/types/video";
import { formatTime } from "@/lib/utils";

interface VideoClipListProps {
  clips: VideoClip[];
  onSelectClip: (clipId: string) => void;
  onDeleteClip: (clipId: string) => void;
  selectedClipId: string | null;
}

export const VideoClipList = ({
  clips,
  onSelectClip,
  onDeleteClip,
  selectedClipId
}: VideoClipListProps) => {
  if (clips.length === 0) {
    return <div className="text-center text-gray-500 py-8">No clips created yet</div>;
  }

  return (
    <ScrollArea className="h-[300px] pr-4">
      <div className="space-y-3">
        {clips.map((clip) => (
          <div 
            key={clip.id} 
            className={`
              border rounded-md overflow-hidden
              ${selectedClipId === clip.id ? 'ring-2 ring-primary' : ''}
            `}
          >
            <div className="relative bg-gray-900 h-24 flex justify-center items-center">
              {clip.thumbnail ? (
                <img 
                  src={clip.thumbnail} 
                  alt={clip.name} 
                  className="h-full w-full object-cover"
                />
              ) : (
                <video 
                  src={clip.src}
                  className="h-full w-full object-cover"
                />
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <Button 
                  size="icon" 
                  variant="secondary" 
                  className="h-8 w-8"
                  onClick={() => onSelectClip(clip.id)}
                >
                  <Play className="h-4 w-4" />
                </Button>
              </div>
              <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                {formatTime(clip.endTime - clip.startTime)}
              </div>
            </div>
            <div className="p-2 flex items-center justify-between">
              <div className="truncate text-sm">
                <div className="font-medium">{clip.name}</div>
                <div className="text-xs text-gray-500">
                  {formatTime(clip.startTime)} - {formatTime(clip.endTime)}
                </div>
              </div>
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-7 w-7 text-gray-500 hover:text-red-500"
                onClick={() => onDeleteClip(clip.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};
