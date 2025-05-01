'use client';
import { Smile, Image as ImageIcon, Mic, SendHorizontal } from 'lucide-react';
import dynamic from 'next/dynamic';

const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false });

interface MessageInputProps {
  messageInput: string;
  setMessageInput: (val: string) => void;
  handleEmojiClick: (emojiData: any) => void;
  showEmojiPicker: boolean;
  setShowEmojiPicker: (val: (prev: boolean) => boolean) => void;
  emojiPickerRef: React.RefObject<HTMLDivElement>;
  handleImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isUploading: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({
  messageInput,
  setMessageInput,
  handleEmojiClick,
  showEmojiPicker,
  setShowEmojiPicker,
  emojiPickerRef,
  handleImageSelect,
  isUploading,
}) => {
  return (
    <div className="px-4 py-2 border-t border-gray-200 bg-white">
      <div className="flex items-center gap-3 relative">
        <div className="relative">
          <Smile
            className="w-5 h-5 text-gray-600 cursor-pointer"
            onClick={() => setShowEmojiPicker((prev) => !prev)}
          />
          {showEmojiPicker && (
            <div className="absolute bottom-10 left-0 z-50" ref={emojiPickerRef}>
              <EmojiPicker
                onEmojiClick={handleEmojiClick}
                theme="light"
                emojiStyle="native"
                width={300}
                height={350}
              />
            </div>
          )}
        </div>

        <label htmlFor="image-upload">
          <ImageIcon className="w-5 h-5 text-gray-600 cursor-pointer" />
        </label>
        <input
          type="file"
          accept="image/*"
          id="image-upload"
          className="hidden"
          onChange={handleImageSelect}
        />


        <input
          type="text"
          placeholder="Message..."
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button type="submit" disabled={isUploading}>
          <SendHorizontal
            className={`w-5 h-5 ${isUploading ? 'text-gray-400' : 'text-blue-500'}`}
          />
        </button>
      </div>
    </div>
  );
};

export default MessageInput;
