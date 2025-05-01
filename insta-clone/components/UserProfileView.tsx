'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Image from 'next/image';
import { Loader, Image as ImageIcon, Heart, Bookmark, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import UserPostsGrid from './UserPostsGrid';
import LikedPostsGrid from './LikePostsGrid';
import SavedPostsGrid from './SavedPostGrid';
import FollowDialog from './showFollowDialog';
import StoryDialog from './StoryDialog';

const TABS = [
  { label: 'Posts', value: 'posts', icon: ImageIcon },
  { label: 'Likes', value: 'likes', icon: Heart },
  { label: 'Saved', value: 'saved', icon: Bookmark },
];

interface OtherUserProfilePageProps {
  email: string;
}

const OtherUserProfilePage = ({ email }: OtherUserProfilePageProps) => {
  const [user, setUser] = useState<any>(null);
  const [postCount, setPostCount] = useState(0);
  const [activeTab, setActiveTab] = useState('posts');
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowBack, setIsFollowBack] = useState(false);
  const [token, setToken] = useState<any>(null);
  const [showFollowDialog, setShowFollowDialog] = useState(false);
  const [showFollowersTab, setShowFollowersTab] = useState(true);
  const [followersList, setFollowersList] = useState<any[]>([]);
  const [followingList, setFollowingList] = useState<any[]>([]);
  const [followingStories, setFollowingStories] = useState<any[]>([]); // Stories of followed users
  const [selectedStory, setSelectedStory] = useState<any | null>(null); // Selected story to view
  const [followLoading,setFollowLoading] = useState(false)
  useEffect(() => {
    const getToken = async () => {
      try {
        const tokenRes = await axios.get('/api/authenticate/token');
        setToken(tokenRes.data.token);
      } catch (err) {
        console.error('Error fetching token:', err);
      }
    };

    getToken();
  }, []);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!token?.email) return;

      try {
        const res = await axios.post('/api/data/getUserData', { email });
        const { user: userData, postCount } = res.data;
        setUser(userData);
        setPostCount(postCount);

        const followStatus = await axios.post('/api/follow/checkFollowing', {
          currentUserEmail: token.email,
          otherUserEmail: email,
        });

        setIsFollowing(followStatus.data.isFollowing);
        setIsFollowBack(followStatus.data.message === 'Follow Back');

        const followData = await axios.post('/api/follow/getFollowersFollowing', {
          email,
        });
        
        setFollowersList(followData.data.followers || []);
        setFollowingList(followData.data.following || []);
        
        const storiesRes = await axios.post('/api/stories/getStory', { email });
        setFollowingStories(storiesRes.data.data || []);
        console.log(followingStories)
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    if (email && token?.email) {
      fetchUserProfile();
    }
  }, [email, token, followingList]);

  const handleFollowToggle = async () => {
    setFollowLoading(true)
    try {
      if (!token?.email || !token?.username || !user?.username) return;

      if (isFollowing) {
        await axios.post('/api/follow/unfollowUser', {
          followerEmail: token.email,
          followingEmail: email,
        });
      } else {
        await axios.post('/api/follow/followUser', {
          followerEmail: token.email,
          followerUsername: token.username,
          followingEmail: email,
          followingUsername: user.username,
        });
      }

      setIsFollowing(!isFollowing);
      setIsFollowBack(false);
    } catch (error) {
      console.error('Error updating follow status:', error);
    }finally{
      setFollowLoading(false)
    }
  };

  const openFollowDialog = (showFollowers: boolean) => {
    setShowFollowersTab(showFollowers);
    setShowFollowDialog(true);
  };

  const hasStory = followingStories.some((story: any) => story.email === email);

  if (loading || !token) {
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
      <div className="relative shrink-0 cursor-pointer">
      <div
        className={clsx(
          'relative w-28 h-28 md:w-32 md:h-32 rounded-full p-[2px] transition-all duration-300',
          hasStory && 'bg-gradient-to-tr from-yellow-400 via-red-500 to-pink-500'
        )}
        onClick={() => {
          if (hasStory) {
            const story = followingStories.find((s: any) => s.email === email);
            if (story) setSelectedStory(story);
          }
        }}
      >
        <div className="bg-white rounded-full w-full h-full flex items-center justify-center p-1">
          <Image
            src={user?.profilePhoto || '/images/default-profile.png'}
            alt="Profile Photo"
            fill
            className="rounded-full object-cover"
          />
        </div>
      </div>
    </div>

        {/* Info Section */}
        <div className="flex flex-col justify-center space-y-4 text-left">
          <div className="flex items-center gap-4 flex-wrap">
            <h2 className="text-md font-light text-gray-800">{user?.username}</h2>
            {token.email !== email && (
              <button
              className={clsx(
                'px-4 py-1 border border-gray-300 rounded-md text-sm font-medium text-black cursor-pointer',
                {
                  'bg-blue-500 text-white': isFollowBack || (!isFollowing && !isFollowBack),
                  'bg-gray-100': isFollowing,
                }
              )}
              onClick={handleFollowToggle}
            >
              {followLoading ? <Loader2 className='w-5 h-5 animate-spin'></Loader2>
              : isFollowing ? 'Unfollow' : isFollowBack ? 'Follow Back' : 'Follow'}
            </button>
            
            
            )}
          </div>

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
          <UserPostsGrid
            email={email}
            myEmail={email}
            myUsername={user.username}
            myProfilePhoto={user.profilePhoto}
          />
        )}
        {activeTab === 'likes' && (
          <LikedPostsGrid
            email={email}
            myEmail={email}
            myUsername={user.username}
            myProfilePhoto={user.profilePhoto}
          />
        )}
        {activeTab === 'saved' && (
          <SavedPostsGrid
            email={email}
            myEmail={email}
            myUsername={user.username}
            myProfilePhoto={user.profilePhoto}
          />
        )}
      </div>

      {/* Follow Dialog */}
      {showFollowDialog && (
        <FollowDialog
          showFollowers={showFollowersTab}
          onClose={() => setShowFollowDialog(false)}
          followers={followersList}
          following={followingList}
          myUsername={token.username}
        />
      )}

      {/* Story Dialog */}
      {selectedStory && (
        <StoryDialog
          story={selectedStory}
          onClose={() => setSelectedStory(null)}
        />
      )}
    </div>
  );
};

export default OtherUserProfilePage;
