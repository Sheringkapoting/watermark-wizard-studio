
import React, { useRef, useState, useEffect } from 'react';
import { Watermark, SourceImage } from '@/types/watermark';
import { InteractiveWatermark } from './InteractiveWatermark';
import { Card } from "@/components/ui/card";

interface ImagePreviewProps {
  image: SourceImage | null;
  onUpdateWatermark: (watermarkId: string, updates: Partial<Watermark>) => void;
  onRemoveWatermark: (watermarkId: string) => void;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  image,
  onUpdateWatermark,
  onRemoveWatermark
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedWatermarkId, setSelectedWatermarkId] = useState<string | null>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  
  // Update container size when window resizes or image changes
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };
    
    updateSize();
    window.addEventListener('resize', updateSize);
    
    // Create a mutation observer to detect changes in the DOM
    const observer = new MutationObserver(updateSize);
    if (containerRef.current) {
      observer.observe(containerRef.current, { 
        attributes: true, 
        childList: true, 
        subtree: true 
      });
    }
    
    return () => {
      window.removeEventListener('resize', updateSize);
      observer.disconnect();
    };
  }, [image]);
  
  // Clear selection when clicking the container
  const handleContainerClick = () => {
    setSelectedWatermarkId(null);
  };
  
  if (!image) {
    return (
      <Card className="flex items-center justify-center p-6 h-[400px] bg-gray-50">
        <div className="text-center text-gray-500">
          <p>No image selected</p>
          <p className="text-sm">Upload source images to get started</p>
        </div>
      </Card>
    );
  }
  
  return (
    <Card className="p-2 relative overflow-hidden">
      <div 
        ref={containerRef} 
        className="relative max-h-[70vh] min-h-[400px] flex items-center justify-center bg-gray-100 overflow-hidden"
        onClick={handleContainerClick}
      >
        <img
          src={image.src}
          alt="Source"
          className="max-w-full max-h-full object-contain"
        />
        
        {image.watermarks.map((watermark) => (
          <InteractiveWatermark
            key={watermark.id}
            watermark={watermark}
            containerWidth={containerSize.width}
            containerHeight={containerSize.height}
            isSelected={selectedWatermarkId === watermark.id}
            onSelect={() => setSelectedWatermarkId(watermark.id)}
            onUpdate={(updates) => onUpdateWatermark(watermark.id, updates)}
            onRemove={() => onRemoveWatermark(watermark.id)}
          />
        ))}
      </div>
      
      {image.watermarks.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-white/80 p-3 rounded-md text-center">
            <p className="text-gray-500">No watermarks added</p>
            <p className="text-xs text-gray-400">Use the controls to add image or text watermarks</p>
          </div>
        </div>
      )}
    </Card>
  );
};
