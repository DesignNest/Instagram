'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import Image from 'next/image';
import { Phone, X, Video } from 'lucide-react';

interface IncomingCallData {
  callerUsername: string;
  callerProfilePhoto: string;
  callType: 'audio' | 'video';
  onAccept: () => void;
  onReject: () => void;
}

interface IncomingCallContextType {
  showCallNotification: (data: IncomingCallData) => void;
  hideCallNotification: () => void;
}

const IncomingCallContext = createContext<IncomingCallContextType | undefined>(undefined);

export const useIncomingCall = () => {
  const context = useContext(IncomingCallContext);
  if (!context) {
    throw new Error('useIncomingCall must be used within IncomingCallProvider');
  }
  return context;
};

export const IncomingCallProvider = ({ children }: { children: ReactNode }) => {
  const [callData, setCallData] = useState<IncomingCallData | null>(null);

  const showCallNotification = (data: IncomingCallData) => {
    setCallData(data);
  };

  const hideCallNotification = () => {
    setCallData(null);
  };

  return (
    <IncomingCallContext.Provider value={{ showCallNotification, hideCallNotification }}>
      {children}
      {callData && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 z-50 bg-white rounded-xl shadow-xl flex items-center justify-between p-4 w-full max-w-sm border border-gray-200 animate-fadeIn">
          <div className="flex items-center gap-3">
            <Image
              src={callData.callerProfilePhoto}
              alt={callData.callerUsername}
              width={50}
              height={50}
              className="rounded-full"
            />
            <div>
              <div className="font-semibold text-sm">{callData.callerUsername}</div>
              <div className="text-xs text-gray-500">{callData.callType === 'audio' ? 'Voice Call' : 'Video Call'}</div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                callData.onReject();
                hideCallNotification();
              }}
              className="p-2 bg-red-500 rounded-full text-white hover:bg-red-600"
            >
              <X className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                callData.onAccept();
                hideCallNotification();
              }}
              className="p-2 bg-green-500 rounded-full text-white hover:bg-green-600"
            >
              {callData.callType === 'audio' ? <Phone className="w-4 h-4" /> : <Video className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}
    </IncomingCallContext.Provider>
  );
};
