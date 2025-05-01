import mongoose from "mongoose";


let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,

    };

    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error("MONGODB_URI is not defined in environment variables.");
    }

    cached.promise = mongoose.connect(uri, opts).then((mongoose) => {
      console.log("MongoDB connected");
      return mongoose;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;
