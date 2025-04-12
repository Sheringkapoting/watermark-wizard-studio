
import React, { useState } from 'react';
import { Watermark } from '@/types/watermark';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { Upload, Type, Settings, Image as ImageIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface WatermarkControlsProps {
  selectedWatermark: Watermark | null;
  onUpdateWatermark: (updates: Partial<Watermark>) => void;
  onAddImageWatermark: (file: File) => void;
  onAddTextWatermark: (text: string) => void;
}

export const WatermarkControls: React.FC<WatermarkControlsProps> = ({
  selectedWatermark,
  onUpdateWatermark,
  onAddImageWatermark,
  onAddTextWatermark
}) => {
  const [textInput, setTextInput] = useState('');
  const [textColor, setTextColor] = useState('#ffffff');
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onAddImageWatermark(file);
    }
  };
  
  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim()) {
      onAddTextWatermark(textInput);
      setTextInput('');
    } else {
      toast({
        title: "Empty Text",
        description: "Please enter text for the watermark.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="space-y-4">
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-3">Add Watermark</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Image Watermark</h4>
            <Input
              id="watermark-image-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
            <label htmlFor="watermark-image-upload">
              <Button asChild variant="outline" className="w-full">
                <span>
                  <Upload className="h-4 w-4 mr-2" />
                  Add Image Watermark
                </span>
              </Button>
            </label>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-2">Text Watermark</h4>
            <form onSubmit={handleTextSubmit} className="flex gap-2">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Enter text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                />
              </div>
              <Button type="submit" variant="default">
                <Type className="h-4 w-4 mr-2" />
                Add
              </Button>
            </form>
          </div>
        </div>
      </Card>
      
      {selectedWatermark && (
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <Settings className="h-4 w-4 mr-2" />
            Watermark Settings
            {selectedWatermark.type === 'image' && <ImageIcon className="h-4 w-4 ml-2" />}
            {selectedWatermark.type === 'text' && <Type className="h-4 w-4 ml-2" />}
          </h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <Label htmlFor="opacity">Opacity: {Math.round(selectedWatermark.opacity * 100)}%</Label>
              </div>
              <Slider
                id="opacity"
                min={0}
                max={1}
                step={0.01}
                value={[selectedWatermark.opacity]}
                onValueChange={([value]) => onUpdateWatermark({ opacity: value })}
              />
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <Label htmlFor="scale">Size: {Math.round(selectedWatermark.scale * 100)}%</Label>
              </div>
              <Slider
                id="scale"
                min={0.1}
                max={3}
                step={0.01}
                value={[selectedWatermark.scale]}
                onValueChange={([value]) => onUpdateWatermark({ scale: value })}
              />
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <Label htmlFor="rotation">Rotation: {selectedWatermark.rotation}°</Label>
              </div>
              <Slider
                id="rotation"
                min={0}
                max={360}
                step={1}
                value={[selectedWatermark.rotation]}
                onValueChange={([value]) => onUpdateWatermark({ rotation: value })}
              />
            </div>
            
            {selectedWatermark.type === 'text' && (
              <>
                <div>
                  <Label htmlFor="fontFamily" className="mb-1 block">Font Family</Label>
                  <select
                    id="fontFamily"
                    className="w-full p-2 border rounded"
                    value={selectedWatermark.fontFamily}
                    onChange={(e) => onUpdateWatermark({ fontFamily: e.target.value })}
                  >
                    <option value="Arial">Arial</option>
                    <option value="Helvetica">Helvetica</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Courier New">Courier New</option>
                    <option value="Georgia">Georgia</option>
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="color" className="mb-1 block">Text Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      id="color"
                      value={selectedWatermark.color}
                      onChange={(e) => onUpdateWatermark({ color: e.target.value })}
                      className="w-10 h-10 p-1"
                    />
                    <Input
                      type="text"
                      value={selectedWatermark.color}
                      onChange={(e) => onUpdateWatermark({ color: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="fontSize" className="mb-1 block">Font Size</Label>
                  <Input
                    id="fontSize"
                    type="number"
                    min={10}
                    max={100}
                    value={selectedWatermark.fontSize}
                    onChange={(e) => onUpdateWatermark({ fontSize: parseInt(e.target.value, 10) || 24 })}
                  />
                </div>
              </>
            )}
          </div>
        </Card>
      )}
      
      <div className="bg-amber-50 p-3 rounded-md">
        <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
          <li>Drag the watermark to position</li>
          <li>Use the resize handle to change size</li>
          <li>Use mouse wheel over a selected watermark for quick resizing</li>
        </ul>
      </div>
    </div>
  );
};
