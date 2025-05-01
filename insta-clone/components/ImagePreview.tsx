'use client';
import Image from 'next/image';
import { X } from 'lucide-react';

interface ImagePreviewProps {
  imagePreview: string;
  handleRemoveImage: () => void;
  isUploading: boolean;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ imagePreview, handleRemoveImage, isUploading }) => {
  if (!imagePreview) return null;

  return (
    <div className="relative w-full px-4 pb-2">
      <div className="relative inline-block">
        {/* Image */}
        <Image
          src={imagePreview}
          alt="preview"
          width={200}
          height={200}
          className="rounded-xl object-cover"
        />
        
        {/* Remove button */}
        <button
          onClick={handleRemoveImage}
          className="absolute -top-2 -right-2 bg-white p-1 rounded-full shadow-md"
        >
          <X className="w-4 h-4 text-red-500" />
        </button>

        {/* Overlay and Loader */}
        {isUploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-xl">
            <div className="w-16 h-2 bg-gray-300 rounded-full">
              <div className="h-full bg-blue-500 animate-pulse" style={{ width: '60%' }}></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImagePreview;
