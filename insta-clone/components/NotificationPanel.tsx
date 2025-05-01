'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';

interface Notification {
  _id: string;
  senderUsername: string;
  senderProfilePhoto: string;
  action: string;
  commentText?: string;
  sendTime: string;
  postPhoto?: string;
}

interface NotificationPanelProps {
  notifications: { [key: string]: Notification[] };
  hasNotification: boolean;
  onClose: () => void; // 👈 Accept onClose from parent
}

// utils/formatInstagramTime.ts
export function formatInstagramTime(dateString: string) {
  const now = new Date();
  const past = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d`;

  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  if (now.getFullYear() !== past.getFullYear()) options.year = 'numeric';

  return past.toLocaleDateString(undefined, options);
}

const NotificationPanel = ({ notifications, hasNotification, onClose }: NotificationPanelProps) => {
  const panelRef = useRef<HTMLDivElement>(null); // 👈 create ref

  const allNotifications = Object.values(notifications).flat();
  const hasAnyNotification = allNotifications.length > 0;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose(); // 👈 close if clicked outside
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);
  console.log(allNotifications)
  return (
    <div
      ref={panelRef}
      className="w-[400px] h-full border-r border-gray-300 overflow-y-auto transition-all duration-300 font-poppins z-50 flex flex-col overflow-x-hidden justify-start items-start absolute bg-white"
    >
      {/* Header */}
      <div className="px-5 pt-6 pb-4 w-full">
        <h2 className="text-xl font-bold text-black">Notifications</h2>
      </div>

      {/* Notification List */}
      {hasAnyNotification ?(
        <div className="flex flex-col w-full justify-start items-start">
          {allNotifications.map((notif) => (
            <div
              key={notif._id}
              className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition cursor-pointer w-full"
            >
              {/* Left Side: Profile photo and text */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-full bg-gray-200 overflow-hidden relative shrink-0">
                  <Image
                    src={notif.senderProfilePhoto}
                    alt="User Profile"
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Notification Text */}
                <div className="flex flex-col min-w-0">
                  <p className="text-sm text-black leading-snug truncate">
                    <span className="font-semibold">{notif.senderUsername}</span>{' '}
                    {notif.commentText ? (
                      <>
                        commented: <span className="text-gray-700">{notif.commentText}</span>
                      </>
                    ) : (
                      notif.action
                    )}
                  </p>
                  <span className="text-[11px] text-gray-400 mt-0.5">
                    {formatInstagramTime(notif.sendTime)} Ago
                  </span>
                </div>
              </div>

              {/* Right Side: Reel Preview if exists */}
              {notif.postPhoto && (
                <div className="w-12 h-12 rounded-md overflow-hidden relative shrink-0">
                  <Image
                    src={notif.postPhoto}
                    alt="Reel Preview"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center w-full">
          <p className="text-gray-500 text-sm">No notifications yet.</p>
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;
