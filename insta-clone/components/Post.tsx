'use client';

import Image from 'next/image';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import CommentDialog from './commentsDialog';
import Link from 'next/link';
import ShareDialog from './ShareDialog';
import StorySection from './Story';

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

interface PostProps {
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
  myEmail: string | null;
  myUsername: string | null;
  myProfilePhoto: string | null;
  isLoading: boolean;
}

const Post: React.FC<PostProps> = ({
  postId,
  email,
  username,
  profilePhoto,
  postTitle,
  postPhoto,
  likes,
  dateUploaded,
  comments,
  liked,
  saved,
  myEmail,
  myUsername,
  myProfilePhoto,
  isLoading
}) => {
  const [likeCount, setLikeCount] = useState(likes);
  const [isLiked, setIsLiked] = useState(liked);
  const [isSaved, setIsSaved] = useState(saved);
  const [commentInput, setCommentInput] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [postComments, setPostComments] = useState<Comment[]>(comments);
  const [isAnimating, setIsAnimating] = useState(false);
  const [messages,setMessages] = useState([]);
  const [isSharing,setIsSharing] = useState(false);
  
  const toggleLike = async () => {
    setIsAnimating(true);
    try {
      setIsLiked((prev) => !prev);
      setLikeCount((prev) => prev + (isLiked ? -1 : 1));
      const url = isLiked ? '/api/post/unlikePost' : '/api/post/likePost';
      await axios.post(url, {
        postId,
        email: myEmail,
      });
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    const fetchChats = async () => {
    try {
      const res = await axios.post('/api/chat/getChat', {email:myEmail});

        if (res.data.success) {
          setMessages(res.data.data);
        
        } else {
          console.error('Error fetching chats:', res.data.message);
        }
    } catch (error) {
      console.error('Error:', error);
    }}

    fetchChats()
  
   
  }, [myEmail])

  const toggleSave = async () => {
    try {
      const url = isSaved ? '/api/post/unsavePost' : '/api/post/savePost';
      setIsSaved((prev) => !prev);
      await axios.post(url, {
        postId,
        email: myEmail,
        username: myUsername
      });
      
    } catch (error) {
      console.error('Error saving/unsaving post:', error);
    }
  };

  const handleCommentPost = async () => {
    if (!commentInput.trim() || !myEmail || !myUsername || !myProfilePhoto) return;

    try {
      const response = await axios.post('/api/post/addComment', {
        postId,
        commentTitle: 'Comment',
        commentText: commentInput,
        senderEmail: myEmail,
        senderUsername: myUsername,
        senderProfilePhoto: myProfilePhoto,
      });

      setPostComments((prev) => [...prev, response.data.newComment]);
      setCommentInput('');
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen w-full">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }
  return (
    <div className="w-full max-w-[470px] mx-auto mb-6 bg-white pb-4 border-b border-gray-200 rounded-sm sm:rounded-none">
  

      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <Image
            src={profilePhoto || '/images/default-profile.png'}
            alt="profile"
            width={24}
            height={24}
            className="rounded-full object-cover"
          />
          {email == myEmail ?
          <span className="text-sm font-medium text-black">{username}</span>
:    <Link href={`/profile/${email}`}  className="text-sm font-medium text-black">{username}</Link>}
        </div>
        <MoreHorizontal className="w-5 h-5 text-black cursor-pointer" />
      </div>

      <div className="relative w-full aspect-square bg-black">
        <Image src={postPhoto} alt={postTitle} fill className="object-cover" />
      </div>

      <div className="flex justify-between items-center px-4 pt-3">
        <div className="flex gap-4">
          <Heart
            onClick={toggleLike}
            className={`w-6 h-6 cursor-pointer transition-colors duration-150 ${
              isLiked ? 'text-red-500 fill-red-500' : 'text-black fill-transparent'
            }`}
          />
          <MessageCircle
            className="w-6 h-6 cursor-pointer"
            onClick={() => setShowComments(true)}
          />
          <Send className="w-6 h-6 cursor-pointer" onClick={()=>{isSharing ? setIsSharing(false) : setIsSharing(true)}}/>
        </div>
        <Bookmark
          onClick={toggleSave}
          className={`w-6 h-6 cursor-pointer transition-colors duration-150 ${
            isSaved ? 'text-black fill-black' : 'text-black fill-transparent'
          }`}
        />
      </div>

      <div className="px-4 pt-2 text-sm font-semibold text-black">
        {likeCount.toLocaleString()} likes
      </div>

      <div className="px-4 pt-1 text-sm text-black">
        <span className="font-semibold mr-1">{username}</span>
        {postTitle}
      </div>

      {postComments.length > 0 && (
        <div
          className="px-4 pt-1 text-sm text-neutral-500 cursor-pointer"
          onClick={() => setShowComments(true)}
        >
          View all {postComments.length} comments
        </div>
      )}

      <div className="px-4 pt-1 text-[11px] text-neutral-400 uppercase tracking-wide">
        {new Date(dateUploaded).toLocaleDateString()}
      </div>

      <div className="flex items-center px-4 py-3">
        <input
          type="text"
          placeholder="Add a comment..."
          value={commentInput}
          onChange={(e) => setCommentInput(e.target.value)}
          className="flex-1 text-sm outline-none placeholder:text-gray-500 bg-transparent"
        />
        <button
          className={`text-sm font-semibold text-[#0095f6] ${
            !commentInput.trim() ? 'opacity-30 cursor-default' : ''
          }`}
          onClick={handleCommentPost}
          disabled={!commentInput.trim()}
        >
          Post
        </button>
      </div>
      {isSharing &&(
          <ShareDialog
          messages={messages}
          onClose={()=>setIsSharing(false)}
          postDetails={{
            postPhoto,
            postTitle,
            username,
            profilePhoto,
            postId
          }}
          email={myEmail}
          
          />
      )}
      {showComments && myEmail && myUsername && (
        <CommentDialog
          comments={postComments}
          postOwnerUsername={username}
          myProfilePhoto={myProfilePhoto || '/images/default-profile.png'}
          onClose={() => setShowComments(false)}
          myEmail={myEmail}
          myUsername={myUsername}
          postId={postId}
        />
      )}
    </div>
  );
};

export default Post;
