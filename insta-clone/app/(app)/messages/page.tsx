'use client';
import { useState, useEffect } from 'react';
import ChatSidebar from '@/components/ChatSidebar';
import MessageComponent from '@/components/MessageComponent';
import { useChatUI } from '@/contexts/ChatUIContext';

export default function Home() {
  const [selectedChat, setSelectedChat] = useState<any | null>(null);
  const { showMobileSidebar, setShowMobileSidebar } = useChatUI();

  const handleSelectChat = (chatData: any) => {
    setSelectedChat(chatData);
    setShowMobileSidebar(false); // hide sidebar on mobile when a chat is selected
  };

  const handleBack = () => {
    setSelectedChat(null);
    setShowMobileSidebar(true); // show sidebar again on mobile when back
  };

  return (
    <div className="flex h-screen w-full bg-white text-black">
      {/* Sidebar - hidden on mobile if message is active */}
      <div className={`w-full md:w-[400px] ${!showMobileSidebar ? 'hidden md:block' : 'block'}`}>
        <ChatSidebar onSelectChat={handleSelectChat} />
      </div>

      {/* Message Area */}
      <div className={`flex-1 ${selectedChat ? 'block' : 'hidden'} md:block`}>
        {selectedChat ? (
          <MessageComponent key={selectedChat?.chatId} chatData={selectedChat} onBack={handleBack} />

        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center h-full w-full">
            <div className="flex flex-col items-center space-y-4">
              <div className="border rounded-full p-6 border-black">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" height="50" viewBox="0 0 24 24" width="50" stroke="black">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M21 15V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4l3 3 3-3h4a2 2 0 0 0 2-2z"
                  />
                </svg>
              </div>
              <h1 className="text-xl font-semibold">Your messages</h1>
              <p className="text-gray-500 text-sm">Follow Any User To Start A Chat</p>
              <button className="bg-blue-500 px-4 py-2 rounded-lg text-white font-semibold">
                Send message
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
