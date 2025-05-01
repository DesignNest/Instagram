import { NextResponse } from 'next/server';
import dbConnect from '@/libs/database/dbConnect';
import User from '@/libs/database/models/user';
import Post from '@/libs/database/models/post';
import PostInteractions from '@/libs/database/models/postInteractions';
import Follow from '@/libs/database/models/follow';
import Chat from '@/libs/database/models/chat';
import Notification from '@/libs/database/models/notification';
import stories from '@/libs/database/models/stories';
import jwt from 'jsonwebtoken';
import { cloudinary } from '@/libs/cloudinary';

export async function POST(req: Request) {
  try {
    const {
      oldEmail,
      email,
      username,
      fullName,
      description,
      profilePhoto,
    } = await req.json();

    if (!oldEmail || !email || !username || !fullName || !description) {
      return NextResponse.json(
        { message: 'All fields are required', success: false },
        { status: 400 }
      );
    }

    await dbConnect();

    const existingUser = await User.findOne({ email: oldEmail });
    if (!existingUser) {
      return NextResponse.json(
        { message: 'User not found', success: false },
        { status: 404 }
      );
    }

    const [emailExists, usernameExists] = await Promise.all([
      User.findOne({ email, _id: { $ne: existingUser._id } }),
      User.findOne({ username, _id: { $ne: existingUser._id } }),
    ]);

    if (emailExists) {
      return NextResponse.json(
        { message: 'Email already in use', success: false },
        { status: 409 }
      );
    }

    if (usernameExists) {
      return NextResponse.json(
        { message: 'Username already in use', success: false },
        { status: 409 }
      );
    }

    let uploadedPhoto = existingUser.profilePhoto;
    if (profilePhoto && profilePhoto !== existingUser.profilePhoto) {
      const uploadRes = await cloudinary.uploader.upload(profilePhoto, {
        folder: 'user-profiles',
        public_id: `profile_${existingUser._id}`,
        overwrite: true,
        width: 300,
        height: 300,
        crop: 'fill',
        gravity: 'face',
      });
      uploadedPhoto = uploadRes.secure_url;
    }

    Object.assign(existingUser, {
      email,
      username,
      fullName,
      description,
      profilePhoto: uploadedPhoto,
    });

    const credentials = {
      _id: existingUser._id.toString(),
      username: existingUser.username,
      email: existingUser.email,
      fullName: existingUser.fullName,
      profilePhoto: existingUser.profilePhoto,
      followers: existingUser.followers,
      following: existingUser.following,
      description: existingUser.description,
    };

    const token = jwt.sign(credentials, process.env.JWT_SECRET!, {
      expiresIn: '7d',
    });

    existingUser.token = token;
    await existingUser.save();

    // Perform all related updates
    await Promise.all([
      PostInteractions.updateOne(
        { email: oldEmail },
        { $set: { email, username } }
      ),
      Post.updateMany(
        { email: oldEmail },
        { $set: { email, username, profilePhoto: uploadedPhoto } }
      ),
      Post.updateMany(
        { 'comments.senderEmail': oldEmail },
        {
          $set: {
            'comments.$[comment].senderEmail': email,
            'comments.$[comment].senderUsername': username,
            'comments.$[comment].senderProfilePhoto': uploadedPhoto,
          },
        },
        { arrayFilters: [{ 'comment.senderEmail': oldEmail }] }
      ),
      Post.updateMany(
        { 'comments.replies.senderEmail': oldEmail },
        {
          $set: {
            'comments.$[].replies.$[reply].senderEmail': email,
            'comments.$[].replies.$[reply].senderUsername': username,
            'comments.$[].replies.$[reply].senderProfilePhoto': uploadedPhoto,
          },
        },
        { arrayFilters: [{ 'reply.senderEmail': oldEmail }] }
      ),
      Follow.updateMany(
        { 'following.email': oldEmail },
        {
          $set: {
            'following.$[f].email': email,
            'following.$[f].username': username,
          },
        },
        { arrayFilters: [{ 'f.email': oldEmail }] }
      ),
      Follow.updateMany(
        { 'followers.email': oldEmail },
        {
          $set: {
            'followers.$[f].email': email,
            'followers.$[f].username': username,
          },
        },
        { arrayFilters: [{ 'f.email': oldEmail }] }
      ),
      Chat.updateMany(
        { email: oldEmail },
        { $set: { email, username, profilePhoto: uploadedPhoto } }
      ),
      Chat.updateMany(
        { 'friends.friendEmail': oldEmail },
        {
          $set: {
            'friends.$[f].friendEmail': email,
            'friends.$[f].friendUsername': username,
            'friends.$[f].friendProfilePhoto': uploadedPhoto,
          },
        },
        { arrayFilters: [{ 'f.friendEmail': oldEmail }] }
      ),
      Chat.updateMany(
        { 'friends.chats.senderEmail': oldEmail },
        {
          $set: {
            'friends.$[].chats.$[msg].senderEmail': email,
          },
        },
        { arrayFilters: [{ 'msg.senderEmail': oldEmail }] }
      ),
      Chat.updateMany(
        { 'friends.chats.receiverEmail': oldEmail },
        {
          $set: {
            'friends.$[].chats.$[msg].receiverEmail': email,
          },
        },
        { arrayFilters: [{ 'msg.receiverEmail': oldEmail }] }
      ),
      Notification.updateMany(
        { email: oldEmail },
        { $set: { email, username } }
      ),
      Notification.updateMany(
        { 'likeNotifications.senderEmail': oldEmail },
        {
          $set: {
            'likeNotifications.$[n].senderEmail': email,
            'likeNotifications.$[n].senderUsername': username,
            'likeNotifications.$[n].senderProfilePhoto': uploadedPhoto,
          },
        },
        { arrayFilters: [{ 'n.senderEmail': oldEmail }] }
      ),
      Notification.updateMany(
        { 'commentNotifications.senderEmail': oldEmail },
        {
          $set: {
            'commentNotifications.$[n].senderEmail': email,
            'commentNotifications.$[n].senderUsername': username,
            'commentNotifications.$[n].senderProfilePhoto': uploadedPhoto,
          },
        },
        { arrayFilters: [{ 'n.senderEmail': oldEmail }] }
      ),
      Notification.updateMany(
        { 'followNotifications.senderEmail': oldEmail },
        {
          $set: {
            'followNotifications.$[n].senderEmail': email,
            'followNotifications.$[n].senderUsername': username,
            'followNotifications.$[n].senderProfilePhoto': uploadedPhoto,
          },
        },
        { arrayFilters: [{ 'n.senderEmail': oldEmail }] }
      ),
      // ✅ Update Story documents
      stories.updateMany(
        { email: oldEmail },
        {
          $set: {
            email,
            username,
            profilePhoto: uploadedPhoto,
          },
        }
      ),
    ]);

    const response = NextResponse.json(
      { message: 'Profile updated successfully', success: true },
      { status: 200 }
    );

    response.cookies.set('credentials', '', {
      maxAge: 0,
      path: '/',
    });

    response.cookies.set('credentials', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { message: 'Internal Server Error', success: false },
      { status: 500 }
    );
  }
}
