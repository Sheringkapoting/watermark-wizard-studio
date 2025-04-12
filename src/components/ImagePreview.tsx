
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Trash2, Loader2, Copy, Move, RotateCw } from 'lucide-react';
import { WatermarkedImage, WatermarkConfig, applyWatermark } from '@/utils/imageProcessing';
import { toast } from 'sonner';

interface ImagePreviewProps {
  images: WatermarkedImage[];
  onDeleteImage: (id: string) => void;
  onDownloadImage: (image: WatermarkedImage) => void;
  onDownloadAll: () => void;
  isProcessing: boolean;
  watermarkConfig: WatermarkConfig | null;
  onImageConfigChange: (id: string, config: WatermarkConfig) => void;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({
  images,
  onDeleteImage,
  onDownloadImage,
  onDownloadAll,
  isProcessing,
  watermarkConfig,
  onImageConfigChange
}) => {
  const [activeImageId, setActiveImageId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  
  if (images.length === 0) {
    return null;
  }

  const handleWatermarkDragStart = (e: React.MouseEvent, imageId: string) => {
    if (!watermarkConfig || isProcessing) return;
    setActiveImageId(imageId);
    setIsDragging(true);
    e.stopPropagation();
  };

  const handleWatermarkDragMove = (e: React.MouseEvent, imageId: string, imgElement: HTMLImageElement) => {
    if (!isDragging || activeImageId !== imageId || !watermarkConfig) return;
    
    const image = images.find(img => img.id === imageId);
    if (!image || !image.customWatermarkConfig) return;
    
    const rect = imgElement.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    
    // Ensure x and y are within bounds (0-1)
    const boundedX = Math.max(0, Math.min(1, x));
    const boundedY = Math.max(0, Math.min(1, y));
    
    const updatedConfig = {
      ...image.customWatermarkConfig,
      options: {
        ...image.customWatermarkConfig.options,
        position: 'custom' as const,
        customPosition: { x: boundedX, y: boundedY }
      }
    };
    
    onImageConfigChange(imageId, updatedConfig);
  };

  const handleWatermarkDragEnd = () => {
    setIsDragging(false);
    setActiveImageId(null);
  };

  const handleWatermarkResize = (e: React.WheelEvent, imageId: string) => {
    if (!watermarkConfig || isProcessing) return;
    e.preventDefault();
    
    const image = images.find(img => img.id === imageId);
    if (!image || !image.customWatermarkConfig) return;
    
    const scaleChange = e.deltaY > 0 ? -0.01 : 0.01;
    const newScale = Math.max(0.05, Math.min(0.5, image.customWatermarkConfig.options.scale + scaleChange));
    
    const updatedConfig = {
      ...image.customWatermarkConfig,
      options: {
        ...image.customWatermarkConfig.options,
        scale: newScale
      }
    };
    
    onImageConfigChange(imageId, updatedConfig);
  };

  const applyConfigToAll = (sourceImageId: string) => {
    const sourceImage = images.find(img => img.id === sourceImageId);
    if (!sourceImage || !sourceImage.customWatermarkConfig) return;
    
    images.forEach(image => {
      if (image.id !== sourceImageId) {
        onImageConfigChange(image.id, sourceImage.customWatermarkConfig!);
      }
    });
    
    toast.success('Watermark settings applied to all images');
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Preview ({images.length} images)</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onDownloadAll}
          disabled={isProcessing || !images.some(img => img.watermarkedUrl)}
          className="flex items-center gap-1"
        >
          <Download className="h-4 w-4" />
          <span>Download All</span>
        </Button>
      </div>
      
      <div className="bg-slate-100 p-2 rounded-md text-sm">
        <ul className="list-disc pl-5 text-muted-foreground">
          <li>Click and drag the watermark to reposition it</li>
          <li>Use mouse wheel over an image to resize the watermark</li>
          <li>Use the copy button to apply one image's settings to all images</li>
        </ul>
      </div>
      
      <div className="image-grid">
        {images.map((image) => (
          <div 
            key={image.id} 
            className="relative group border rounded-lg overflow-hidden bg-gray-100 aspect-square"
          >
            {image.isProcessing ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-watermark-blue animate-spin" />
              </div>
            ) : (
              <div className="relative w-full h-full">
                <img
                  src={image.originalUrl}
                  alt="Preview"
                  className="w-full h-full object-contain"
                  onMouseMove={(e) => handleWatermarkDragMove(e, image.id, e.currentTarget)}
                  onMouseUp={handleWatermarkDragEnd}
                  onMouseLeave={handleWatermarkDragEnd}
                  onWheel={(e) => handleWatermarkResize(e, image.id)}
                />
                
                {image.watermarkedUrl && !isDragging && (
                  <div 
                    className={`absolute cursor-move ${isDragging && activeImageId === image.id ? 'opacity-50' : ''}`}
                    style={{
                      top: `${(image.customWatermarkConfig?.options.customPosition?.y || 0.5) * 100}%`,
                      left: `${(image.customWatermarkConfig?.options.customPosition?.x || 0.5) * 100}%`,
                      transform: 'translate(-50%, -50%)',
                      opacity: image.customWatermarkConfig?.options.opacity || 0.7,
                      rotate: `${image.customWatermarkConfig?.options.rotation || 0}deg`,
                      pointerEvents: isProcessing ? 'none' : 'auto'
                    }}
                    onMouseDown={(e) => handleWatermarkDragStart(e, image.id)}
                  >
                    {image.customWatermarkConfig?.type === 'text' ? (
                      <div 
                        className="text-white text-stroke"
                        style={{ 
                          fontSize: `${Math.max(12, 24 * (image.customWatermarkConfig.options.scale || 0.2))}px`
                        }}
                      >
                        {typeof image.customWatermarkConfig.content === 'string' ? 
                          image.customWatermarkConfig.content : 'Watermark'}
                      </div>
                    ) : (
                      image.watermarkPreview && (
                        <img 
                          src={image.watermarkPreview}
                          alt="Watermark" 
                          className="max-w-full pointer-events-none"
                          style={{ 
                            width: `${100 * (image.customWatermarkConfig?.options.scale || 0.2)}px`
                          }}
                        />
                      )
                    )}
                  </div>
                )}
              </div>
            )}
            
            <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex justify-between items-center">
              <div className="flex">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => onDeleteImage(image.id)}
                  disabled={isProcessing}
                  className="h-8 w-8 text-white hover:text-white hover:bg-red-500/40"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => applyConfigToAll(image.id)}
                  disabled={isProcessing || !image.customWatermarkConfig}
                  className="h-8 w-8 text-white hover:text-white hover:bg-green-500/40"
                  title="Apply this watermark to all images"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => onDownloadImage(image)}
                disabled={isProcessing || !image.watermarkedUrl}
                className="h-8 w-8 text-white hover:text-white hover:bg-blue-500/40"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImagePreview;
