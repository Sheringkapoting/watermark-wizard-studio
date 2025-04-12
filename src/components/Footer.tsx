
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full py-4 px-4 sm:px-6 lg:px-8 border-t mt-8">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Watermark Wizard Studio
        </p>
        <div className="flex items-center space-x-4 mt-2 sm:mt-0">
          <a 
            href="#" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Privacy Policy
          </a>
          <a 
            href="#" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Terms of Service
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
