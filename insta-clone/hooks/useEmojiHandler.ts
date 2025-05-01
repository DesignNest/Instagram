import { useState, useRef, useEffect } from 'react';

export function useEmojiHandler(setMessageInput: (fn: (prev: string) => string) => void) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  const handleEmojiClick = (emojiData: any) => {
    setMessageInput((prev) => prev + emojiData.emoji);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(e.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return { showEmojiPicker, setShowEmojiPicker, emojiPickerRef, handleEmojiClick };
}
