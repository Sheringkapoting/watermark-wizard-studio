
import React from "react";
import { TabsContainer } from "@/components/TabsContainer";
import { VideoTab } from "@/components/video/VideoTab";
import { ImageTab } from "@/components/image/ImageTab";

const Index = () => {
  return (
    <div className="min-h-screen w-full bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Multimedia Editor Studio</h1>
        
        <TabsContainer
          children={{
            images: <ImageTab />,
            videos: <VideoTab />
          }}
        />
      </div>
    </div>
  );
};

export default Index;
