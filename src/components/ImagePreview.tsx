
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Trash2, Loader2, Copy, Move, RotateCw, Plus, X, Layers } from 'lucide-react';
import { WatermarkedImage, WatermarkConfig } from '@/utils/imageProcessing';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

interface ImagePreviewProps {
  images: WatermarkedImage[];
  onDeleteImage: (id: string) => void;
  onDownloadImage: (image: WatermarkedImage) => void;
  onDownloadAll: () => void;
  isProcessing: boolean;
  onSelectWatermark: (imageId: string, watermarkIndex: number) => void;
  onUpdateWatermark: (imageId: string, watermarkId: string, config: Partial<WatermarkConfig>) => void;
  onRemoveWatermark: (imageId: string, watermarkId: string) => void;
  onApplyWatermarkToAll: (sourceImageId: string, watermarkId: string) => void;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({
  images,
  onDeleteImage,
  onDownloadImage,
  onDownloadAll,
  isProcessing,
  onSelectWatermark,
  onUpdateWatermark,
  onRemoveWatermark,
  onApplyWatermarkToAll
}) => {
  const [activeImageId, setActiveImageId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  if (images.length === 0) {
    return null;
  }

  const handleWatermarkDragStart = (e: React.MouseEvent, imageId: string, watermarkId: string) => {
    if (isProcessing) return;
    setActiveImageId(imageId);
    setIsDragging(true);
    e.stopPropagation();
  };

  const handleWatermarkDragMove = (e: React.MouseEvent, imageId: string, watermarkId: string, imgElement: HTMLImageElement) => {
    if (!isDragging || activeImageId !== imageId) return;
    
    const image = images.find(img => img.id === imageId);
    if (!image) return;
    
    const watermarkIndex = image.watermarks.findIndex(w => w.id === watermarkId);
    if (watermarkIndex === -1) return;
    
    const watermark = image.watermarks[watermarkIndex];
    
    const rect = imgElement.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    
    // Ensure x and y are within bounds (0-1)
    const boundedX = Math.max(0, Math.min(1, x));
    const boundedY = Math.max(0, Math.min(1, y));
    
    const updatedOptions = {
      ...watermark.options,
      position: 'custom' as const,
      customPosition: { x: boundedX, y: boundedY }
    };
    
    onUpdateWatermark(imageId, watermarkId, { options: updatedOptions });
  };

  const handleWatermarkDragEnd = () => {
    setIsDragging(false);
    setActiveImageId(null);
  };

  const handleWatermarkResize = (e: React.WheelEvent, imageId: string, watermarkId: string) => {
    if (isProcessing) return;
    e.preventDefault();
    
    const image = images.find(img => img.id === imageId);
    if (!image) return;
    
    const watermarkIndex = image.watermarks.findIndex(w => w.id === watermarkId);
    if (watermarkIndex === -1) return;
    
    const watermark = image.watermarks[watermarkIndex];
    
    const scaleChange = e.deltaY > 0 ? -0.01 : 0.01;
    const newScale = Math.max(0.05, Math.min(0.5, watermark.options.scale + scaleChange));
    
    const updatedOptions = {
      ...watermark.options,
      scale: newScale
    };
    
    onUpdateWatermark(imageId, watermarkId, { options: updatedOptions });
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
          <li>Click and drag watermarks to reposition them</li>
          <li>Use mouse wheel over a watermark to resize it</li>
          <li>Use the copy button to apply a watermark's settings to all images</li>
          <li>Add multiple watermarks to each image</li>
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
                  src={image.watermarkedUrl || image.originalUrl}
                  alt="Preview"
                  className="w-full h-full object-contain"
                />
                
                {image.watermarks.map((watermark, index) => (
                  <div 
                    key={watermark.id}
                    className={`absolute cursor-move ${
                      isDragging && activeImageId === image.id ? 'opacity-50' : ''
                    } ${
                      image.selectedWatermarkIndex === index ? 'ring-2 ring-blue-500' : ''
                    }`}
                    style={{
                      top: `${(watermark.options.customPosition?.y || 0.5) * 100}%`,
                      left: `${(watermark.options.customPosition?.x || 0.5) * 100}%`,
                      transform: 'translate(-50%, -50%)',
                      opacity: watermark.options.opacity || 0.7,
                      rotate: `${watermark.options.rotation || 0}deg`,
                      pointerEvents: isProcessing ? 'none' : 'auto',
                      zIndex: 10 + index
                    }}
                    onClick={() => onSelectWatermark(image.id, index)}
                    onMouseDown={(e) => handleWatermarkDragStart(e, image.id, watermark.id)}
                    onMouseMove={(e) => handleWatermarkDragMove(e, image.id, watermark.id, e.currentTarget.parentElement?.querySelector('img') as HTMLImageElement)}
                    onMouseUp={handleWatermarkDragEnd}
                    onMouseLeave={handleWatermarkDragEnd}
                    onWheel={(e) => handleWatermarkResize(e, image.id, watermark.id)}
                  >
                    {watermark.type === 'text' ? (
                      <div 
                        className="text-white text-stroke"
                        style={{ 
                          fontSize: `${Math.max(12, 24 * (watermark.options.scale || 0.2))}px`,
                          padding: '4px'
                        }}
                      >
                        {typeof watermark.content === 'string' ? 
                          watermark.content : 'Watermark'}
                      </div>
                    ) : (
                      <img 
                        src={
                          watermark.content instanceof File ? 
                            URL.createObjectURL(watermark.content) : 
                            '#'
                        }
                        alt="Watermark" 
                        className="max-w-full pointer-events-none"
                        style={{ 
                          width: `${100 * (watermark.options.scale || 0.2)}px`
                        }}
                        onLoad={(e) => {
                          if (watermark.content instanceof File) {
                            URL.revokeObjectURL((e.target as HTMLImageElement).src);
                          }
                        }}
                      />
                    )}
                    
                    {image.selectedWatermarkIndex === index && (
                      <Button
                        variant="outline"
                        size="icon"
                        className="absolute -top-2 -right-2 h-5 w-5 bg-white rounded-full border-gray-300 hover:bg-red-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveWatermark(image.id, watermark.id);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))}
                
                {image.watermarks.length > 0 && (
                  <div className="absolute top-2 right-2 flex gap-1">
                    {image.watermarks.map((watermark, index) => (
                      <Badge 
                        key={watermark.id} 
                        variant={image.selectedWatermarkIndex === index ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => onSelectWatermark(image.id, index)}
                      >
                        {index + 1}
                      </Badge>
                    ))}
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
                
                {image.watermarks.length > 0 && image.selectedWatermarkIndex >= 0 && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => {
                      const selectedWatermark = image.watermarks[image.selectedWatermarkIndex];
                      if (selectedWatermark) {
                        onApplyWatermarkToAll(image.id, selectedWatermark.id);
                      }
                    }}
                    disabled={isProcessing || image.watermarks.length === 0}
                    className="h-8 w-8 text-white hover:text-white hover:bg-green-500/40"
                    title="Apply this watermark to all images"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                )}
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
