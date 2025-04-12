
import React, { useCallback, useState } from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ImageUploaderProps {
  onImagesSelected: (files: File[]) => void;
  isProcessing: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImagesSelected, isProcessing }) => {
  const [isDragging, setIsDragging] = useState(false);
  
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );
    
    if (files.length === 0) {
      toast.error('Please upload image files only (JPEG, PNG, etc.)');
      return;
    }
    
    onImagesSelected(files);
  }, [onImagesSelected]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files).filter(file => 
        file.type.startsWith('image/')
      );
      
      if (files.length === 0) {
        toast.error('Please upload image files only (JPEG, PNG, etc.)');
        return;
      }
      
      onImagesSelected(files);
      // Reset the input value to allow selecting the same files again
      e.target.value = '';
    }
  }, [onImagesSelected]);

  return (
    <div 
      className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors animate-fade-in
        ${isDragging ? 'drag-active' : 'border-gray-300 hover:border-watermark-blue'}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
          <Upload className="h-8 w-8 text-watermark-blue" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Drag and drop your images here</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Or click to browse (JPEG, PNG)
          </p>
        </div>
        <input
          id="file-upload"
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
          disabled={isProcessing}
        />
        <Button 
          variant="outline" 
          onClick={() => document.getElementById('file-upload')?.click()}
          disabled={isProcessing}
          className="mt-2"
        >
          Select Files
        </Button>
      </div>
      
      {isDragging && (
        <div className="absolute inset-0 flex items-center justify-center bg-blue-100/50 rounded-lg">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <p className="font-medium text-watermark-blue">Drop your images to upload</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
