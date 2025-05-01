'use client';

import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { Heart, MessageCircle, Send, X, ChevronDown, ChevronUp } from 'lucide-react';
import axios from 'axios';

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

interface PostDialogProps {
  post: {
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
  };
  myEmail: string;
  myUsername: string;
  myProfilePhoto: string;
  onClose: () => void;
  onLikeUpdate?: (postId: string, liked: boolean) => void;
}

const PostDialog = ({
  post,
  myEmail,
  myUsername,
  myProfilePhoto,
  onClose,
  onLikeUpdate,
}: PostDialogProps) => {
  const {
    postId,
    username,
    profilePhoto,
    postPhoto,
    likes,
    dateUploaded,
    comments: initialComments,
    liked: initialLiked,
  } = post;

  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [liked, setLiked] = useState<boolean>(initialLiked);
  const [likeCount, setLikeCount] = useState<number>(likes);
  const [newComment, setNewComment] = useState<string>('');
  const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({});
  const [isReply, setIsReply] = useState(false);
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const toggleLike = async () => {
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount((prev) => (newLiked ? prev + 1 : prev - 1));

    try {
      await axios.post(newLiked ? '/api/post/likePost' : '/api/post/unlikePost', {
        postId,
        email: myEmail,
      });
      onLikeUpdate?.(postId, newLiked);
    } catch (err) {
      console.error('Failed to toggle like', err);
    }
  };

  const handleAddCommentOrReply = async () => {
    if (!newComment.trim()) return;
    const date = new Date().toLocaleString();

    if (isReply && activeReplyId) {
      const replyText = newComment.trim().replace(/^@\S+\s*/, '');
      if (!replyText) return;

      const newReply: Reply = {
        senderEmail: myEmail,
        senderUsername: myUsername,
        senderProfilePhoto: myProfilePhoto,
        replyText,
        dateReplied: date,
      };

      try {
        await axios.post('/api/post/addReply', {
          postId,
          commentId: activeReplyId,
          replyText: newReply.replyText,
          senderEmail: myEmail,
          senderUsername: myUsername,
          senderProfilePhoto: myProfilePhoto,
        });

        setComments((prev) =>
          prev.map((comment) =>
            comment.commentId === activeReplyId
              ? { ...comment, replies: [...comment.replies, newReply] }
              : comment
          )
        );

        setExpandedReplies((prev) => ({
          ...prev,
          [activeReplyId]: true,
        }));
      } catch (err) {
        console.error('Failed to add reply', err);
      }
    } else {
      try {
        const res = await axios.post('/api/post/addComment', {
          postId,
          commentText: newComment,
          senderEmail: myEmail,
        });
        setComments((prev) => [...prev, res.data.comment]);
      } catch (err) {
        console.error('Failed to add comment', err);
      }
    }

    setNewComment('');
    setIsReply(false);
    setActiveReplyId(null);
  };

  const toggleReplies = (commentId: string) => {
    setExpandedReplies((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  const handleReplyClick = (commentId: string, username: string) => {
    setNewComment(`@${username} `);
    setIsReply(true);
    setActiveReplyId(commentId);
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center"
      ref={overlayRef}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="bg-white w-[900px] h-[580px] rounded-lg overflow-hidden shadow-2xl flex">
        <button onClick={onClose} className="absolute top-4 right-4 z-10">
          <X className="w-6 h-6 text-white" />
        </button>

        {/* Image Side */}
        <div className="relative w-1/2 h-full">
          <Image src={postPhoto} alt="Post" fill className="object-cover" />
        </div>

        {/* Right Side */}
        <div className="w-1/2 flex flex-col text-sm font-sans">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b">
            <Image
              src={profilePhoto}
              alt="Profile"
              width={32}
              height={32}
              className="rounded-full"
            />
            <span className="font-semibold text-[14px]">{username}</span>
          </div>

          {/* Comments Section */}
          <div className="flex-1 px-4 py-2 overflow-y-auto">
            {comments.map((comment) => (
              <div key={comment.commentId} className="mb-3">
                <div className="flex items-start gap-2">
                  <Image
                    src={comment.senderProfilePhoto}
                    alt=""
                    width={28}
                    height={28}
                    className="rounded-full"
                  />
                  <div>
                    <p>
                      <span className="font-semibold mr-2">{comment.senderUsername}</span>
                      {comment.commentText}
                    </p>
                    <div className="flex gap-3 text-xs text-gray-400 mt-1">
                      <span>{comment.dateCommented}</span>
                      <button
                        className="font-medium"
                        onClick={() => handleReplyClick(comment.commentId, comment.senderUsername)}
                      >
                        Reply
                      </button>
                    </div>

                    {comment.replies.length > 0 && (
                      <button
                        onClick={() => toggleReplies(comment.commentId)}
                        className="text-xs text-blue-500 mt-1"
                      >
                        {expandedReplies[comment.commentId] ? 'Hide replies' : `View ${comment.replies.length} replies`}
                      </button>
                    )}

                    {expandedReplies[comment.commentId] && (
                      <div className="mt-2 space-y-2">
                        {comment.replies.map((reply, index) => (
                          <div key={index} className="pl-4 text-xs">
                            <span className="font-semibold mr-1">{reply.senderUsername}</span>
                            {reply.replyText}
                            <div className="text-[10px] text-gray-400">{reply.dateReplied}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t">
            <div className="flex items-center gap-4 mb-2">
              <Heart
                onClick={toggleLike}
                className={`w-5 h-5 cursor-pointer transition-colors duration-200 ${
                  liked ? 'text-red-500 fill-red-500' : 'text-black'
                }`}
              />
              <MessageCircle className="w-5 h-5 text-black" />
            </div>
            <p className="text-sm font-semibold mb-1">{likeCount} likes</p>
            <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">{dateUploaded}</p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 text-sm border border-gray-300 rounded-full px-4 py-1 outline-none"
              />
              <Send
                className="w-4 h-4 cursor-pointer text-blue-500"
                onClick={handleAddCommentOrReply}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDialog;
