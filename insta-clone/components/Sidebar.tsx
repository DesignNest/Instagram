'use client';

import { useEffect, useState } from 'react';
import {
  Home,
  PlusSquare,
  User,
  LogOut,
  Instagram,
  MessageCircle,
  Search,
  Heart,
  Loader2
} from 'lucide-react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import CreatePostDialog from './CreatePostDialog';
import SearchPanel from './SearchPanel';
import NotificationPanel from './NotificationPanel';
import { useChatUI } from '@/contexts/ChatUIContext';
import axios from 'axios';

const navItems = [
  { label: 'Home', icon: Home, path: '/' },
  { label: 'Create', icon: PlusSquare, path: '' },
  { label: 'Messages', icon: MessageCircle, path: '/messages' },
  { label: 'Profile', icon: User, path: '/profile' },
];

const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showSearchPanel, setShowSearchPanel] = useState(false);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const [notifications, setNotifications] = useState<{
    likeNotifications: any[];
    commentNotifications: any[];
    followNotifications: any[];
  } | null>(null);
  const [myEmail, setEmail] = useState('');
  const [hasNotification, setHasNotification] = useState(false);
  const [username, setUsername] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { showMobileSidebar } = useChatUI();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const tokenRes = await axios.get('/api/authenticate/token');
        const email = tokenRes.data.token?.email;
        const myUsername = tokenRes.data.token?.username;
        setEmail(email);
        setUsername(myUsername);
        const response = await axios.post('/api/notifications/getNotifications', { email });

        if (response.data.success) {
          setNotifications(response.data.notifications);
          setHasNotification(!!response.data.notification); // Make sure it's boolean
        } else {
          console.error('Failed to fetch notifications:', response.data.message);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
  }, []);

  const seeNotifications = async () => {
    try {
      await axios.post('/api/notifications/seeNotifications', { email: myEmail });
    } catch (error) {
      console.log(error);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const res = await axios.delete('/api/logout');
      if (res.data.success) {
        router.push('/auth');
      }
    } catch (error) {
      console.log('An Error Occurred!');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleNavigate = (path: string, label: string) => {
    if (label === 'Create') {
      setShowCreateDialog(true);
    } else {
      setShowCreateDialog(false);
      setShowSearchPanel(false);
      setShowNotificationPanel(false);
      setHasNotification(false);
      router.push(path);
    }
  };

  const hideLabels = showSearchPanel || showNotificationPanel || pathname.startsWith('/messages');
  const isMessagesPage = pathname.startsWith('/messages');

  return (
    <>
      {/* Desktop Sidebar */}
      <div className={`h-screen relative ${!showMobileSidebar ? 'hidden md:flex' : 'flex'} z-50`}>
        <aside
          className={`hidden md:flex ${hideLabels ? 'w-20 px-2 items-center' : 'w-64 px-6'}
            bg-white border-r border-gray-300 py-8 flex-col justify-between font-poppins
            transition-all duration-300 ease-in-out`}
        >
          <div className="flex justify-start items-center h-12 mb-10 px-3">
            {hideLabels ? (
              <Instagram
                size={28}
                className="text-black cursor-pointer"
                onClick={() => handleNavigate('/', 'Home')}
              />
            ) : (
              <Image
                src="/images/insta-written.png"
                alt="Instagram Logo"
                width={120}
                height={40}
                className="object-contain cursor-pointer"
                onClick={() => handleNavigate('/', 'Home')}
              />
            )}
          </div>

          <nav className="flex flex-col gap-6 text-gray-800 text-base font-medium">
            {[
              { label: 'Home', icon: Home, action: () => handleNavigate('/', 'Home') },
              {
                label: 'Search',
                icon: Search,
                action: () => {
                  setShowSearchPanel((prev) => !prev);
                  setShowNotificationPanel(false);
                }
              },
              { label: 'Create', icon: PlusSquare, action: () => setShowCreateDialog(true) },
              {
                label: 'Messages',
                icon: MessageCircle,
                action: () => handleNavigate('/messages', 'Messages')
              },
              {
                label: 'Notifications',
                icon: Heart,
                action: () => {
                  setShowNotificationPanel((prev) => !prev);
                  setShowSearchPanel(false);
                  setHasNotification(false);
                }
              },
              {
                label: 'Profile',
                icon: User,
                action: () => handleNavigate('/profile', 'Profile')
              }
            ].map(({ label, icon: Icon, action }) => (
              <div
                key={label}
                onClick={action}
                className={`flex items-center gap-4 cursor-pointer rounded-lg px-3 py-2 transition relative ${
                  pathname === '/' && label === 'Home' && !showSearchPanel && !showNotificationPanel
                    ? 'text-black'
                    : pathname.startsWith('/messages') && label === 'Messages'
                    ? 'text-black'
                    : pathname.startsWith('/profile') && label === 'Profile'
                    ? 'text-black'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <Icon size={24} />
                {label === 'Notifications' && hasNotification === true && (
                  <span className="absolute top-2 left-7 w-2 h-2 bg-red-500 rounded-full" />
                )}
                <span className={`${hideLabels ? 'hidden' : 'inline'}`}>{label}</span>
              </div>
            ))}
          </nav>

          <div className="mt-auto hidden md:block">
            <div
              onClick={handleLogout}
              className={`flex items-center gap-4 cursor-pointer hover:bg-gray-100 rounded-lg px-3 py-2 transition text-black ${
                isLoggingOut && 'justify-center'
              }`}
            >
              {!isLoggingOut ? (
                <>
                  <LogOut size={24} />
                  <span className={`${hideLabels ? 'hidden' : 'inline'}`}>Logout</span>
                </>
              ) : (
                <Loader2 className="animate-spin w-5 h-5" />
              )}
            </div>
          </div>
        </aside>

        {/* Panels - Desktop */}
        {showSearchPanel && (
          <div className="absolute left-64 top-0 h-full hidden sm:block">
            <SearchPanel isOpen={showSearchPanel} onClose={() => setShowSearchPanel(false)} />
          </div>
        )}
        {showNotificationPanel && notifications && (
          <div className="absolute left-20 top-0 h-full hidden sm:block">
            <NotificationPanel
              notifications={notifications}
              hasNotification={hasNotification}
              onClose={() => {
                setShowNotificationPanel(false);
                seeNotifications();
              }}
            />
          </div>
        )}
        {showCreateDialog && <CreatePostDialog onClose={() => setShowCreateDialog(false)} />}
      </div>

      {/* Top Bar - Mobile */}
      {!isMessagesPage && (
        <div className="fixed top-0 w-full bg-white border-b border-gray-300 flex items-center justify-between p-3 md:hidden z-40">
          <div
            className="text-black text-lg font-bold cursor-pointer"
            onClick={() => handleNavigate('/', 'Home')}
          >
            <Image
              src="/images/insta-written.png"
              alt="Instagram Logo"
              width={100}
              height={30}
              className="object-contain"
            />
          </div>
          <div className="flex items-center gap-5">
            <Search
              size={24}
              className="text-black cursor-pointer"
              onClick={() => {
                setShowSearchPanel((prev) => !prev);
                setShowNotificationPanel(false);
              }}
            />
            <div className="relative">
              <Heart
                size={24}
                className="text-black cursor-pointer"
                onClick={() => {
                  setShowNotificationPanel((prev) => !prev);
                  setShowSearchPanel(false);
                  setHasNotification(false);
                  seeNotifications();
                }}
              />
              {hasNotification === true && (
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Nav - Mobile */}
      <div className="fixed bottom-0 w-full bg-white border-t border-gray-300 flex justify-around items-center p-2 md:hidden z-50">
        {navItems.map(({ label, icon: Icon, path }) => (
          <div
            key={label}
            onClick={() => handleNavigate(path, label)}
            className="flex flex-col items-center justify-center cursor-pointer text-gray-700 hover:text-black"
          >
            <Icon size={24} />
          </div>
        ))}
      </div>

      {/* Mobile Panels */}
      {showSearchPanel && (
        <div className="fixed top-0 left-0 w-full h-full bg-white z-50 block sm:hidden">
          <SearchPanel isOpen={showSearchPanel} onClose={() => setShowSearchPanel(false)} />
        </div>
      )}
      {showNotificationPanel && notifications && (
        <div className="fixed top-0 left-0 w-full h-full bg-white z-50 block sm:hidden">
          <NotificationPanel
            notifications={notifications}
            hasNotification={hasNotification}
            onClose={() => setShowNotificationPanel(false)}
          />
        </div>
      )}

      {showCreateDialog && <CreatePostDialog onClose={() => setShowCreateDialog(false)} />}
    </>
  );
};

export default Sidebar;
