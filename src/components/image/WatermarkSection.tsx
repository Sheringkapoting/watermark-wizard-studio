import React from "react";
import { Card } from "@/components/ui/card";
import { SimpleWatermarkList } from "@/components/watermark/SimpleWatermarkList";
import { Watermark } from "@/types/watermark";

interface WatermarkSectionProps {
  watermarks: Watermark[];
  onWatermarkUpload: (src: string) => void;
  onWatermarkRemove: (id: string) => void;
}

export const WatermarkSection = ({
  watermarks,
  onWatermarkUpload,
  onWatermarkRemove
}: WatermarkSectionProps) => {
  return (
    <Card className="p-6">
      <SimpleWatermarkList 
        watermarks={watermarks}
        onWatermarkUpload={onWatermarkUpload}
        onWatermarkRemove={onWatermarkRemove}
      />
    </Card>
  );
};