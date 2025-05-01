'use client';
import { createContext, useContext, useState } from 'react';

type ChatUIContextType = {
  showMobileSidebar: boolean;
  setShowMobileSidebar: (val: boolean) => void;
};

const ChatUIContext = createContext<ChatUIContextType | undefined>(undefined);

export const ChatUIProvider = ({ children }: { children: React.ReactNode }) => {
  const [showMobileSidebar, setShowMobileSidebar] = useState(true);

  return (
    <ChatUIContext.Provider value={{ showMobileSidebar, setShowMobileSidebar }}>
      {children}
    </ChatUIContext.Provider>
  );
};

export const useChatUI = () => {
  const context = useContext(ChatUIContext);
  if (!context) throw new Error('useChatUI must be used within a ChatUIProvider');
  return context;
};
