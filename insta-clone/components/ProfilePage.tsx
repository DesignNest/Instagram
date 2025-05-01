'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Image from 'next/image';
import { Loader, Image as ImageIcon, Heart, Bookmark } from 'lucide-react';
import clsx from 'clsx';
import EditProfileDialog from './EditProfileDialog';
import UserPostsGrid from './UserPostsGrid';
import LikedPostsGrid from './LikePostsGrid';
import SavedPostsGrid from './SavedPostGrid';
import FollowDialog from './showFollowDialog';
const TABS = [
  { label: 'Posts', value: 'posts', icon: ImageIcon },
  { label: 'Likes', value: 'likes', icon: Heart },
  { label: 'Saved', value: 'saved', icon: Bookmark },
];

const ProfilePage = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');
  const [showDialog, setShowDialog] = useState(false);
  const [postCount, setPostCount] = useState(0);
  const [showFollowDialog, setShowFollowDialog] = useState(false);
const [showFollowersTab, setShowFollowersTab] = useState(true);
const [followersList, setFollowersList] = useState<any[]>([]);
const [followingList, setFollowingList] = useState<any[]>([]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const tokenRes = await axios.get('/api/authenticate/token');
        const email = tokenRes.data.token?.email;
         
        if (!email) return;

        const res = await axios.post('/api/data/getUserData', { email });
        const { user: userData, postCount } = res.data;

        setUser(userData);
        setPostCount(postCount);
        const followData = await axios.post('/api/follow/getFollowersFollowing', {
          email,
        });
        
        setFollowersList(followData.data.followers || []);
        setFollowingList(followData.data.following || []);
        
      } catch (err) {
        console.error('Error fetching user:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSave = (updatedData: any) => {
    setUser((prev: any) => ({ ...prev, ...updatedData }));
  };
  const openFollowDialog = (showFollowers: boolean) => {
    setShowFollowersTab(showFollowers);
    setShowFollowDialog(true);
  };
  
  if (loading) {
    return (
      <div className="w-full flex justify-center items-center py-20">
        <Loader className="animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-10 font-poppins">
      {/* Profile Header */}
      <div className="flex flex-row gap-10 mb-10 justify-start lg:justify-center">
        {/* Profile Photo */}
        <div className="relative w-28 h-28 md:w-32 md:h-32 shrink-0">
          <Image
            src={user?.profilePhoto || '/images/default-profile.png'}
            alt="Profile Photo"
            fill
            className="rounded-full object-cover border border-gray-300"
          />
        </div>

        {/* Info Section */}
        <div className="flex flex-col justify-center space-y-4 text-left">
          {/* Top Row */}
          <div className="flex items-center gap-4 flex-wrap">
            <h2 className="text-md font-light text-gray-800">{user?.username}</h2>
            <button
              className="px-4 py-1 border border-gray-300 rounded-md text-sm font-medium text-black bg-gray-100 cursor-pointer"
              onClick={() => setShowDialog(true)}
            >
              Edit Profile
            </button>
          </div>

          {/* Stats */}
          <div className="flex gap-8 text-sm text-gray-700">
  <span>
    <strong>{postCount}</strong> posts
  </span>
  <span
    className="cursor-pointer hover:underline"
    onClick={() => openFollowDialog(true)}
  >
    <strong>{followersList.length}</strong> followers
  </span>
  <span
    className="cursor-pointer hover:underline"
    onClick={() => openFollowDialog(false)}
  >
    <strong>{followingList.length}</strong> following
  </span>
</div>


          {/* Bio */}
          <div className="text-sm text-gray-800">
            {user?.fullName && <p className="font-semibold">{user.fullName}</p>}
            {user?.description && <p>{user.description}</p>}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-t w-full flex justify-center text-xs font-semibold uppercase tracking-wider text-gray-500">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={clsx(
                'flex items-center gap-1 px-6 py-3 border-t-2 transition-colors duration-200 cursor-pointer',
                activeTab === tab.value
                  ? 'border-black text-black'
                  : 'border-transparent hover:text-black'
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Grid Content */}
      <div className="min-h-[200px] mt-4">
        {activeTab === 'posts' && (
          <div className="text-center text-sm text-gray-500">
            <UserPostsGrid
              email={user?.email}
              myUsername={user?.username}
              myProfilePhoto={user?.profilePhoto}
              myEmail={user?.email}
            />
          </div>
        )}
        {activeTab === 'likes' && (
          <div className="text-center text-sm text-gray-500 py-10">
            <LikedPostsGrid
              email={user?.email}
              myEmail={user?.email}
              myUsername={user?.username}
              myProfilePhoto={user?.profilePhoto}
            />
          </div>
        )}
        {activeTab === 'saved' && (
          <div className="text-center text-sm text-gray-500 py-10"><SavedPostsGrid email={user?.email} myEmail={user?.email} myUsername={user?.username} myProfilePhoto={user?.profilePhoto}/></div>
        )}
      </div>

      {/* Edit Profile Dialog */}
      {showDialog && (
        <EditProfileDialog
          user={user}
          onClose={() => setShowDialog(false)}
          onSave={handleSave}
        />
        
      )}
      {showFollowDialog && (
  <FollowDialog
    showFollowers={showFollowersTab}
    onClose={() => setShowFollowDialog(false)}
    followers={followersList}
    following={followingList}
    myUsername={user.username}
  />
)}

    </div>
  );
};

export default ProfilePage;
