
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Upload } from "lucide-react";
import { Watermark } from "@/types/watermark";
import { WatermarkItem } from "./WatermarkItem";
import { ImageUploader } from "./ImageUploader";
import { toast } from "@/hooks/use-toast";

interface WatermarkListProps {
  watermarks: Watermark[];
  onWatermarkUpload: (src: string) => void;
  onWatermarkRemove: (id: string) => void;
  onWatermarkUpdate: (id: string, update: Partial<Watermark>) => void;
}

export const WatermarkList = ({
  watermarks,
  onWatermarkUpload,
  onWatermarkRemove,
  onWatermarkUpdate
}: WatermarkListProps) => {
  const handleWatermarkImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        onWatermarkUpload(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      toast({
        title: "Watermark Uploaded",
        description: "Watermark image has been added successfully.",
      });
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Watermarks</h2>
      
      {watermarks.length === 0 ? (
        <ImageUploader 
          id="watermark-image-upload-initial"
          onUpload={(src) => onWatermarkUpload(src)}
          buttonText="Select Watermark"
          description="PNG with transparency works best"
        />
      ) : (
        <div className="space-y-6">
          {watermarks.map((watermark, index) => (
            <WatermarkItem
              key={watermark.id}
              watermark={watermark}
              index={index}
              onRemove={onWatermarkRemove}
              onUpdate={onWatermarkUpdate}
            />
          ))}
          
          <div>
            <Input
              id="watermark-image-upload-additional"
              type="file"
              accept="image/*"
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
        </div>
      )}
    </div>
  );
};
