import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  likeNotifications: [
    {
      postId: {
        type: String,
        required: true,
      },
      senderEmail: {
        type: String,
        required: true,
      },
      senderUsername: {
        type: String,
        required: true,
      },
      senderProfilePhoto:{
        type:String,
        required:true
      },action:{
        type:String,
        default:"Liked Your Post"
      },
      sendTime: {
        type: Date,
        default: Date.now,
      },
      isRead: {
        type: Boolean,
        default: false,
      },
    },
  ],
  commentNotifications: [
    {
      postId: {
        type: String,
        required: true,
      },
      commentText: {
        type: String,
        required: true,
      },
      senderEmail: {
        type: String,
        required: true,
      },
      senderUsername: {
        type: String,
        required: true,
      },
      senderProfilePhoto:{
        type:String,
        required:true
      },
      sendTime: {
        type: Date,
        default: Date.now,
      },
      isRead: {
        type: Boolean,
        default: false,
      },
    },
  ],
  followNotifications: [
    {
      senderEmail: {
        type: String,
        required: true,
      },
      senderUsername: {
        type: String,
        required: true,
      },
      senderProfilePhoto:{
        type:String,
        required:true
      },
      sendTime: {
        type: Date,
        default: Date.now,
      },
      action:{
        type:String,
        default:"Followed You"
      },
      isRead: {
        type: Boolean,
        default: false,
      },
    },
  ],
});

export default mongoose.models.Notification || mongoose.model("Notification", notificationSchema);
