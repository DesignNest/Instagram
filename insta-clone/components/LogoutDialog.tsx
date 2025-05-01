import React from 'react';
import { MessageCircle, X, Check } from 'lucide-react';

function LogoutDialog({ onClose, onLogout, username }: { onClose: () => void; onLogout: () => void; username: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm text-xs">
      <div className="w-[90%] max-w-sm bg-white rounded-xl overflow-hidden shadow-lg">
        {/* Header with Message Icon and Text */}
        <div className="border-b px-4 py-5 text-center flex flex-col items-center">
          <p className="text-black font-medium text-base">Log out of @{username}?</p>
        </div>
        {/* Buttons Section */}
        <div className="flex">
          <button
            onClick={onClose}
            className="flex-1 py-3 text-center text-black font-medium border-r border-gray-200 hover:bg-gray-100"
          >
            <X className="inline w-4 h-4 mr-1" />
            CANCEL
          </button>
          <button
            onClick={() => {
              onLogout();
              onClose();
            }}
            className="flex-1 py-3 text-center text-white bg-black font-medium hover:bg-gray-800"
          >
            <Check className="inline w-4 h-4 mr-1" />
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

export default LogoutDialog;
