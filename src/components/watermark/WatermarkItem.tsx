
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
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
  // State for input values
  const [opacityInput, setOpacityInput] = useState(Math.round(watermark.opacity * 100));
  const [scaleInput, setScaleInput] = useState(Math.round(watermark.scale * 100));
  const [rotationInput, setRotationInput] = useState(watermark.rotation);

  // Handle direct input changes
  const handleOpacityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(0, Math.min(100, Number(e.target.value)));
    setOpacityInput(value);
    onUpdate(watermark.id, { opacity: value / 100 });
  };

  const handleScaleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(10, Math.min(200, Number(e.target.value)));
    setScaleInput(value);
    onUpdate(watermark.id, { scale: value / 100 });
  };

  const handleRotationInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(0, Math.min(360, Number(e.target.value)));
    setRotationInput(value);
    onUpdate(watermark.id, { rotation: value });
  };

  // Handle slider changes
  const handleOpacitySliderChange = (value: number[]) => {
    setOpacityInput(Math.round(value[0] * 100));
    onUpdate(watermark.id, { opacity: value[0] });
  };

  const handleScaleSliderChange = (value: number[]) => {
    setScaleInput(Math.round(value[0] * 100));
    onUpdate(watermark.id, { scale: value[0] });
  };

  const handleRotationSliderChange = (value: number[]) => {
    setRotationInput(value[0]);
    onUpdate(watermark.id, { rotation: value[0] });
  };

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
              Opacity
            </Label>
            <div className="flex items-center">
              <Input
                type="number"
                min="0"
                max="100"
                value={opacityInput}
                onChange={handleOpacityInputChange}
                className="w-16 h-8 text-sm mr-1"
              />
              <span className="text-sm">%</span>
            </div>
          </div>
          <Slider
            id={`opacity-${watermark.id}`}
            min={0}
            max={1}
            step={0.01}
            value={[watermark.opacity]}
            onValueChange={handleOpacitySliderChange}
            className="cursor-grab active:cursor-grabbing"
          />
        </div>
        
        <div>
          <div className="flex justify-between mb-2">
            <Label htmlFor={`scale-${watermark.id}`}>
              Size
            </Label>
            <div className="flex items-center">
              <Input
                type="number"
                min="10"
                max="200"
                value={scaleInput}
                onChange={handleScaleInputChange}
                className="w-16 h-8 text-sm mr-1"
              />
              <span className="text-sm">%</span>
            </div>
          </div>
          <Slider
            id={`scale-${watermark.id}`}
            min={0.1}
            max={2}
            step={0.01}
            value={[watermark.scale]}
            onValueChange={handleScaleSliderChange}
            className="cursor-grab active:cursor-grabbing"
          />
        </div>
        
        <div>
          <div className="flex justify-between mb-2">
            <Label htmlFor={`rotation-${watermark.id}`}>
              Rotation
            </Label>
            <div className="flex items-center">
              <Input
                type="number"
                min="0"
                max="360"
                value={rotationInput}
                onChange={handleRotationInputChange}
                className="w-16 h-8 text-sm mr-1"
              />
              <span className="text-sm">°</span>
            </div>
          </div>
          <Slider
            id={`rotation-${watermark.id}`}
            min={0}
            max={360}
            step={1}
            value={[watermark.rotation]}
            onValueChange={handleRotationSliderChange}
            className="cursor-grab active:cursor-grabbing"
          />
        </div>
      </div>
    </div>
  );
};
