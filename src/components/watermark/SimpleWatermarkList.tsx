import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { Watermark } from "@/types/watermark";
import { ImageUploader } from "./ImageUploader";
import { toast } from "@/hooks/use-toast";

interface SimpleWatermarkListProps {
  watermarks: Watermark[];
  onWatermarkUpload: (src: string) => void;
  onWatermarkRemove: (id: string) => void;
}

export const SimpleWatermarkList = ({
  watermarks,
  onWatermarkUpload,
  onWatermarkRemove
}: SimpleWatermarkListProps) => {
  const handleWatermarkImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        onWatermarkUpload(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    });
    
    toast({
      title: "Watermark Uploaded",
      description: files.length === 1 
        ? "Watermark image has been added successfully. Click on it in the canvas to edit position, size, and rotation." 
        : `${files.length} watermark images have been added successfully.`,
    });
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Watermarks</h2>
      
      {watermarks.length === 0 ? (
        <ImageUploader 
          id="watermark-image-upload-initial"
          onUpload={onWatermarkUpload}
          buttonText="Select Watermark"
          description="PNG with transparency works best"
        />
      ) : (
        <div className="space-y-4">
          {/* Simple list of watermarks */}
          <div className="space-y-2">
            {watermarks.map((watermark, index) => (
              <div key={watermark.id} className="flex items-center justify-between p-3 border rounded-md">
                <div className="flex items-center gap-3">
                  <img 
                    src={watermark.src} 
                    alt={`Watermark ${index + 1}`}
                    className="w-8 h-8 object-contain"
                  />
                  <span className="text-sm font-medium">Watermark {index + 1}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onWatermarkRemove(watermark.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          
          {/* Add more watermarks */}
          <div>
            <Input
              id="watermark-image-upload-additional"
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleWatermarkImageUpload}
            />
            <label htmlFor="watermark-image-upload-additional">
              <Button asChild variant="outline" className="w-full">
                <span>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Another Watermark
                </span>
              </Button>
            </label>
          </div>
          
          {/* Instructions */}
          <div className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-md">
            <p className="font-medium mb-1">How to use:</p>
            <ul className="space-y-1 text-xs">
              <li>• Click on a watermark in the canvas to select it</li>
              <li>• Drag to move, use corner handles to resize</li>
              <li>• Use the rotate handle (circle above) to rotate</li>
              <li>• Watermarks are kept within image boundaries</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};