"use client"

import Image from "next/image";
import { useState, useEffect } from "react";
import { Camera, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfilePictureUploadProps {
  onChange: (image: string) => void;
  value?: string;
  className?: string;
}

const ProfilePictureUpload = ({ onChange, value, className }: ProfilePictureUploadProps) => {
  const [imagePreview, setImagePreview] = useState<string | undefined>(value);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    setImagePreview(value);
  }, [value]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setImagePreview(base64String);
      onChange(base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const removeImage = () => {
    setImagePreview(undefined);
    onChange("");
  };

  return (
    <div className={cn("flex flex-col items-center space-y-3", className)}>
      <div
        className={cn(
          "relative w-32 h-32 rounded-full border-2 border-dashed transition-all cursor-pointer overflow-hidden",
          isDragging ? "border-brand-500 bg-brand-50" : "border-gray-300 hover:border-brand-400",
          imagePreview ? "border-solid border-gray-200" : ""
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {imagePreview ? (
          <>
            <Image
              src={imagePreview}
              alt="Profile preview"
              fill
              className="object-cover"
              sizes="128px"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors z-10"
            >
              <X className="h-4 w-4" />
            </button>
          </>
        ) : (
          <label
            htmlFor="profile-picture-upload"
            className="flex flex-col items-center justify-center w-full h-full cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <div className="flex flex-col items-center justify-center">
              <div className="bg-brand-100 rounded-full p-3 mb-2">
                <Camera className="h-8 w-8 text-brand-600" />
              </div>
              <p className="text-xs text-gray-500 text-center px-2">
                {isDragging ? "Drop image here" : "Upload Photo"}
              </p>
              <p className="text-xs text-gray-400 mt-1">or drag & drop</p>
            </div>
            <input
              id="profile-picture-upload"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
        )}
      </div>

      <div className="text-center">
        <p className="text-xs text-gray-500">
          Recommended: Square image, at least 400x400px
        </p>
        <p className="text-xs text-gray-400">Max size: 5MB</p>
      </div>
    </div>
  );
};

export default ProfilePictureUpload;
