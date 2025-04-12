
import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Watermark } from "@/types/watermark";

interface WatermarkItemProps {
  watermark: Watermark;
  index: number;
  onRemove: (id: string) => void;
  onUpdate: (id: string, update: Partial<Watermark>) => void;
}

export const WatermarkItem = ({ 
  watermark, 
  index, 
  onRemove, 
  onUpdate 
}: WatermarkItemProps) => {
  return (
    <div className="border rounded-lg p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium">Watermark {index + 1}</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-7 w-7 p-0" 
          onClick={() => onRemove(watermark.id)}
        >
          &times;
        </Button>
      </div>
      
      <div className="bg-gray-100 p-4 rounded-md mb-4 flex justify-center">
        <img
          src={watermark.src}
          alt={`Watermark ${index + 1}`}
          className="max-h-24 max-w-full object-contain"
        />
      </div>
      
      <div className="space-y-4">
        <div>
          <div className="flex justify-between mb-2">
            <Label htmlFor={`opacity-${watermark.id}`}>
              Opacity: {Math.round(watermark.opacity * 100)}%
            </Label>
          </div>
          <Slider
            id={`opacity-${watermark.id}`}
            min={0}
            max={1}
            step={0.01}
            value={[watermark.opacity]}
            onValueChange={([value]) => 
              onUpdate(watermark.id, { opacity: value })
            }
          />
        </div>
        
        <div>
          <div className="flex justify-between mb-2">
            <Label htmlFor={`scale-${watermark.id}`}>
              Size: {Math.round(watermark.scale * 100)}%
            </Label>
          </div>
          <Slider
            id={`scale-${watermark.id}`}
            min={0.1}
            max={2}
            step={0.01}
            value={[watermark.scale]}
            onValueChange={([value]) => 
              onUpdate(watermark.id, { scale: value })
            }
          />
        </div>
        
        <div>
          <div className="flex justify-between mb-2">
            <Label htmlFor={`rotation-${watermark.id}`}>
              Rotation: {watermark.rotation}°
            </Label>
          </div>
          <Slider
            id={`rotation-${watermark.id}`}
            min={0}
            max={360}
            step={1}
            value={[watermark.rotation]}
            onValueChange={([value]) => 
              onUpdate(watermark.id, { rotation: value })
            }
          />
        </div>
      </div>
    </div>
  );
};
