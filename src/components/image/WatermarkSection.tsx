import React from "react";
import { Card } from "@/components/ui/card";
import { WatermarkList } from "@/components/watermark/WatermarkList";
import { Instructions } from "@/components/watermark/Instructions";
import { Watermark } from "@/types/watermark";

interface WatermarkSectionProps {
  watermarks: Watermark[];
  onWatermarkUpload: (src: string) => void;
  onWatermarkRemove: (id: string) => void;
  onWatermarkUpdate: (id: string, update: Partial<Watermark>) => void;
}

export const WatermarkSection = ({
  watermarks,
  onWatermarkUpload,
  onWatermarkRemove,
  onWatermarkUpdate
}: WatermarkSectionProps) => {
  return (
    <div className="flex flex-col gap-4">
      <Card className="p-6">
        <WatermarkList 
          watermarks={watermarks}
          onWatermarkUpload={onWatermarkUpload}
          onWatermarkRemove={onWatermarkRemove}
          onWatermarkUpdate={onWatermarkUpdate}
        />
      </Card>
      
      <Card className="p-6">
        <Instructions />
      </Card>
    </div>
  );
};