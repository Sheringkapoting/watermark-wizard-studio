
import React from 'react';
import { SourceImage } from '@/types/watermark';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Check, Download } from "lucide-react";

interface ImageGalleryProps {
  images: SourceImage[];
  currentIndex: number;
  onSelect: (index: number) => void;
  onRemove: (id: string) => void;
  onDownload: (id: string) => void;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  currentIndex,
  onSelect,
  onRemove,
  onDownload
}) => {
  if (images.length === 0) {
    return null;
  }
  
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">Source Images ({images.length})</h3>
      
      <div className="flex flex-wrap gap-2">
        {images.map((image, index) => (
          <Card 
            key={image.id}
            className={`relative overflow-hidden cursor-pointer ${
              index === currentIndex ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => onSelect(index)}
          >
            <div className="h-20 w-20 relative">
              <img 
                src={image.src} 
                alt={image.name || `Image ${index + 1}`}
                className="object-cover w-full h-full"
              />
              {image.watermarks.length > 0 && (
                <div className="absolute top-1 right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {image.watermarks.length}
                </div>
              )}
              {image.resultSrc && (
                <div className="absolute bottom-1 right-1">
                  <Check className="h-4 w-4 text-green-500 bg-white rounded-full p-0.5" />
                </div>
              )}
            </div>
            
            <div className="absolute top-0 right-0 flex">
              {image.resultSrc && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 bg-white/80 hover:bg-white text-blue-500"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDownload(image.id);
                  }}
                >
                  <Download className="h-3 w-3" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 bg-white/80 hover:bg-white text-red-500"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(image.id);
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
