import { NextResponse } from 'next/server';
import dbConnect from '@/libs/database/dbConnect';
import Post from '@/libs/database/models/post';
import Notification from '@/libs/database/models/notification';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
  try {
    const {
      postId,
      commentTitle,
      commentText,
      senderEmail,
      senderUsername,
      senderProfilePhoto,
    } = await req.json();

    // Validate required fields
    if (
      !postId ||
      !commentTitle ||
      !commentText ||
      !senderEmail ||
      !senderUsername ||
      !senderProfilePhoto
    ) {
      return NextResponse.json(
        { message: 'All fields are required', success: false },
        { status: 400 }
      );
    }

    await dbConnect();

    // ✅ Find the post
    const post = await Post.findOne({ postId });

    if (!post) {
      return NextResponse.json(
        { message: 'Post not found', success: false },
        { status: 404 }
      );
    }

    // ✅ Get post owner's email and username
    const postOwnerEmail = post.email;
    const postOwnerUsername = post.username;

    // ✅ Generate comment object
    const newComment = {
      commentId: uuidv4(),
      commentTitle,
      commentText,
      senderEmail,
      senderUsername,
      senderProfilePhoto,
      dateCommented: new Date(),
      replies: [],
    };

    // ✅ Add comment to post
    const updatedPost = await Post.findOneAndUpdate(
      { postId },
      { $push: { comments: newComment } },
      { new: true }
    );

    // ✅ Create comment notification
    const notificationData = {
      postId,
      commentText,
      senderEmail,
      senderUsername,
      senderProfilePhoto,
      sendTime: new Date(),
      isRead: false,
    };

    // ✅ Find existing Notification document for the post owner
    let existingNotification = await Notification.findOne({ email: postOwnerEmail });

    if (existingNotification) {
      // If exists, push new comment notification
      existingNotification.commentNotifications.push(notificationData);
      await existingNotification.save();
    } else {
      // If not, create a new notification document
      const newNotification = new Notification({
        email: postOwnerEmail,
        username: postOwnerUsername,
        commentNotifications: [notificationData],
        likeNotifications: [],
        followNotifications: [],
      });
      await newNotification.save();
    }

    return NextResponse.json(
      { message: 'Comment added and notification sent successfully', success: true, post: updatedPost },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error adding comment and creating notification:', error);
    return NextResponse.json(
      { message: 'Internal Server Error', success: false },
      { status: 500 }
    );
  }
}
