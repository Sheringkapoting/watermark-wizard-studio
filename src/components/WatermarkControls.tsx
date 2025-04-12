
import React, { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { WatermarkConfig, WatermarkOptions, DEFAULT_WATERMARK_OPTIONS } from '@/utils/imageProcessing';
import { ImageIcon, Type, Upload, Plus, Layers } from 'lucide-react';
import { toast } from 'sonner';

interface WatermarkControlsProps {
  onWatermarkChange: (config: WatermarkConfig) => void;
  isProcessing: boolean;
  hasImages: boolean;
}

const WatermarkControls: React.FC<WatermarkControlsProps> = ({ 
  onWatermarkChange, 
  isProcessing,
  hasImages
}) => {
  const [watermarkType, setWatermarkType] = useState<'text' | 'image'>('text');
  const [watermarkText, setWatermarkText] = useState('© Watermark');
  const [watermarkImage, setWatermarkImage] = useState<File | null>(null);
  const [watermarkImagePreview, setWatermarkImagePreview] = useState<string | null>(null);
  const [options, setOptions] = useState<WatermarkOptions>(DEFAULT_WATERMARK_OPTIONS);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      setWatermarkImage(file);
      setWatermarkImagePreview(URL.createObjectURL(file));
    }
  };

  const handlePositionChange = (value: string) => {
    setOptions({
      ...options,
      position: value as WatermarkOptions['position']
    });
  };

  const handleScaleChange = (value: number[]) => {
    setOptions({
      ...options,
      scale: value[0]
    });
  };

  const handleOpacityChange = (value: number[]) => {
    setOptions({
      ...options,
      opacity: value[0]
    });
  };

  const handleRotationChange = (value: number[]) => {
    setOptions({
      ...options,
      rotation: value[0]
    });
  };

  const addWatermark = () => {
    if (watermarkType === 'text') {
      if (!watermarkText.trim()) {
        toast.error('Please enter watermark text');
        return;
      }
      
      onWatermarkChange({
        id: '', // Will be generated in the hook
        type: 'text',
        content: watermarkText,
        options
      });
      
      // Reset for next watermark
      setWatermarkText('© Watermark');
      setOptions(DEFAULT_WATERMARK_OPTIONS);
      
      toast.success('Text watermark added');
    } else {
      if (!watermarkImage) {
        toast.error('Please select a watermark image');
        return;
      }
      
      onWatermarkChange({
        id: '', // Will be generated in the hook
        type: 'image',
        content: watermarkImage,
        options
      });
      
      // Reset for next watermark
      setWatermarkImage(null);
      setWatermarkImagePreview(null);
      setOptions(DEFAULT_WATERMARK_OPTIONS);
      
      toast.success('Image watermark added');
    }
  };

  return (
    <div className="bg-card p-6 rounded-lg shadow-sm border animate-fade-in">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Layers className="h-5 w-5" />
        <span>Add Watermark</span>
      </h2>
      
      <Tabs defaultValue="text" onValueChange={(value) => setWatermarkType(value as 'text' | 'image')}>
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="text" className="flex items-center gap-2">
            <Type className="h-4 w-4" />
            <span>Text</span>
          </TabsTrigger>
          <TabsTrigger value="image" className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            <span>Image</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="text" className="space-y-4">
          <div>
            <Label htmlFor="watermark-text">Watermark Text</Label>
            <Input 
              id="watermark-text"
              value={watermarkText}
              onChange={(e) => setWatermarkText(e.target.value)}
              placeholder="Enter watermark text"
              className="mt-1"
              disabled={isProcessing}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="image" className="space-y-4">
          <div>
            <Label>Watermark Image</Label>
            <div className="mt-1 flex items-start space-x-4">
              <div className="flex-1">
                <div className="border rounded-md p-2 flex items-center justify-center h-20">
                  {watermarkImagePreview ? (
                    <img 
                      src={watermarkImagePreview} 
                      alt="Watermark preview" 
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <div className="text-muted-foreground text-sm flex flex-col items-center">
                      <ImageIcon className="h-6 w-6 mb-1" />
                      <span>No image selected</span>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <input
                  id="watermark-image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  disabled={isProcessing}
                />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => document.getElementById('watermark-image-upload')?.click()}
                  disabled={isProcessing}
                  className="flex items-center gap-1"
                >
                  <Upload className="h-4 w-4" />
                  <span>Upload</span>
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="space-y-6 mt-6">
        <div>
          <Label className="block mb-2">Position</Label>
          <RadioGroup 
            value={options.position} 
            onValueChange={handlePositionChange}
            className="grid grid-cols-3 gap-2"
            disabled={isProcessing}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="topLeft" id="topLeft" />
              <Label htmlFor="topLeft">Top Left</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="center" id="center" />
              <Label htmlFor="center">Center</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="topRight" id="topRight" />
              <Label htmlFor="topRight">Top Right</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="bottomLeft" id="bottomLeft" />
              <Label htmlFor="bottomLeft">Bottom Left</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="custom" id="custom" />
              <Label htmlFor="custom">Custom</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="bottomRight" id="bottomRight" />
              <Label htmlFor="bottomRight">Bottom Right</Label>
            </div>
          </RadioGroup>
        </div>
        
        <div>
          <div className="flex justify-between mb-2">
            <Label>Size</Label>
            <span className="text-sm text-muted-foreground">{Math.round(options.scale * 100)}%</span>
          </div>
          <Slider 
            value={[options.scale]} 
            onValueChange={handleScaleChange} 
            min={0.05} 
            max={0.5} 
            step={0.01}
            disabled={isProcessing}
          />
        </div>
        
        <div>
          <div className="flex justify-between mb-2">
            <Label>Opacity</Label>
            <span className="text-sm text-muted-foreground">{Math.round(options.opacity * 100)}%</span>
          </div>
          <Slider 
            value={[options.opacity]} 
            onValueChange={handleOpacityChange} 
            min={0.1} 
            max={1} 
            step={0.05}
            disabled={isProcessing}
          />
        </div>
        
        <div>
          <div className="flex justify-between mb-2">
            <Label>Rotation</Label>
            <span className="text-sm text-muted-foreground">{options.rotation}°</span>
          </div>
          <Slider 
            value={[options.rotation]} 
            onValueChange={handleRotationChange} 
            min={0} 
            max={360} 
            step={5}
            disabled={isProcessing}
          />
        </div>
      </div>
      
      <Button 
        className="w-full mt-6" 
        onClick={addWatermark}
        disabled={isProcessing || !hasImages}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Watermark
      </Button>
    </div>
  );
};

export default WatermarkControls;
