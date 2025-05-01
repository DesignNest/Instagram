'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Post from '@/components/Post';
import SuggestedUsers from '@/components/SuggestedUsers';
import { IncomingCallProvider } from '@/contexts/UseIncomingCall';
import StorySection from '@/components/Story';
import { Loader2 } from 'lucide-react';

interface Reply {
  senderEmail: string;
  senderUsername: string;
  senderProfilePhoto: string;
  replyText: string;
  dateReplied: string;
}

interface Comment {
  commentId: string;
  commentTitle: string;
  commentText: string;
  senderEmail: string;
  senderUsername: string;
  senderProfilePhoto: string;
  dateCommented: string;
  replies: Reply[];
}

interface PostType {
  postId: string;
  email: string;
  username: string;
  profilePhoto: string;
  postTitle: string;
  postPhoto: string;
  likes: number;
  dateUploaded: string;
  comments: Comment[];
  liked: boolean;
  saved: boolean;
}

export default function Home() {
  const [posts, setPosts] = useState<PostType[]>([]);
  const [email, setEmail] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchUserAndPosts = async () => {
      setIsLoading(true);
      try {
        const userRes = await axios.get('/api/authenticate/token');
        const userEmail = userRes.data.token.email;
        setEmail(userEmail);
        setUsername(userRes.data.token.username);
        setProfilePhoto(userRes.data.token.profilePhoto);

        const postRes = await axios.get('/api/post/getAllPost');
        const postsData = postRes.data.posts;

        const likedStatuses = await Promise.all(
          postsData.map((post: any) =>
            axios.post('/api/post/checkLikedPost', {
              email: userEmail,
              postId: post.postId,
            })
          )
        );

        const savedStatuses = await Promise.all(
          postsData.map((post: any) =>
            axios.post('/api/post/checkSavedPost', {
              email: userEmail,
              postId: post.postId,
            })
          )
        );

        const enrichedPosts = postsData.map((post: any, index: number) => ({
          ...post,
          profilePhoto: post.profilePhoto || '/images/default-profile.png',
          liked: likedStatuses[index]?.data?.liked || false,
          saved: savedStatuses[index]?.data?.saved || false,
        }));

        setPosts(enrichedPosts);
      } catch (err) {
        console.error('Error loading home feed:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserAndPosts();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen w-full">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }
  

  return (
    <div className="flex justify-center w-full">
      <div className="flex w-full max-w-[935px] px-4 pt-6 gap-8 justify-center">
        <div className="w-full max-w-[470px] flex flex-col overflow-auto scrollbar-hide max-h-[95vh]">
          {/* Stories */}
          <div className="mb-4">
            <StorySection
              currentUser={{
                email: email,
                username: username,
                profilePhoto: profilePhoto,
              }}
            />
          </div>

          {/* Posts */}
          {posts.map((post) => (
            <Post
              key={post.postId}
              {...post}
              myEmail={email}
              myUsername={username}
              myProfilePhoto={profilePhoto}
              isLoading={isLoading}
            />
          ))}
        </div>

        {/* Suggested Users */}
        <div className="hidden lg:block w-[320px]">
          <SuggestedUsers />
        </div>
      </div>
    </div>
  );
}
