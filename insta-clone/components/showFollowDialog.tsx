'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import Image from 'next/image';

interface User {
  username: string;
  fullName: string;
  profilePhoto: string;
  email: string;
}

interface FollowDialogProps {
  showFollowers: boolean;
  onClose: () => void;
  followers: User[];
  following: User[];
  myUsername:string;
}

const FollowDialog: React.FC<FollowDialogProps> = ({
  showFollowers,
  onClose,
  followers,
  following,
  myUsername
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const userList = showFollowers ? followers : following;

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center px-4 sm:px-0">
      <div
        ref={dialogRef}
        className="bg-white text-black w-full max-w-md min-h-[400px] max-h-[500px] rounded-xl shadow-lg overflow-hidden flex flex-col"
      >
        <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200 relative">
          <h2 className="text-center w-full text-base font-medium">
            {showFollowers ? 'Followers' : 'Following'}
          </h2>
          <button onClick={onClose} className="absolute right-4">
            <X className="w-5 h-5 text-black" />
          </button>
        </div>

        <div className="px-4 py-2 border-b border-gray-200">
          <input
            placeholder="Search"
            className="w-full rounded-md bg-gray-100 text-sm text-black px-3 py-1.5 focus:outline-none placeholder:text-gray-500"
          />
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          {userList.length === 0 ? (
            <p className="text-center text-sm text-gray-400">
              No {showFollowers ? 'followers' : 'following'} yet.
            </p>
          ) : (
            userList.map((user, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3 w-full">
                  <Image
                    src={user.profilePhoto || '/images/default-profile.png'}
                    alt="profile"
                    width={30}
                    height={30}
                    className="rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex flex-col overflow-hidden">
                    <button
                      onClick={() => {
                        if(user.username != myUsername){
                        router.push(`/profile/${user.email}`)
                        }
                      }
                      }
                      className="text-sm font-medium text-blue-600 text-left truncate hover:underline cursor-pointer"
                    >
                      {user.username} <span className='text-black'>{user.username == myUsername && "(You)"}</span>
                    </button>
                    <p className="text-xs text-gray-500 truncate">{user.fullName}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default FollowDialog;
