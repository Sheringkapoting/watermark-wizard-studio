
import React from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface ResultPreviewProps {
  resultImage: string;
  onDownload: () => void;
}

export const ResultPreview = ({ resultImage, onDownload }: ResultPreviewProps) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Result</h2>
      <img
        src={resultImage}
        alt="Result"
        className="w-full h-auto rounded-md mb-4"
      />
      <Button 
        onClick={onDownload} 
        className="w-full"
      >
        <Download className="h-4 w-4 mr-2" />
        Download Image
      </Button>
    </div>
  );
};
