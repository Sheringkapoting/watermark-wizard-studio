
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, Trash2, Loader2 } from 'lucide-react';
import { WatermarkedImage } from '@/utils/imageProcessing';
import { toast } from 'sonner';

interface ImagePreviewProps {
  images: WatermarkedImage[];
  onDeleteImage: (id: string) => void;
  onDownloadImage: (image: WatermarkedImage) => void;
  onDownloadAll: () => void;
  isProcessing: boolean;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({
  images,
  onDeleteImage,
  onDownloadImage,
  onDownloadAll,
  isProcessing
}) => {
  if (images.length === 0) {
    return null;
  }

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
              <img
                src={image.watermarkedUrl || image.originalUrl}
                alt="Preview"
                className="w-full h-full object-contain"
              />
            )}
            
            <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex justify-between items-center">
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
