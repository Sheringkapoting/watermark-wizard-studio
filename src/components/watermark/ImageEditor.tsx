
import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Watermark } from "@/types/watermark";
import { WatermarkImage } from "./WatermarkImage";

interface ImageEditorProps {
  sourceImage: string | null;
  watermarks: Watermark[];
  onDragStart: (id: string, e: React.MouseEvent<HTMLImageElement> | React.TouchEvent<HTMLImageElement>) => void;
  onChangeImage: () => void;
  onProcessImage: () => void;
  onDownload: () => void;
  resultImage: string | null;
  isProcessing: boolean;
}

export const ImageEditor = ({
  sourceImage,
  watermarks,
  onDragStart,
  onChangeImage,
  onProcessImage,
  onDownload,
  resultImage,
  isProcessing
}: ImageEditorProps) => {
  const imageContainerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="w-full relative">
      <div className="relative" ref={imageContainerRef}>
        <img
          src={sourceImage}
          alt="Source"
          className="w-full h-auto rounded-md object-contain max-h-[70vh]"
        />
        
        {watermarks.map((watermark) => (
          <WatermarkImage
            key={watermark.id}
            watermark={watermark}
            onDragStart={onDragStart}
          />
        ))}
      </div>

      <div className="flex justify-between mt-4">
        <Button
          variant="outline"
          onClick={onChangeImage}
        >
          Change Image
        </Button>
        
        <div className="flex gap-2">
          <Button
            onClick={onProcessImage}
            disabled={watermarks.length === 0 || isProcessing}
          >
            {isProcessing ? "Processing..." : "Apply Watermark"}
          </Button>
          
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
