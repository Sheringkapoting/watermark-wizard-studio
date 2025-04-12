
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ImageFormat } from "@/types/watermark";

interface DownloadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filename: string;
  onFilenameChange: (filename: string) => void;
  selectedFormat: string;
  onFormatChange: (format: string) => void;
  imageQuality: number;
  onQualityChange: (quality: number) => void;
  onDownload: () => void;
  imageFormats: ImageFormat[];
}

export const DownloadDialog = ({
  open,
  onOpenChange,
  filename,
  onFilenameChange,
  selectedFormat,
  onFormatChange,
  imageQuality,
  onQualityChange,
  onDownload,
  imageFormats
}: DownloadDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Download Options</DialogTitle>
          <DialogDescription>
            Customize your download settings
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="filename">Filename</Label>
            <Input
              id="filename"
              value={filename}
              onChange={(e) => onFilenameChange(e.target.value)}
              placeholder="Enter filename"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="format">Image Format</Label>
            <Select value={selectedFormat} onValueChange={onFormatChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                {imageFormats.map((format) => (
                  <SelectItem key={format.type} value={format.type}>
                    {format.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {selectedFormat !== "image/png" && selectedFormat !== "original" && (
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="quality">Quality: {Math.round(imageQuality * 100)}%</Label>
              </div>
              <Slider
                id="quality"
                min={0.1}
                max={1}
                step={0.05}
                value={[imageQuality]}
                onValueChange={([value]) => onQualityChange(value)}
              />
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onDownload}>
            Download
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
