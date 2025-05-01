import { NextResponse } from 'next/server';
import dbConnect from '@/libs/database/dbConnect';
import Notification from '@/libs/database/models/notification';
import Post from '@/libs/database/models/post';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { message: 'Email is required', success: false },
        { status: 400 }
      );
    }

    await dbConnect();

    const notificationDoc = await Notification.findOne({ email });

    if (!notificationDoc) {
      console.log("No Notification Found");
      return NextResponse.json(
        { 
          message: 'No notifications found',
          notification: false,
          success: true,
          notifications: { likeNotifications: [], commentNotifications: [], followNotifications: [] } 
        },
        { status: 200 }
      );
    }

    // Fetch post images for each like notification
    const likeNotificationsWithPhotos = await Promise.all(
      notificationDoc.likeNotifications.map(async (like: { postId: any; toObject: () => any; }) => {
        try {
          const post = await Post.findOne({ postId: like.postId });
          return {
            ...like.toObject(),
            postPhoto: post?.postPhoto || null, // Add postPhoto if found
          };
        } catch (error) {
          console.error('Error fetching post for like notification:', error);
          return {
            ...like.toObject(),
            postPhoto: null, // fallback if error occurs
          };
        }
      })
    );
    console.log(notificationDoc)
    return NextResponse.json(
      {
        message: 'Notifications fetched successfully',
        success: true,
        notification: true,
        notifications: {
          likeNotifications: likeNotificationsWithPhotos,
          commentNotifications: notificationDoc.commentNotifications || [],
          followNotifications: notificationDoc.followNotifications || [],
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { message: 'Internal server error', success: false },
      { status: 500 }
    );
  }
}
