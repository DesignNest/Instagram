import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  profilePhoto: {
    type: String,
    required: true,
  },
  friends: [
    {
      friendEmail: {
        type: String,
        required: true,
      },
      friendUsername: {
        type: String,
        required: true,
      },
      friendProfilePhoto: {
        type: String,
        required: true,
      },
      chatId: {
        type: String,
        required: true,
      },
      recentMessage: {
        type: String,
        default: "",
      },
      chats: [
        {
          messageId: {
            type: String,
            required: true,
          },
          senderEmail: {
            type: String,
            required: true,
          },
          receiverEmail: {
            type: String,
            required: true,
          },
          message: {
            type: String,
            required:false
          },
          timeSent: {
            type: Date,
            default: Date.now,
          },
          isImage:{
            type:Boolean,
            required:true
          },
          imageUrl:{
            type:String,
            required:false
          },
          isPost:{
            type:Boolean,
            required:true
          },
          postUrl:{
            type:String,
            required:false
          },
          seen: {
            type: Map,
            of: Date,
            default: {},
          },
        },
      ],
    },
  ],
});

const Chat = mongoose.models.Chat || mongoose.model("Chat", chatSchema);

export default Chat;
