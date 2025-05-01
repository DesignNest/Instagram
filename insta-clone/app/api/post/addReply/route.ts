import { NextResponse } from 'next/server';
import dbConnect from '@/libs/database/dbConnect';
import Post from '@/libs/database/models/post';

export async function POST(req: Request) {
  try {
    const {
      postId,
      commentId,
      senderEmail,
      senderUsername,
      senderProfilePhoto,
      replyText
    } = await req.json();

    // 🔍 Validate input
    if (!postId || !commentId || !senderEmail || !senderUsername || !senderProfilePhoto || !replyText) {
      return NextResponse.json({ message: 'Missing required fields', success: false }, { status: 400 });
    }

    await dbConnect();

    // 🔎 Find post by postId
    const post = await Post.findOne({ postId });
    if (!post) {
      console.log("Post Not Found")
      return NextResponse.json({ message: 'Post not found', success: false }, { status: 404 });
    }

    // 🎯 Find target comment
    const targetComment = post.comments.find((comment: any) => comment.commentId === commentId);
    if (!targetComment) {
      console.log("Comment Not Found")
      return NextResponse.json({ message: 'Comment not found', success: false }, { status: 404 });
    }

    // 📝 Push new reply
    targetComment.replies.push({
      senderEmail,
      senderUsername,
      senderProfilePhoto,
      replyText,
      dateReplied: new Date()
    });

    await post.save({ validateBeforeSave: false }); // ⚡ Skip validation for performance

    return NextResponse.json({ message: 'Reply added successfully', success: true }, { status: 200 });

  } catch (error) {
    console.error('Error adding reply:', error);
    return NextResponse.json({ message: 'Internal server error', success: false }, { status: 500 });
  }
}
