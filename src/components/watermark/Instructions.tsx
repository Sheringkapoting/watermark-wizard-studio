
import React from "react";

export const Instructions = () => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Instructions</h2>
      <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
        <li>Upload your source image</li>
        <li>Add one or more watermark images (PNG with transparency works best)</li>
        <li>Adjust each watermark's size, opacity, and rotation</li>
        <li>Drag watermarks to position them exactly where you want</li>
        <li>Click "Apply Watermark" to process the image</li>
        <li>Download your watermarked image</li>
      </ol>
    </div>
  );
};
