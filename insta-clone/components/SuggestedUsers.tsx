'use client';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

const SuggestedUsers = () => {
  const [user, setUser] = useState<any>(null);
  const [suggested, setSuggested] = useState<any[]>([]);
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});
  const router = useRouter();

  useEffect(() => {
    const fetchUserAndSuggestions = async () => {
      try {
        const userRes = await axios.get('/api/authenticate/token');
        const currentUser = userRes.data.token;
        setUser(currentUser);

        if (!currentUser?.email) return;

        const suggestionRes = await axios.post('/api/suggestions', {
          email: currentUser.email,
        });

        if (suggestionRes.data.success) {
          const suggestionsWithStatus = await Promise.all(
            suggestionRes.data.suggestions.map(async (s: any) => {
              const statusRes = await axios.post('/api/follow/checkFollowing', {
                currentUserEmail: currentUser.email,
                otherUserEmail: s.email,
              });
              return {
                ...s,
                isFollowing: statusRes.data.isFollowing,
              };
            })
          );

          setSuggested(suggestionsWithStatus);
        } else {
          setSuggested([]);
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      }
    };

    fetchUserAndSuggestions();
  }, []);

  const handleFollowToggle = async (targetEmail: string) => {
    if (!user?.email || !user?.username) return;

    setLoadingMap((prev) => ({ ...prev, [targetEmail]: true }));

    try {
      const updated = [...suggested];
      const index = updated.findIndex((s) => s.email === targetEmail);
      const targetUser = updated[index];

      if (targetUser.isFollowing) {
        await axios.post('/api/follow/unfollowUser', {
          followerEmail: user.email,
          followingEmail: targetEmail,
        });
        updated[index].isFollowing = false;
      } else {
        await axios.post('/api/follow/followUser', {
          followerEmail: user.email,
          followerUsername: user.username,
          followingEmail: targetEmail,
          followingUsername: targetUser.username,
        });
        updated[index].isFollowing = true;
      }

      setSuggested(updated);
    } catch (error) {
      console.error('Error updating follow status:', error);
    } finally {
      setLoadingMap((prev) => ({ ...prev, [targetEmail]: false }));
    }
  };

  return (
    <div className="w-full max-w-[320px] text-sm text-neutral-700 sticky lg:ml-36">
      {/* Logged-in User */}
      {user && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Image
              src={user.profilePhoto || '/images/default-profile.png'}
              alt="User"
              width={44}
              height={44}
              className="rounded-full object-cover"
            />
            <div className="leading-tight">
              <p className="font-semibold text-sm">{user.username}</p>
              <p className="text-neutral-400 text-xs">{user.fullName}</p>
            </div>
          </div>
        </div>
      )}

      {/* Suggestions Header */}
      <div className="mb-3 flex justify-between items-center">
        <p className="text-neutral-400 text-sm font-semibold">Suggested for you</p>
        <button className="text-xs text-black font-semibold hover:underline">See All</button>
      </div>

      {/* Suggested Users List */}
      <div className="space-y-4">
        {suggested.map((s, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image
                src={s.profilePhoto || '/images/default-profile.png'}
                alt={s.username}
                width={32}
                height={32}
                className="rounded-full object-cover"
              />
              <div className="leading-tight">
                <p
                  className="text-sm font-medium cursor-pointer"
                  onClick={() => router.push(`/profile/${s.email}`)}
                >
                  {s.username}
                </p>
                <p className="text-xs text-neutral-400">Suggested for you</p>
              </div>
            </div>
            <button
              className={`text-xs font-semibold ${
                s.isFollowing ? 'text-neutral-500' : 'text-[#0095f6]'
              } hover:underline`}
              onClick={() => handleFollowToggle(s.email)}
              disabled={loadingMap[s.email]}
            >
              {loadingMap[s.email] ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : s.isFollowing ? (
                'Unfollow'
              ) : (
                'Follow'
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SuggestedUsers;
