import { NextResponse } from 'next/server';
import dbConnect from '@/libs/database/dbConnect';
import Chat from '@/libs/database/models/chat';
import User from '@/libs/database/models/user';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { senderEmail, receiverEmail, message, isImage, imageUrl, isPost, postUrl } = body;

    if (!senderEmail || !receiverEmail || (!message && !isImage && !isPost)) {
      return NextResponse.json({ message: 'Missing required fields', success: false }, { status: 400 });
    }

    // Ensure postUrl is required when isPost is true
    if (isPost && !postUrl) {
      return NextResponse.json({ message: 'Post URL is required', success: false }, { status: 400 });
    }

    await dbConnect();

    const [senderUser, receiverUser] = await Promise.all([ 
      User.findOne({ email: senderEmail }),
      User.findOne({ email: receiverEmail })
    ]);

    if (!senderUser || !receiverUser) {
      return NextResponse.json({ message: 'User not found', success: false }, { status: 404 });
    }

    const messageId = uuidv4();
    const timestamp = new Date();

    const messageObject = {
      messageId,
      senderEmail,
      receiverEmail,
      message: message || '',
      isImage: !!isImage,
      imageUrl: imageUrl || '',
      isPost: !!isPost,
      postUrl: isPost ? postUrl : '', // Only include postUrl if isPost is true
      timeSent: timestamp,
      seen: new Map(),
    };

    let [senderChat, receiverChat] = await Promise.all([ 
      Chat.findOne({ email: senderEmail }),
      Chat.findOne({ email: receiverEmail })
    ]);

    if (!senderChat) {
      senderChat = await Chat.create({
        email: senderEmail,
        username: senderUser.username,
        profilePhoto: senderUser.profilePhoto,
        friends: [],
      });
    }

    if (!receiverChat) {
      receiverChat = await Chat.create({
        email: receiverEmail,
        username: receiverUser.username,
        profilePhoto: receiverUser.profilePhoto,
        friends: [],
      });
    }

    let senderFriend = senderChat.friends.find((f: any) => f.friendEmail === receiverEmail);
    let receiverFriend = receiverChat.friends.find((f: any) => f.friendEmail === senderEmail);

    const chatId = senderFriend?.chatId || receiverFriend?.chatId || uuidv4();

    if (!senderFriend) {
      senderFriend = {
        friendEmail: receiverEmail,
        friendUsername: receiverUser.username,
        friendProfilePhoto: receiverUser.profilePhoto,
        chatId,
        recentMessage: '',
        chats: [],
      };
      senderChat.friends.push(senderFriend);
    }

    if (!receiverFriend) {
      receiverFriend = {
        friendEmail: senderEmail,
        friendUsername: senderUser.username,
        friendProfilePhoto: senderUser.profilePhoto,
        chatId,
        recentMessage: '',
        chats: [],
      };
      receiverChat.friends.push(receiverFriend);
    }

    senderFriend.chats.push(messageObject);
    receiverFriend.chats.push(messageObject);

    // For recentMessage display
    if (isImage) {
      senderFriend.recentMessage = '[Image]';
      receiverFriend.recentMessage = '[Image]';
    } else if (isPost) {
      senderFriend.recentMessage = '[Post]';
      receiverFriend.recentMessage = '[Post]';
    } else {
      senderFriend.recentMessage = message;
      receiverFriend.recentMessage = message;
    }

    await Promise.all([senderChat.save(), receiverChat.save()]);

    return NextResponse.json(
      {
        message: 'Message sent successfully',
        success: true,
        data: {
          messageId,
          timeSent: timestamp,
          ...(isImage && { imageUrl }),
          ...(isPost && { postUrl }),
        },
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Message send error:', error);
    return NextResponse.json({ message: 'Internal server error', success: false }, { status: 500 });
  }
}
