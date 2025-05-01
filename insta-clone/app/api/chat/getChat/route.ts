import { NextResponse } from 'next/server';
import dbConnect from '@/libs/database/dbConnect';
import Follow from '@/libs/database/models/follow';
import Chat from '@/libs/database/models/chat';
import User from '@/libs/database/models/user';
import Post from '@/libs/database/models/post';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: 'Email is required', success: false }, { status: 400 });
    }

    await dbConnect();

    const userFollowDoc = await Follow.findOne({ email });
    if (!userFollowDoc) {
      return NextResponse.json({ message: 'User not found in Follow schema', success: false }, { status: 404 });
    }

    const currentUser = await User.findOne({ email });
    if (!currentUser) {
      return NextResponse.json({ message: 'User profile not found', success: false }, { status: 404 });
    }

    let userChatDoc = await Chat.findOne({ email });
    if (!userChatDoc) {
      userChatDoc = await Chat.create({
        email,
        username: currentUser.username,
        profilePhoto: currentUser.profilePhoto,
        friends: [],
      });
    }

    for (const followed of userFollowDoc.following) {
      const otherEmail = followed.email;

      const otherFollowDoc = await Follow.findOne({ email: otherEmail });
      const mutualFollow = otherFollowDoc?.followers?.some((f: any) => f.email === email);

      if (!mutualFollow) continue;

      const otherUser = await User.findOne({ email: otherEmail });
      if (!otherUser) continue;

      let otherUserChatDoc = await Chat.findOne({ email: otherEmail });
      if (!otherUserChatDoc) {
        otherUserChatDoc = await Chat.create({
          email: otherEmail,
          username: otherUser.username,
          profilePhoto: otherUser.profilePhoto,
          friends: [],
        });
      }

      const userHasFriend = userChatDoc.friends.some((f: any) => f.friendEmail === otherEmail);
      const otherUserHasFriend = otherUserChatDoc.friends.some((f: any) => f.friendEmail === email);

      if (!userHasFriend && !otherUserHasFriend) {
        const chatId = uuidv4();

        userChatDoc.friends.push({
          friendEmail: otherEmail,
          friendUsername: otherUser.username,
          friendProfilePhoto: otherUser.profilePhoto,
          chatId,
          recentMessage: "",
          chats: [],
        });

        otherUserChatDoc.friends.push({
          friendEmail: email,
          friendUsername: currentUser.username,
          friendProfilePhoto: currentUser.profilePhoto,
          chatId,
          recentMessage: "",
          chats: [],
        });

        await userChatDoc.save();
        await otherUserChatDoc.save();
      }
    }

    // Process friends and check for posts inside chats
    const finalChats = await Promise.all(
      userChatDoc.friends.map(async (friend: any) => {
        // Process each chat individually
        const chatsWithPostData = await Promise.all(
          friend.chats.map(async (chat: any) => {
            if (chat.isPost && chat.postUrl) {
              const post = await Post.findOne({ postId: chat.postUrl });

              if (post) {
                return {
                  ...chat.toObject(),
                  postDetails: {
                    postPhoto: post.postPhoto,
                    postTitle: post.postTitle,
                    postCreatorUsername: post.username,
                    postCreatorProfilePhoto: post.profilePhoto,
                  },
                };
              }
            }
            return chat;
          })
        );

        return {
          chatId: friend.chatId,
          userEmail: email,
          otherUserEmail: friend.friendEmail,
          recentMessage: friend.recentMessage,
          chats: chatsWithPostData,
          friendUsername: friend.friendUsername,
          friendProfilePhoto: friend.friendProfilePhoto,
        };
      })
    );

    return NextResponse.json(
      { message: 'Chats fetched successfully', success: true, data: finalChats },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching chats:', error);
    return NextResponse.json(
      { message: 'Internal server error', success: false },
      { status: 500 }
    );
  }
}
