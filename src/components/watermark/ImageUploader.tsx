
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, ImageIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ImageUploaderProps {
  id: string;
  onUpload: (imageSrc: string, fileName: string, fileType: string) => void;
  buttonText: string;
  description: string;
}

export const ImageUploader = ({ 
  id, 
  onUpload, 
  buttonText, 
  description 
}: ImageUploaderProps) => {
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageSrc = e.target?.result as string;
        onUpload(imageSrc, file.name.split('.')[0], file.type);
      };
      reader.readAsDataURL(file);
      toast({
        title: "Image Uploaded",
        description: "Image has been loaded successfully.",
      });
    }
  };

  return (
    <div className="text-center p-10 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 w-full">
      <div className="mb-4">
        <ImageIcon className="h-12 w-12 mx-auto text-gray-400" />
        <h3 className="mt-2 text-sm font-semibold text-gray-900">No image selected</h3>
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      </div>
      <Input
        id={id}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
      />
      <label htmlFor={id}>
        <Button asChild variant="default">
          <span>
            <Upload className="h-4 w-4 mr-2" />
            {buttonText}
          </span>
        </Button>
      </label>
    </div>
  );
};
