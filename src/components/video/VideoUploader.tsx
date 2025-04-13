
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VideoIcon, Upload } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface VideoUploaderProps {
  id: string;
  onUpload: (videoSrc: string, fileName: string, fileType: string, duration: number) => void;
  buttonText: string;
  description: string;
}

export const VideoUploader = ({ 
  id, 
  onUpload, 
  buttonText, 
  description 
}: VideoUploaderProps) => {
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        toast({
          title: "Invalid File Type",
          description: "Please upload a video file.",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const videoSrc = e.target?.result as string;
        
        // Create a temporary video element to get duration
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = () => {
          onUpload(videoSrc, file.name.split('.')[0], file.type, video.duration);
        };
        
        video.src = videoSrc;
      };
      reader.readAsDataURL(file);
      
      toast({
        title: "Video Uploaded",
        description: "Video has been loaded successfully.",
      });
    }
  };

  return (
    <div className="text-center p-10 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 w-full">
      <div className="mb-4">
        <VideoIcon className="h-12 w-12 mx-auto text-gray-400" />
        <h3 className="mt-2 text-sm font-semibold text-gray-900">No video selected</h3>
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      </div>
      <Input
        id={id}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={handleVideoUpload}
      />
      <label htmlFor={id}>
        <Button asChild variant="default">
          <span>
            <Upload className="h-4 w-4 mr-2" />
            {buttonText}
          </span>
        </Button>
      </label>
    </div>
  );
};
