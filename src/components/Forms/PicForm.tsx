"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import Image from "next/image";
import { updateUserProfilePic } from "@/functions/user";

export default function PicForm({ email }: { email: string }) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const profileOptions = [
    "https://ulqf2xmuzjhvhqg7.public.blob.vercel-storage.com/default.jpeg",
    "https://ulqf2xmuzjhvhqg7.public.blob.vercel-storage.com/villan.jpeg",
    "https://ulqf2xmuzjhvhqg7.public.blob.vercel-storage.com/devil.jpeg",
    "https://ulqf2xmuzjhvhqg7.public.blob.vercel-storage.com/hacker.jpeg",
    "https://ulqf2xmuzjhvhqg7.public.blob.vercel-storage.com/hooded.jpeg"
  ];

  const handleSelectImage = (image: string) => {
    setSelectedImage(image);
  };

  const handleUpload = async () => {
    if (!selectedImage) {
      toast.error("Please select an image to upload.");
      return;
    }

    setLoading(true);
    try {      
      const response = await updateUserProfilePic(email, selectedImage)

      if (response?.success) {
        toast.success("Profile picture updated successfully!");
        setSelectedImage(null);
      } else {
       toast.error(response?.message || "Failed to upload profile picture.");
      }
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      toast.error("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* <div className="relative w-32 h-32">
        {selectedImage ? (
          <img
            src={selectedImage}
            alt="Selected Profile"
            className="w-full h-full rounded-full object-cover border border-gray-300"
          />
        ) : (
          <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
            No Image
          </div>
        )}
      </div> */}

      {/* Dialog Trigger */}
      <Dialog>
        <DialogTrigger className="cursor-pointer items-center gap-2 rounded-md bg-black p-3 text-white">
          Edit
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Select a Profile Picture</DialogTitle>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {profileOptions.map((image, index) => (
              <div
                key={index}
                className={`w-24 h-24 rounded-full border-2 ${
                  selectedImage === image ? "border-blue-500" : "border-gray-300"
                } cursor-pointer`}
                onClick={() => handleSelectImage(image)}
              >
                <Image
                height={24}
                width={24}
                  src={image}
                  alt={`Profile Option ${index + 1}`}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
            ))}
          </div>
          <Button
            onClick={handleUpload}
            disabled={loading || !selectedImage}
            className="mt-4 w-full bg-green-500 text-white"
          >
            {loading ? "Uploading..." : "Upload"}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}