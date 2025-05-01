'use client';

import { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import { ImagePlus, Video, ArrowLeft, Loader2, X } from 'lucide-react';
import axios from 'axios';

const CreatePostDialog = ({ onClose }: { onClose: () => void }) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isCaptionVisible, setIsCaptionVisible] = useState(false);
  const [caption, setCaption] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Fetch user info
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get('/api/authenticate/token');
        setUser(res.data.token);
      } catch (err) {
        console.error('Failed to fetch user:', err);
      }
    };
    fetchUser();
  }, []);

  // ESC key closes modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Handle image input
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setSelectedImage(reader.result as string); // base64
      reader.readAsDataURL(file);
    }
  };

  const handleNextClick = () => {
    setIsCaptionVisible(true);
  };

  const handleShare = async () => {
    if (!user || !selectedImage || !caption.trim()) return;

    setIsLoading(true);

    try {
      await axios.post('/api/post/createPost', {
        email: user.email,
        username: user.username,
        postTitle: caption,
        postPhoto: selectedImage,
        profilePhoto: user.profilePhoto,
      });

      setIsLoading(false);
      window.location.reload()
      onClose();
    } catch (error) {
      console.error('Failed to create post:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-2 font-poppins">
      <div
        ref={dialogRef}
        className="bg-white w-full max-w-[550px] h-[500px] rounded-xl overflow-hidden shadow-xl transition-all duration-300 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-center relative px-4 py-3 border-b border-gray-200">
          {selectedImage && (
            <button
              onClick={() => {
                if (isCaptionVisible) setIsCaptionVisible(false);
                else setSelectedImage(null);
              }}
              className="absolute left-4 text-neutral-700 hover:text-neutral-900 transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          <h2 className="text-sm font-medium text-neutral-800">Create new post</h2>

          {/* Close (X) Button */}
          <button
            onClick={onClose}
            className="absolute right-4 text-neutral-700 hover:text-neutral-900 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Upload UI */}
        {!selectedImage && !isCaptionVisible && (
          <div className="flex flex-col items-center justify-center flex-1 text-center">
            <div className="flex items-center justify-center mb-4 text-gray-500">
              <ImagePlus className="w-10 h-10 mr-2" />
              <Video className="w-10 h-10" />
            </div>
            <h3 className="text-gray-800 text-sm font-light">Drag photos and videos here</h3>
            <label className="mt-5 bg-[#0095f6] hover:bg-[#0077cc] text-white text-sm font-medium px-4 py-2 rounded-md cursor-pointer transition">
              Select from computer
              <input
                type="file"
                className="hidden"
                accept="image/*,video/*"
                onChange={handleImageChange}
                disabled={isLoading}
              />
            </label>
          </div>
        )}

        {/* Image Preview */}
        {selectedImage && !isCaptionVisible && (
          <div className="flex-1 flex items-center justify-center bg-neutral-100 relative">
            <div className="w-[450px] h-[450px] relative bg-white flex items-center justify-center rounded-md overflow-hidden">
              <Image
                src={selectedImage}
                alt="Preview"
                fill
                className="object-contain"
              />
              <button
                className="cursor-pointer absolute bottom-4 right-4 bg-[#0095f6] hover:bg-[#0077cc] text-white text-sm font-medium py-2 px-5 rounded-md transition"
                onClick={handleNextClick}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Caption Input */}
        {isCaptionVisible && (
          <div className="flex flex-col flex-1 px-4 py-3">
            {/* User Info */}
            <div className="flex items-center gap-3 mb-3">
              <Image
                src={user?.profilePhoto || '/images/default-profile.png'}
                alt="User"
                width={28}
                height={28}
                className="rounded-full object-cover"
              />
              <span className="text-sm font-semibold text-neutral-900">
                {user?.username || 'username'}
              </span>
            </div>

            {/* Caption */}
            <div className="flex-1">
              <textarea
                placeholder="Write a caption..."
                className="w-full h-full resize-none border-none outline-none text-sm text-neutral-800 placeholder:text-neutral-500 focus:ring-0"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                disabled={isLoading}
                style={{
                  lineHeight: '1.5',
                  fontWeight: 400,
                }}
              />
            </div>

            {/* Share Button */}
            <div className="pt-3">
              <button
                onClick={handleShare}
                disabled={isLoading || !caption.trim()}
                className="w-full bg-[#0095f6] hover:bg-[#0077cc] cursor-pointer text-white text-sm font-medium py-2 rounded-md transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading && <Loader2 className="animate-spin w-4 h-4" />}
                Share
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreatePostDialog;
