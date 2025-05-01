'use client';
import { ArrowLeft, Phone, Video } from 'lucide-react';
import Image from 'next/image';

interface ChatHeaderProps {
  friendProfilePhoto?: string;
  friendUsername: string;
  onBack: () => void;
 
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ friendProfilePhoto, friendUsername, onBack}) => {
  return (
    <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
      <div className="flex items-center">
        <button onClick={onBack} className="md:hidden mr-3">
          <ArrowLeft className="w-5 h-5 text-black" />
        </button>
        {friendProfilePhoto ? (
          <Image
            src={friendProfilePhoto}
            alt={friendUsername}
            width={40}
            height={40}
            className="rounded-full"
            unoptimized
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white text-sm">
            {friendUsername?.[0]?.toUpperCase() || '?'}
          </div>
        )}
        <span className="ml-3 font-semibold">{friendUsername}</span>
      </div>
      
    </div>
  );
};

export default ChatHeader;
