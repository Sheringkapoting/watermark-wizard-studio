
import React from "react";
import { Button } from "@/components/ui/button";
import { Watermark } from "@/types/watermark";
import { WatermarkImage } from "./WatermarkImage";
import { ImageSelector } from "./ImageSelector";
import type { SourceImage } from "@/hooks/useImageUploader";

interface ImageEditorProps {
  sourceImages: SourceImage[];
  activeImageIndex: number;
  watermarks: Watermark[];
  onDragStart: (id: string, e: React.MouseEvent<HTMLImageElement> | React.TouchEvent<HTMLImageElement>) => void;
  onChangeImage: () => void;
  onProcessImage: () => void;
  onProcessAllImages: () => void;
  onRemoveImage: (id: string) => void;
  onSelectImage: (index: number) => void;
  onDownload: () => void;
  resultImage: string | null;
  isProcessing: boolean;
  imageContainerRef?: React.RefObject<HTMLDivElement>;
}

export const ImageEditor = ({
  sourceImages,
  activeImageIndex,
  watermarks,
  onDragStart,
  onChangeImage,
  onProcessImage,
  onProcessAllImages,
  onRemoveImage,
  onSelectImage,
  onDownload,
  resultImage,
  isProcessing,
  imageContainerRef
}: ImageEditorProps) => {
  const activeImage = sourceImages[activeImageIndex];
  
  // Filter watermarks to only show those for the active image
  const activeWatermarks = watermarks.filter(
    w => !w.sourceImageId || w.sourceImageId === activeImage?.id
  );

  return (
    <div className="w-full relative">
      <div className="relative" ref={imageContainerRef}>
        {activeImage && (
          <img
            src={activeImage.src}
            alt="Source"
            className="w-full h-auto rounded-md object-contain max-h-[60vh]"
          />
        )}
        
        {activeWatermarks.map((watermark) => (
          <WatermarkImage
            key={watermark.id}
            watermark={watermark}
            onDragStart={onDragStart}
          />
        ))}
      </div>

      <ImageSelector 
        images={sourceImages}
        activeIndex={activeImageIndex}
        onSelectImage={onSelectImage}
        onRemoveImage={onRemoveImage}
      />

      <div className="flex justify-between mt-4">
        <Button
          variant="outline"
          onClick={onChangeImage}
        >
          Add Image
        </Button>
        
        <div className="flex gap-2">
          <Button
            onClick={onProcessImage}
            disabled={activeWatermarks.length === 0 || isProcessing || sourceImages.length === 0}
          >
            {isProcessing ? "Processing..." : "Apply Watermark"}
          </Button>
          
          {sourceImages.length > 1 && (
            <Button
              variant="default"
              onClick={onProcessAllImages}
              disabled={activeWatermarks.length === 0 || isProcessing || sourceImages.length === 0}
            >
              Apply to All Images
            </Button>
          )}
          
          <Button
            variant="secondary"
            onClick={onDownload}
            disabled={!resultImage}
          >
            Download
          </Button>
        </div>
      </div>
    </div>
  );
};
