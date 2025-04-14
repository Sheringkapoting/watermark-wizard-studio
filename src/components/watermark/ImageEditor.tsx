
import React from "react";
import { Button } from "@/components/ui/button";
import { Watermark } from "@/types/watermark";
import { WatermarkImage } from "./WatermarkImage";
import { ImageSelector } from "./ImageSelector";
import { BackgroundRemovalTool } from "./BackgroundRemovalTool";
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
  onUpdateImage: (imageId: string, newImageSrc: string) => void;
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
  onUpdateImage,
  resultImage,
  isProcessing,
  imageContainerRef
}: ImageEditorProps) => {
  const activeImage = sourceImages[activeImageIndex];

  const handleBackgroundRemoved = (newImageSrc: string) => {
    if (activeImage) {
      onUpdateImage(activeImage.id, newImageSrc);
    }
  };

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
        
        {watermarks.map((watermark) => (
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

      <div className="flex flex-wrap justify-between mt-4 gap-2">
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onChangeImage}
          >
            Add Image
          </Button>
          
          {activeImage && (
            <BackgroundRemovalTool 
              imageUrl={activeImage.src}
              onProcessed={handleBackgroundRemoved}
            />
          )}
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={onProcessImage}
            disabled={watermarks.length === 0 || isProcessing || sourceImages.length === 0}
          >
            {isProcessing ? "Processing..." : "Apply Watermark"}
          </Button>
          
          {sourceImages.length > 1 && (
            <Button
              variant="default"
              onClick={onProcessAllImages}
              disabled={watermarks.length === 0 || isProcessing || sourceImages.length === 0}
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
