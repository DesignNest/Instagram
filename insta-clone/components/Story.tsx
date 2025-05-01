'use client';

import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { Plus } from 'lucide-react';
import axios from 'axios';
import clsx from 'clsx';

interface Story {
  _id: string;
  username: string;
  profilePhoto: string;
  storyPhoto: string;
  email: string;
}

interface StoryProps {
  currentUser: {
    email: string | null;
    username: string | null;
    profilePhoto: string;
  };
}

const StorySection: React.FC<StoryProps> = ({ currentUser }) => {
  const [stories, setStories] = useState<Story[]>([]);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [openCreateStory, setOpenCreateStory] = useState(false);
  const [hasStory, setHasStory] = useState(false);
  const [userStory, setUserStory] = useState<Story | null>(null);
  const [storyImage, setStoryImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchStories = async () => {
    try {
      if (!currentUser.email) return;
      const res = await axios.post('/api/stories/getStory', { email: currentUser.email });
      if (res.data.success) {
        setStories(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch stories:', err);
    }
  };

  useEffect(() => {
    fetchStories();
  }, [currentUser.email]);

  useEffect(() => {
    const story = stories.find((s) => s.email === currentUser.email);
    if (story) {
      setHasStory(true);
      setUserStory(story);
    } else {
      setHasStory(false);
      setUserStory(null);
    }
  }, [stories, currentUser.email]);

  // Story Progress
  useEffect(() => {
    if (selectedStory) {
      setProgress(0);
      if (intervalRef.current) clearInterval(intervalRef.current);

      intervalRef.current = setInterval(() => {
        if (!isPaused) {
          setProgress((prev) => {
            if (prev >= 100) {
              setSelectedStory(null);
              clearInterval(intervalRef.current!);
              return 0;
            }
            return prev + 1;
          });
        }
      }, 50); // 50ms * 100 = ~5 seconds
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [selectedStory, isPaused]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setStoryImage(file);
  };

  const uploadStory = async () => {
    if (!storyImage || !currentUser.email) return;
    try {
      setLoading(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;

        const response = await axios.post('/api/stories/createStory', {
          email: currentUser.email,
          storyPhoto: base64String,
        });

        if (response.data.success) {
          await fetchStories();
          setOpenCreateStory(false);
          setStoryImage(null);
        }
      };
      reader.readAsDataURL(storyImage);
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Stories Bar */}
      <div className="flex items-center gap-4 overflow-x-auto px-4 py-3 bg-white border-b border-gray-200 scrollbar-hide pt-16 sm:pt-0">
        {/* Your Story */}
        <div
          className="flex flex-col items-center cursor-pointer"
          onClick={() => {
            if (hasStory && userStory) setSelectedStory(userStory);
            else setOpenCreateStory(true);
          }}
        >
          <div className="relative w-16 h-16">
            <div
              className={clsx(
                "rounded-full p-[2px]",
                hasStory && "bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600"
              )}
            >
              <div className="bg-white rounded-full w-full h-full flex items-center justify-center overflow-hidden">
              {currentUser.profilePhoto ? (
  <Image
    src={currentUser.profilePhoto}
    alt="Your Story"
    width={56}
    height={56}
    className="rounded-full object-cover"
  />
) : (
  <div className="w-14 h-14 rounded-full bg-gray-300" /> // fallback blank circle
)}

              </div>
            </div>
            {!hasStory && (
              <div className="absolute bottom-0 right-0 w-5 h-5 bg-blue-500 border-2 border-white rounded-full flex items-center justify-center">
                <Plus size={14} className="text-white" />
              </div>
            )}
          </div>
          <span className="mt-1 text-xs text-center text-black w-16 truncate">Your Story</span>
        </div>

        {/* Other Users' Stories */}
        {stories
          .filter((story) => story.email !== currentUser.email)
          .map((story) => (
            <div
              key={story._id}
              className="flex flex-col items-center cursor-pointer"
              onClick={() => setSelectedStory(story)}
            >
              <div className="relative w-16 h-16">
                <div className="bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 rounded-full p-[2px]">
                  <div className="bg-white rounded-full w-full h-full flex items-center justify-center overflow-hidden">
                    <Image
                      src={story.profilePhoto}
                      alt={story.username}
                      width={56}
                      height={56}
                      className="rounded-full object-cover"
                    />
                  </div>
                </div>
              </div>
              <span className="mt-1 text-xs text-center text-black w-16 truncate">
                {story.username.length > 10 ? story.username.slice(0, 9) + '...' : story.username}
              </span>
            </div>
          ))}
      </div>

      {/* Story Viewer */}
      {selectedStory && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col items-center justify-center"
          onMouseDown={() => setIsPaused(true)}
          onMouseUp={() => setIsPaused(false)}
          onKeyDown={(e) => e.code === 'Space' && setIsPaused(true)}
          onKeyUp={(e) => e.code === 'Space' && setIsPaused(false)}
          tabIndex={0}
        >
          {/* Progress Bar */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gray-700">
            <div
              className="h-full bg-white transition-all duration-50"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          <button
            onClick={() => setSelectedStory(null)}
            className="absolute top-5 right-5 text-white text-3xl"
          >
            &times;
          </button>

          <div className="w-full max-w-sm aspect-[9/16] relative rounded-lg overflow-hidden mt-10">
            <Image
              src={selectedStory.storyPhoto}
              alt="story"
              fill
              className="object-cover"
            />
            <div className="absolute top-3 left-3 flex items-center gap-2">
              <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-white">
                <Image
                  src={selectedStory.profilePhoto}
                  alt={selectedStory.username}
                  fill
                  className="object-cover"
                />
              </div>
              <span className="text-white font-semibold text-sm">{selectedStory.username}</span>
            </div>
          </div>
        </div>
      )}

      {/* Create Story Dialog */}
      {openCreateStory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl shadow-lg w-80 flex flex-col items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-800">Create Your Story</h2>
            {storyImage && (
              <div className="w-full h-56 bg-gray-100 rounded-lg overflow-hidden relative">
                <Image
                  src={URL.createObjectURL(storyImage)}
                  alt="Story Preview"
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="border p-2 rounded w-full text-sm text-gray-600"
            />
            <button
              onClick={() => setOpenCreateStory(false)}
              className="text-red-500 mt-2 text-sm"
            >
              Cancel
            </button>
            <button
              onClick={uploadStory}
              className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg w-full disabled:bg-gray-400"
              disabled={loading || !storyImage}
            >
              {loading ? 'Uploading...' : 'Post Story'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default StorySection;
