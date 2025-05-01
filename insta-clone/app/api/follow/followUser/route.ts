import { NextResponse } from 'next/server';
import dbConnect from '@/libs/database/dbConnect';
import Follow from '@/libs/database/models/follow';
import User from '@/libs/database/models/user';
import Notification from '@/libs/database/models/notification'; // ✅ Import Notification model

export async function POST(req: Request) {
  try {
    const {
      followerEmail,
      followingEmail,
    } = await req.json();

    if (!followerEmail || !followingEmail) {
      return NextResponse.json(
        { message: 'Missing required fields', success: false },
        { status: 400 }
      );
    }

    await dbConnect();

    // Get follower user
    const followerUser = await User.findOne({ email: followerEmail });
    if (!followerUser) {
      return NextResponse.json(
        { message: 'Follower user not found', success: false },
        { status: 404 }
      );
    }

    // Get following user
    const followingUser = await User.findOne({ email: followingEmail });
    if (!followingUser) {
      return NextResponse.json(
        { message: 'Following user not found', success: false },
        { status: 404 }
      );
    }

    // Get or create follow documents
    let followerDoc = await Follow.findOne({ email: followerEmail });
    if (!followerDoc) {
      followerDoc = await Follow.create({
        email: followerEmail,
        following: [],
        followers: [],
      });
    }

    let followingDoc = await Follow.findOne({ email: followingEmail });
    if (!followingDoc) {
      followingDoc = await Follow.create({
        email: followingEmail,
        following: [],
        followers: [],
      });
    }

    // Check if already following
    const alreadyFollowing = followerDoc.following.some(
      (f: any) => f.email === followingEmail
    );
    if (alreadyFollowing) {
      return NextResponse.json(
        { message: 'Already following', success: false },
        { status: 409 }
      );
    }

    // Add to follower's following list
    followerDoc.following.push({
      email: followingEmail,
      username: followingUser.username,
    });

    // Add to following's followers list
    followingDoc.followers.push({
      email: followerEmail,
      username: followerUser.username,
    });

    await followerDoc.save();
    await followingDoc.save();

    // Increment counts in User schema
    await User.updateOne({ email: followerEmail }, { $inc: { following: 1 } });
    await User.updateOne({ email: followingEmail }, { $inc: { followers: 1 } });

    // ✅ Create Follow Notification
    const notificationData = {
      senderEmail: followerEmail,
      senderUsername: followerUser.username,
      senderProfilePhoto: followerUser.profilePhoto, // ✅ Get directly from User schema
      sendTime: new Date(),
      isRead: false,
    };

    let existingNotification = await Notification.findOne({ email: followingEmail });

    if (existingNotification) {
      existingNotification.followNotifications.push(notificationData);
      await existingNotification.save();
    } else {
      const newNotification = new Notification({
        email: followingEmail,
        username: followingUser.username,
        likeNotifications: [],
        commentNotifications: [],
        followNotifications: [notificationData],
      });
      await newNotification.save();
    }

    return NextResponse.json(
      {
        message: 'Followed successfully and notification sent',
        success: true,
        userEmail: followerEmail,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Follow error:', error);
    return NextResponse.json(
      { message: 'Internal server error', success: false },
      { status: 500 }
    );
  }
}
