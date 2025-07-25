import React from "react";
import { Card } from "@/components/ui/card";
import { ImageUploader } from "@/components/watermark/ImageUploader";
import { ImageEditor } from "@/components/watermark/ImageEditor";
import { ResultPreview } from "@/components/watermark/ResultPreview";
import { Watermark } from "@/types/watermark";
import type { SourceImage } from "@/hooks/useImageUploader";

interface ImageEditorSectionProps {
  sourceImages: SourceImage[];
  activeImageIndex: number;
  watermarks: Watermark[];
  onDragStart: (id: string, e: React.MouseEvent<HTMLImageElement> | React.TouchEvent<HTMLImageElement>) => void;
  onSourceImageUpload: (src: string, name: string, type: string) => void;
  onMultipleSourceImagesUpload: (files: { src: string; name: string; type: string; }[]) => void;
  onProcessImage: () => void;
  onProcessAllImages: () => void;
  onRemoveImage: (id: string) => void;
  onSelectImage: (index: number) => void;
  onDownload: () => void;
  onUpdateImage: (imageId: string, newImageSrc: string) => void;
  resultImage: string | null;
  isProcessing: boolean;
  imageContainerRef: React.RefObject<HTMLDivElement>;
}

export const ImageEditorSection = ({
  sourceImages,
  activeImageIndex,
  watermarks,
  onDragStart,
  onSourceImageUpload,
  onMultipleSourceImagesUpload,
  onProcessImage,
  onProcessAllImages,
  onRemoveImage,
  onSelectImage,
  onDownload,
  onUpdateImage,
  resultImage,
  isProcessing,
  imageContainerRef
}: ImageEditorSectionProps) => {
  return (
    <div className="flex flex-col gap-4">
      <Card className="p-6 flex flex-col items-center justify-center">
        {sourceImages.length === 0 ? (
          <ImageUploader 
            id="source-image-upload"
            onUpload={onSourceImageUpload}
            buttonText="Select Images"
            description="Upload images to add watermarks"
            multiple={true}
            onMultipleUpload={onMultipleSourceImagesUpload}
          />
        ) : (
          <ImageEditor 
            sourceImages={sourceImages}
            activeImageIndex={activeImageIndex}
            watermarks={watermarks}
            onDragStart={onDragStart}
            onChangeImage={() => document.getElementById("source-image-upload-additional")?.click()}
            onProcessImage={onProcessImage}
            onProcessAllImages={onProcessAllImages}
            onRemoveImage={onRemoveImage}
            onSelectImage={onSelectImage}
            onDownload={onDownload}
            onUpdateImage={onUpdateImage}
            resultImage={resultImage}
            isProcessing={isProcessing}
            imageContainerRef={imageContainerRef}
          />
        )}
      </Card>
      
      {sourceImages.length > 0 && (
        <div className="hidden">
          <ImageUploader 
            id="source-image-upload-additional"
            onUpload={onSourceImageUpload}
            buttonText="Add Another Image"
            description="Upload additional images"
            multiple={true}
            onMultipleUpload={onMultipleSourceImagesUpload}
          />
        </div>
      )}
      
      {resultImage && (
        <Card className="p-6">
          <ResultPreview 
            resultImage={resultImage} 
            onDownload={onDownload} 
          />
        </Card>
      )}
    </div>
  );
};