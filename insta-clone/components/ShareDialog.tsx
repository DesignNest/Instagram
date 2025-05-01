'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { X, Search } from 'lucide-react';
import { io } from 'socket.io-client';
import axios from 'axios';

// Initialize socket outside component
const socket = io('http://192.168.29.121:4000'); // adjust URL if needed

interface PostDetails {
  postPhoto: string;
  postTitle: string;
  username: string;
  profilePhoto: string;
  postId: string;
}

interface Chat {
  chatId: string;
  userEmail: string;
  otherUserEmail: string;
  recentMessage: string;
  chats: any[];
  friendUsername: string;
  friendProfilePhoto: string;
}

interface ShareDialogProps {
  messages: Chat[];
  onClose: () => void;
  postDetails: PostDetails;
  email:string | null;
}

const ShareDialog: React.FC<ShareDialogProps> = ({ messages, onClose, postDetails,email }) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const filteredMessages = messages.filter((chat) =>
    chat.friendUsername.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSend = async () => {
    if (!selectedChat) return;
  
    try {
      const res = await axios.post('/api/chat/sendMessage', {
        senderEmail: email,
        receiverEmail: selectedChat.otherUserEmail,
        message: '', 
        isImage: false,
        imageUrl: '',
        isPost: true,
        postUrl: postDetails.postId, 
      });
     
      if (res.data.success) {
        socket.emit('newMessage', {
          chatId: selectedChat.chatId,
          senderEmail: email,
          receiverEmail: selectedChat.otherUserEmail,
          messageId: res.data.data.messageId,
          isPost:true,
          message:"[Post]",
          postDetails:postDetails,
          timeSent: res.data.data.timeSent,
        });
        onClose();
      }
    } catch (error) {
      console.error('Error sending shared post:', error);
    }
  };
  

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        ref={dialogRef}
        className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-base font-semibold">Share</span>
          <button onClick={onClose}>
            <X className="w-6 h-6 text-gray-700" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative p-3">
          <div className="flex items-center bg-gray-100 rounded-md px-3 py-2">
            <Search className="w-4 h-4 text-gray-500 mr-2" />
            <input
              type="text"
              placeholder="Search"
              className="bg-transparent text-sm w-full outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* User Grid */}
        <div className="p-4 grid grid-cols-4 gap-4 overflow-y-auto max-h-80">
          {filteredMessages.map((chat, idx) => (
            <div
              key={idx}
              className={`flex flex-col items-center justify-center text-center cursor-pointer ${
                selectedChat?.chatId === chat.chatId ? 'bg-gray-200 rounded-lg p-2' : ''
              }`}
              onClick={() => setSelectedChat(chat)}
            >
              <div className="relative w-16 h-16">
                <Image
                  src={chat.friendProfilePhoto || '/images/default-profile.png'}
                  alt={chat.friendUsername}
                  fill
                  className="rounded-full object-cover"
                />
              </div>
              <p className="text-xs mt-2 truncate w-full">{chat.friendUsername}</p>
            </div>
          ))}
        </div>

        {/* Bottom Send Button */}
        <div className="p-3">
          <button
            onClick={handleSend}
            disabled={!selectedChat}
            className="w-full bg-[#0095f6] text-white font-semibold py-2 rounded-lg text-sm disabled:bg-gray-400"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareDialog;
