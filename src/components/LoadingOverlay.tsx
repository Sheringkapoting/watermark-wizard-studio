
import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  isVisible, 
  message = 'Processing images...' 
}) => {
  if (!isVisible) return null;
  
  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg flex items-center gap-4">
        <Loader2 className="h-8 w-8 text-watermark-blue animate-spin" />
        <p className="text-lg font-medium">{message}</p>
      </div>
    </div>
  );
};

export default LoadingOverlay;
