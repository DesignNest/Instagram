import { NextResponse } from 'next/server';
import dbConnect from '@/libs/database/dbConnect';
import Notification from '@/libs/database/models/notification';

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
      console.log("No Notification Found for marking as read");
      return NextResponse.json(
        { message: 'No notifications found', success: false },
        { status: 404 }
      );
    }

    // 1. Mark all notifications as read
    notificationDoc.likeNotifications.forEach((notif: any) => {
      notif.isRead = true;
    });
    notificationDoc.commentNotifications.forEach((notif: any) => {
      notif.isRead = true;
    });
    notificationDoc.followNotifications.forEach((notif: any) => {
      notif.isRead = true;
    });

  
    notificationDoc.likeNotifications = notificationDoc.likeNotifications.filter((notif: any) => !notif.isRead);
    notificationDoc.commentNotifications = notificationDoc.commentNotifications.filter((notif: any) => !notif.isRead);
    notificationDoc.followNotifications = notificationDoc.followNotifications.filter((notif: any) => !notif.isRead);

    // Save the updated document
    await notificationDoc.save();

    return NextResponse.json(
      { message: 'All notifications marked as read and removed', success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    return NextResponse.json(
      { message: 'Internal server error', success: false },
      { status: 500 }
    );
  }
}
