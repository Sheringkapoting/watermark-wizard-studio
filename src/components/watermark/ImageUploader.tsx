
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
  multiple?: boolean;
  onMultipleUpload?: (files: { src: string, name: string, type: string }[]) => void;
}

export const ImageUploader = ({ 
  id, 
  onUpload, 
  buttonText, 
  description,
  multiple = false,
  onMultipleUpload
}: ImageUploaderProps) => {
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (multiple && files.length > 1 && onMultipleUpload) {
      // Handle multiple files
      const filePromises: Promise<{ src: string, name: string, type: string }>[] = [];
      
      Array.from(files).forEach(file => {
        const promise = new Promise<{ src: string, name: string, type: string }>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const imageSrc = e.target?.result as string;
            resolve({
              src: imageSrc,
              name: file.name.split('.')[0],
              type: file.type
            });
          };
          reader.readAsDataURL(file);
        });
        filePromises.push(promise);
      });

      Promise.all(filePromises).then(results => {
        onMultipleUpload(results);
        toast({
          title: "Images Uploaded",
          description: `${results.length} images have been loaded successfully.`,
        });
      });
    } else {
      // Handle single file
      const file = files[0];
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
        multiple={multiple}
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
