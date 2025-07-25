import React from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Scissors, 
  Undo2, 
  Redo2, 
  AlertTriangle,
  Volume2,
  VolumeX,
  RotateCcw,
  MessageCircle,
  Ban,
  Image,
  Type,
  User,
  Palette,
  Sparkles,
  Filter,
  Crop,
  Copy,
  Trash2
} from "lucide-react";
import { VideoClip } from "@/types/video";

interface VideoToolbarProps {
  videoClip: VideoClip;
  onCut: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onToggleAudio: () => void;
  onAddText: () => void;
  onAddImage: () => void;
  onAddEffect: () => void;
  onCrop: () => void;
  onCopy: () => void;
  onDelete: () => void;
  isAudioMuted: boolean;
  canUndo: boolean;
  canRedo: boolean;
}

export const VideoToolbar = ({
  videoClip,
  onCut,
  onUndo,
  onRedo,
  onToggleAudio,
  onAddText,
  onAddImage,
  onAddEffect,
  onCrop,
  onCopy,
  onDelete,
  isAudioMuted,
  canUndo,
  canRedo
}: VideoToolbarProps) => {
  return (
    <div className="bg-primary text-primary-foreground px-4 py-2">
      <div className="flex items-center gap-2 overflow-x-auto">
        {/* Cut/Trim Tools */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onCut}
          className="text-primary-foreground hover:bg-primary-foreground/20 flex-shrink-0"
          title="Cut/Trim"
        >
          <Scissors className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={onCrop}
          className="text-primary-foreground hover:bg-primary-foreground/20 flex-shrink-0"
          title="Crop"
        >
          <Crop className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6 bg-primary-foreground/30" />

        {/* Undo/Redo */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onUndo}
          disabled={!canUndo}
          className="text-primary-foreground hover:bg-primary-foreground/20 disabled:opacity-50 flex-shrink-0"
          title="Undo"
        >
          <Undo2 className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={onRedo}
          disabled={!canRedo}
          className="text-primary-foreground hover:bg-primary-foreground/20 disabled:opacity-50 flex-shrink-0"
          title="Redo"
        >
          <Redo2 className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6 bg-primary-foreground/30" />

        {/* Warning/Alert */}
        <Button
          variant="ghost"
          size="icon"
          className="text-primary-foreground hover:bg-primary-foreground/20 flex-shrink-0"
          title="Warnings"
        >
          <AlertTriangle className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6 bg-primary-foreground/30" />

        {/* Audio Controls */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleAudio}
          className="text-primary-foreground hover:bg-primary-foreground/20 flex-shrink-0"
          title={isAudioMuted ? "Unmute Audio" : "Mute Audio"}
        >
          {isAudioMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="text-primary-foreground hover:bg-primary-foreground/20 flex-shrink-0"
          title="Reset"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6 bg-primary-foreground/30" />

        {/* Communication Tools */}
        <Button
          variant="ghost"
          size="icon"
          className="text-primary-foreground hover:bg-primary-foreground/20 flex-shrink-0"
          title="Comments"
        >
          <MessageCircle className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="text-primary-foreground hover:bg-primary-foreground/20 flex-shrink-0"
          title="Disable"
        >
          <Ban className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6 bg-primary-foreground/30" />

        {/* Media Tools */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onAddImage}
          className="text-primary-foreground hover:bg-primary-foreground/20 flex-shrink-0"
          title="Add Image"
        >
          <Image className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onAddText}
          className="text-primary-foreground hover:bg-primary-foreground/20 flex-shrink-0 gap-2"
          title="Add Text"
        >
          <Type className="h-4 w-4" />
          <span className="hidden sm:inline">Add Text</span>
        </Button>

        <Separator orientation="vertical" className="h-6 bg-primary-foreground/30" />

        {/* Effects and Filters */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onAddEffect}
          className="text-primary-foreground hover:bg-primary-foreground/20 flex-shrink-0"
          title="Effects"
        >
          <Sparkles className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="text-primary-foreground hover:bg-primary-foreground/20 flex-shrink-0"
          title="Filters"
        >
          <Filter className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="text-primary-foreground hover:bg-primary-foreground/20 flex-shrink-0"
          title="Color Correction"
        >
          <Palette className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6 bg-primary-foreground/30" />

        {/* Edit Actions */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onCopy}
          className="text-primary-foreground hover:bg-primary-foreground/20 flex-shrink-0"
          title="Copy"
        >
          <Copy className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          className="text-primary-foreground hover:bg-primary-foreground/20 flex-shrink-0"
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6 bg-primary-foreground/30" />

        {/* User Profile */}
        <Button
          variant="ghost"
          size="icon"
          className="text-primary-foreground hover:bg-primary-foreground/20 flex-shrink-0"
          title="User Profile"
        >
          <User className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};