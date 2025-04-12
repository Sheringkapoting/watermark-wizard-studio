
import React from 'react';
import { ImageIcon } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="w-full py-4 px-4 sm:px-6 lg:px-8 border-b">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-2">
          <ImageIcon className="h-8 w-8 text-watermark-blue" />
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            Watermark Wizard Studio
          </h1>
        </div>
        <p className="text-sm text-muted-foreground hidden sm:block">
          Easily watermark multiple images at once
        </p>
      </div>
    </header>
  );
};

export default Header;
