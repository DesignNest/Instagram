import mongoose from "mongoose";
import { v4 } from "uuid";
const ReplySchema = new mongoose.Schema({
    senderEmail: {
        type: String,
        required: true
    },
    senderUsername: {
        type: String,
        required: true
    },
    senderProfilePhoto: {
        type: String,
        required: true
    },
    replyText: {
        type: String,
        required: true
    },
    dateReplied: {
        type: Date,
        default: Date.now
    }
}, { _id: false });

const CommentSchema = new mongoose.Schema({
    commentTitle: {
        type: String,
        required: true,
    },
    commentId:{
        type:String,
        required:true,
    },
    commentText: {
        type: String,
        required: true
    },
    senderEmail: {
        type: String,
        required: true
    },
    senderUsername: {
        type: String,
        required: true
    },
    senderProfilePhoto: {
        type: String,
        required: true
    },
    dateCommented: {
        type: Date,
        default: Date.now
    },
    replies: [ReplySchema]
}, { _id: false });

const PostSchema = new mongoose.Schema({
    postId: {
        type: String,
        required: true,

    },
    email: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    postTitle: {
        type: String,
        required: true
    },
    postPhoto: {
        type: String,
        required: true
    },
    likes: {
        type: Number,
        required: true,
        default: 0
    },
    profilePhoto:{
        type:String,
        required:true
    },
    dateUploaded: {
        type: Date,
        required: true,
        default: Date.now
    },
    comments: [CommentSchema]
});

export default mongoose.models.Post || mongoose.model("Post", PostSchema);

