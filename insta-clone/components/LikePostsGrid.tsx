'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import axios from 'axios';
import { Heart, MessageCircle, Loader2 } from 'lucide-react';
import PostDialog from './PostDialog';

interface Post {
  postId: string;
  postPhoto: string;
  likes: number;
  comments: any[];
  liked: boolean;
  email: string;
  username: string;
  profilePhoto: string;
  postTitle: string;
  dateUploaded: string;
}

interface LikedPostsGridProps {
  email: string;
  myEmail: string;
  myUsername: string;
  myProfilePhoto: string;
}

const LikedPostsGrid = ({
  email,
  myEmail,
  myUsername,
  myProfilePhoto,
}: LikedPostsGridProps) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  useEffect(() => {
    const fetchLikedPosts = async () => {
      try {
        const res = await axios.post('/api/post/getLikedPosts', {
          email: myEmail, // Only use the viewer's email
        });

        setPosts(res.data.posts || []);
      } catch (err) {
        console.error('Error fetching liked posts', err);
      } finally {
        setLoading(false);
      }
    };

    if (myEmail) {
      fetchLikedPosts();
    }
  }, [myEmail]);

  const updatePostLikeStatus = (postId: string, liked: boolean) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.postId === postId
          ? { ...post, liked, likes: liked ? post.likes + 1 : post.likes - 1 }
          : post
      )
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="animate-spin w-6 h-6 text-gray-400" />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center text-sm text-gray-500 py-10">
        No liked posts yet.
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-3 sm:grid-cols-3 gap-1 md:gap-6">
        {posts.map((post) => (
          <div
            key={post.postId}
            className="relative group aspect-square bg-gray-200 overflow-hidden cursor-pointer"
            onClick={() => setSelectedPostId(post.postId)}
          >
            <Image
              src={post.postPhoto}
              alt="Post"
              fill
              className="object-cover group-hover:opacity-90 transition duration-200"
            />

            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition duration-200">
              <div className="text-white text-sm font-semibold flex gap-6">
                <div className="flex items-center gap-1 px-3 py-1.5 rounded">
                  <Heart className="w-5 h-5 text-white fill-white" />
                  <span className="text-white text-base">{post.likes}</span>
                </div>
                <div className="flex items-center gap-1 px-3 py-1.5 rounded">
                  <MessageCircle className="w-5 h-5 text-white fill-white" />
                  <span className="text-white text-base">{post.comments.length}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedPostId && (
        <PostDialog
          post={posts.find((p) => p.postId === selectedPostId)!}
          myEmail={myEmail}
          myUsername={myUsername}
          myProfilePhoto={myProfilePhoto}
          onClose={() => setSelectedPostId(null)}
          onLikeUpdate={updatePostLikeStatus}
        />
      )}
    </>
  );
};

export default LikedPostsGrid;
