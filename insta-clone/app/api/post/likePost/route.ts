import { NextResponse } from 'next/server';
import dbConnect from '@/libs/database/dbConnect';
import Post from '@/libs/database/models/post';
import PostInteractions from '@/libs/database/models/postInteractions';
import Notification from '@/libs/database/models/notification';
import User from '@/libs/database/models/user'; // ✅ Import User model

export async function POST(req: Request) {
  try {
    const { email, postId } = await req.json();

    if (!email || !postId) {
      return NextResponse.json(
        { message: 'Email and postId are required', success: false },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { message: 'User not found', success: false },
        { status: 404 }
      );
    }

    // Get post
    const post = await Post.findOne({ postId });

    if (!post) {
      return NextResponse.json(
        { message: 'Post not found', success: false },
        { status: 404 }
      );
    }

    // Find or create PostInteractions
    let interaction = await PostInteractions.findOne({ email });

    if (!interaction) {
      interaction = new PostInteractions({
        email,
        username: user.username,
        likedPosts: [],
        savedPosts: [],
      });
    }

    // Check if already liked
    const alreadyLiked = interaction.likedPosts.some(
      (entry: { postId: string }) => entry.postId === postId
    );

    if (alreadyLiked) {
      return NextResponse.json(
        { message: 'Post already liked', success: false },
        { status: 409 }
      );
    }

    // Like the post
    interaction.likedPosts.push({ postId });
    await interaction.save();

    // Increment post's like count
    post.likes += 1;
    await post.save({ validateBeforeSave: false });

    // ✅ Create Like Notification
    const notificationData = {
      postId,
      senderEmail: email,
      senderUsername: user.username,           // ✅ use from User schema
      senderProfilePhoto: user.profilePhoto,    // ✅ use from User schema
      sendTime: new Date(),
      isRead: false,
    };

    const postOwnerEmail = post.email;
    const postOwnerUsername = post.username;

    let existingNotification = await Notification.findOne({ email: postOwnerEmail });

    if (existingNotification) {
      existingNotification.likeNotifications.push(notificationData);
      await existingNotification.save();
    } else {
      const newNotification = new Notification({
        email: postOwnerEmail,
        username: postOwnerUsername,
        likeNotifications: [notificationData],
        commentNotifications: [],
        followNotifications: [],
      });
      await newNotification.save();
    }

    return NextResponse.json(
      { message: 'Post liked and notification sent successfully', success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error liking post and creating notification:', error);
    return NextResponse.json(
      { message: 'Internal server error', success: false },
      { status: 500 }
    );
  }
}
