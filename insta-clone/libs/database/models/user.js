import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  fullName: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true,
    default: "No Description Added"
  },
  profilePhoto: {
    type: String,
    required: true,
    default: "https://i.imgur.com/HeIi0wU.png"
  },
  token: {
    type: String,
    required: false
  },
  followers: {
    type: Number,
    required: true,
    default: 0
  },
  following: {
    type: Number,
    required: true,
    default: 0
  },
  dateCreated: {
    type: Date,
    required: true,
    default: Date.now
  }
}, { timestamps: true });

export default mongoose.models.User || mongoose.model("User", UserSchema);
