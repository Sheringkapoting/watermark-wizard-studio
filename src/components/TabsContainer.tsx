
import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { ImageIcon, VideoIcon } from "lucide-react";

interface TabsContainerProps {
  children: {
    images: React.ReactNode;
    videos: React.ReactNode;
  };
}

export const TabsContainer = ({ children }: TabsContainerProps) => {
  return (
    <Tabs defaultValue="images" className="w-full">
      <TabsList className="w-full grid grid-cols-2 mb-4">
        <TabsTrigger value="images" className="flex items-center gap-1">
          <ImageIcon className="h-4 w-4" />
          <span>Images</span>
        </TabsTrigger>
        <TabsTrigger value="videos" className="flex items-center gap-1">
          <VideoIcon className="h-4 w-4" />
          <span>Videos</span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="images" className="mt-0">
        {children.images}
      </TabsContent>
      
      <TabsContent value="videos" className="mt-0">
        {children.videos}
      </TabsContent>
    </Tabs>
  );
};
