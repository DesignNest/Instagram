'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';

interface StoryDialogProps {
  story: {
    storyPhoto: string;
    username: string;
    profilePhoto: string;
  };
  onClose: () => void;
}

const StoryDialog: React.FC<StoryDialogProps> = ({ story, onClose }) => {
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Function to start the progress
  const startProgress = useCallback(() => {
    setProgress(0); // Reset progress
    if (intervalRef.current) return; // Prevent multiple intervals

    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(intervalRef.current!);
          intervalRef.current = null; // Clear interval reference
          onClose(); // Close dialog once progress reaches 100%
          return 100;
        }
        return prev + 1; // Increment progress smoothly
      });
    }, 50); // Update every 50ms (100 steps = ~5 seconds)
  }, [onClose]);

  // Stop the progress
  const stopProgress = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null; // Clear interval reference
    }
  }, []);

  // Handle story start and cleanup
  useEffect(() => {
    startProgress();

    return () => stopProgress(); // Cleanup interval on unmount or story change
  }, [startProgress, stopProgress]);

  // Pause or resume progress based on `isPaused` state
  useEffect(() => {
    if (isPaused) {
      stopProgress();
    } else {
      startProgress();
    }
  }, [isPaused, startProgress, stopProgress]);

  // Spacebar to pause/resume
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') setIsPaused(true);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') setIsPaused(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center"
      onMouseDown={() => setIsPaused(true)}
      onMouseUp={() => setIsPaused(false)}
    >
      {/* Progress Bar */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gray-700">
        <div
          className="h-full bg-white transition-all duration-50"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Close Button */}
      <button
        onClick={() => {
          stopProgress();
          onClose();
        }}
        className="absolute top-5 right-5 text-white text-3xl"
      >
        <X />
      </button>

      {/* Story Display */}
      <div className="w-full max-w-sm aspect-[9/16] relative rounded-lg overflow-hidden mt-10">
        <Image
          src={story.storyPhoto}
          alt="story"
          fill
          className="object-cover"
        />
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-white">
            <Image
              src={story.profilePhoto}
              alt={story.username}
              fill
              className="object-cover"
            />
          </div>
          <span className="text-white font-semibold text-sm">{story.username}</span>
        </div>
      </div>
    </div>
  );
};

export default StoryDialog;
