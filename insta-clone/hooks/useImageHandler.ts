import { useState } from 'react';
import axios from 'axios';

export function useImageHandler() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [cloudinaryUrl, setCloudinaryUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result?.toString() || '';
        setImagePreview(base64);
        setIsUploading(true);
        try {
          const res = await axios.post('/api/uploadImage', {
            base64Image: base64,
            folder: 'chat-images',
          });
          if (res.data.success) {
            setCloudinaryUrl(res.data.imageUrl);
          }
        } catch (error) {
          console.error('Image upload failed:', error);
        } finally {
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
      setSelectedImage(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setCloudinaryUrl(null);
    setIsUploading(false);
  };

  return {
    selectedImage,
    imagePreview,
    cloudinaryUrl,
    isUploading,
    handleImageSelect,
    handleRemoveImage,
  };
}
