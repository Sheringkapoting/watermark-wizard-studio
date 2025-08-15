import React from "react";
import { Card } from "@/components/ui/card";
import { ImageUploader } from "@/components/watermark/ImageUploader";
import { ImageEditor } from "@/components/watermark/ImageEditor";
import { CanvasWatermarkEditor } from "@/components/watermark/CanvasWatermarkEditor";
import { ResultPreview } from "@/components/watermark/ResultPreview";
import { Watermark } from "@/types/watermark";
import type { SourceImage } from "@/hooks/useImageUploader";

interface ImageEditorSectionProps {
  sourceImages: SourceImage[];
  activeImageIndex: number;
  watermarks: Watermark[];
  onSourceImageUpload: (src: string, name: string, type: string) => void;
  onMultipleSourceImagesUpload: (files: { src: string; name: string; type: string; }[]) => void;
  onProcessImage: () => void;
  onProcessAllImages: () => void;
  onRemoveImage: (id: string) => void;
  onSelectImage: (index: number) => void;
  onDownload: () => void;
  onUpdateImage: (imageId: string, newImageSrc: string) => void;
  onWatermarkUpdate: (id: string, update: Partial<Watermark>) => void;
  resultImage: string | null;
  isProcessing: boolean;
}

export const ImageEditorSection = ({
  sourceImages,
  activeImageIndex,
  watermarks,
  onSourceImageUpload,
  onMultipleSourceImagesUpload,
  onProcessImage,
  onProcessAllImages,
  onRemoveImage,
  onSelectImage,
  onDownload,
  onUpdateImage,
  onWatermarkUpdate,
  resultImage,
  isProcessing
}: ImageEditorSectionProps) => {
  
  const handleChangeImage = () => {
    document.getElementById("source-image-upload-additional")?.click();
  };

  if (sourceImages.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <Card className="p-6 flex flex-col items-center justify-center">
          <ImageUploader 
            id="source-image-upload"
            onUpload={onSourceImageUpload}
            buttonText="Select Images"
            description="Upload images to add watermarks"
            multiple={true}
            onMultipleUpload={onMultipleSourceImagesUpload}
          />
        </Card>
      </div>
    );
  }

  const activeImage = sourceImages[activeImageIndex];

  return (
    <div className="flex flex-col gap-4">
      {/* Canvas Watermark Editor */}
      {activeImage && (
        <Card className="p-6">
          <CanvasWatermarkEditor
            sourceImage={activeImage}
            watermarks={watermarks}
            onWatermarkUpdate={onWatermarkUpdate}
          />
        </Card>
      )}
      
      {/* Image Controls */}
      <Card className="p-6">
        <ImageEditor
          sourceImages={sourceImages}
          activeImageIndex={activeImageIndex}
          watermarks={watermarks}
          onDragStart={() => {}} // Not needed for canvas editor
          onChangeImage={handleChangeImage}
          onProcessImage={onProcessImage}
          onProcessAllImages={onProcessAllImages}
          onRemoveImage={onRemoveImage}
          onSelectImage={onSelectImage}
          onDownload={onDownload}
          onUpdateImage={onUpdateImage}
          resultImage={resultImage}
          isProcessing={isProcessing}
        />
      </Card>
      
      {/* Hidden uploader for additional images */}
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
      
      {/* Result Preview */}
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