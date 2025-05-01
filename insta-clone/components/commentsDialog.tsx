'use client';

import { useState } from 'react';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import Image from 'next/image';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

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

interface CommentDialogProps {
  comments: Comment[];
  onClose: () => void;
  postOwnerUsername: string;
  myEmail: string;
  myUsername: string;
  myProfilePhoto: string;
  postId: string;
}
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
const CommentDialog: React.FC<CommentDialogProps> = ({
  comments,
  onClose,
  postOwnerUsername,
  myEmail,
  myUsername,
  myProfilePhoto,
  postId,
}) => {
  const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({});
  const [newComment, setNewComment] = useState('');
  const [isReply, setIsReply] = useState(false);
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [localComments, setLocalComments] = useState<Comment[]>(comments);

  const toggleReplies = (commentId: string) => {
    setExpandedReplies((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  const handleReplyClick = (commentId: string, username: string) => {
    console.log(commentId)

    setActiveReplyId(commentId);
    setNewComment(`@${username} `);
    setIsReply(true);
  };

  const handlePost = async () => {
    if (!newComment.trim()) return;

    const date = new Date().toLocaleString();

    if (isReply) {
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
          senderEmail: newReply.senderEmail,
          senderUsername: newReply.senderUsername,
          senderProfilePhoto: newReply.senderProfilePhoto,
        });

        setLocalComments((prev) =>
          prev.map((comment) =>
            comment.commentId === activeReplyId
              ? { ...comment, replies: [...comment.replies, newReply] }
              : comment
          )
        );

        setExpandedReplies((prev) => ({
          ...prev,
          [activeReplyId as string]: true,
        }));
        window.location.reload()
      } catch (error) {
        console.error('Failed to post reply:', error);
      }
    } else {
      const newCommentObj: Comment = {
        commentId: uuidv4(),
        commentTitle: 'Comment',
        commentText: newComment.trim(),
        senderEmail: myEmail,
        senderUsername: myUsername,
        senderProfilePhoto: myProfilePhoto,
        dateCommented: date,
        replies: [],
      };

      try {
        await axios.post('/api/post/addComment', {
          postId,
          ...newCommentObj,
        });

        setLocalComments((prev) => [...prev, newCommentObj]);
        window.location.reload()
      } catch (error) {
        console.error('Failed to post comment:', error);
      }
    }

    setNewComment('');
    setIsReply(false);
    setActiveReplyId(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white w-[500px] h-[600px] rounded-xl shadow-md border border-neutral-200 relative flex flex-col">
        <button onClick={onClose} className="absolute top-3 right-3 z-10">
          <X className="w-5 h-5 text-black" />
        </button>

        <div className="font-semibold text-center py-2 border-b border-gray-200 text-black">
          Comments
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-5 scrollbar-hidden">
          {localComments.length === 0 ? (
            <p className="text-sm text-gray-500 text-center">No comments yet.</p>
          ) : (
            localComments.map((comment) => (

              <div key={comment.commentId} className="text-sm text-black">
                
                <div className="flex items-center gap-2">
                  <Image
                    src={comment.senderProfilePhoto || '/images/default-profile.png'}
                    alt="profile"
                    width={32}
                    height={32}
                    className="rounded-full object-cover"
                  />
                  <div>
                    <span className="font-semibold mr-1">{comment.senderUsername}</span>
                    
                    {comment.commentText}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500 mt-1 ml-10">
                  <span>{formatInstagramTime(comment.dateCommented)} </span>
       
                  <button
                    className="font-semibold"
                    onClick={() => handleReplyClick(comment.commentId, comment.senderUsername)}
                  >
                    Reply
                  </button>
                </div>

                {comment.replies.length > 0 && (
                  <button
                    onClick={() => toggleReplies(comment.commentId)}
                    className="ml-10 text-sm text-gray-500 mt-1 flex items-center gap-1"
                  >
                    {expandedReplies[comment.commentId] ? (
                      <>
                        <ChevronUp className="w-4 h-4" /> Hide replies
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4" /> View all {comment.replies.length} replies
                      </>
                    )}
                  </button>
                )}

                {expandedReplies[comment.commentId] && (
                  <div className="ml-10 mt-2 space-y-2">
                    {comment.replies.map((reply, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <Image
                          src={reply.senderProfilePhoto || '/images/default-profile.png'}
                          alt="profile"
                          width={28}
                          height={28}
                          className="rounded-full object-cover"
                        />
                        <div>
                          <span className="font-semibold mr-1">{reply.senderUsername}</span>
                          {reply.replyText}
                          <div className="text-xs text-gray-500 mt-1 flex gap-2">
                            <span>{formatInstagramTime(reply.dateReplied)}</span>
                       
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-200 flex items-center gap-2 px-4 py-3">
          <Image
            src={myProfilePhoto || '/images/default-profile.png'}
            alt="profile"
            width={28}
            height={28}
            className="rounded-full object-cover"
          />
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 text-sm bg-transparent outline-none placeholder:text-gray-500"
          />
          <button
            onClick={handlePost}
            className={`text-sm font-semibold text-[#0095f6] ${
              !newComment.trim() ? 'opacity-30 cursor-default' : ''
            }`}
            disabled={!newComment.trim()}
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommentDialog;
