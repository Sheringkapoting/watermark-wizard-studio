
import React from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import type { SourceImage } from "@/hooks/useImageUploader";

interface ImageSelectorProps {
  images: SourceImage[];
  activeIndex: number;
  onSelectImage: (index: number) => void;
  onRemoveImage: (id: string) => void;
}

export const ImageSelector = ({
  images,
  activeIndex,
  onSelectImage,
  onRemoveImage
}: ImageSelectorProps) => {
  if (images.length === 0) return null;

  return (
    <div className="mt-4">
      <h3 className="text-sm font-medium mb-2">Source Images ({images.length})</h3>
      
      <div className="flex items-center justify-between mb-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onSelectImage(Math.max(0, activeIndex - 1))}
          disabled={activeIndex === 0}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <span className="text-sm">
          {activeIndex + 1} of {images.length}
        </span>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onSelectImage(Math.min(images.length - 1, activeIndex + 1))}
          disabled={activeIndex === images.length - 1}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      <ScrollArea className="h-24">
        <div className="flex gap-2 p-1">
          {images.map((image, index) => (
            <div
              key={image.id}
              className={`relative group cursor-pointer rounded-md overflow-hidden border-2 ${
                index === activeIndex ? "border-blue-500" : "border-transparent"
              }`}
              onClick={() => onSelectImage(index)}
            >
              <img
                src={image.src}
                alt={`Source ${index + 1}`}
                className="h-16 w-16 object-cover"
              />
              <button
                className="absolute top-0 right-0 bg-red-500 text-white rounded-bl-md opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveImage(image.id);
                }}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
