const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
require("dotenv").config()
const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

let onlineUsers = [];
let socketEmailMap = {};

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("join", (email) => {
    console.log(`${email} joined`);
    socket.join(email);
    socketEmailMap[socket.id] = email;

    if (!onlineUsers.includes(email)) {
      onlineUsers.push(email);
    }

    io.emit("onlineUsersList", onlineUsers);
  });

  socket.on("newMessage", async (data) => {
    const {
      chatId,
      senderEmail,
      receiverEmail,
      message,
      isImage,
      imageUrl,
      timeSent,
      isPost,
      postDetails // NEW field
    } = data;
  
    // Send to receiver
    io.to(receiverEmail).emit("messageReceived", {
      chatId,
      senderEmail,
      message,
      isImage,
      imageUrl,
      timeSent,
      isPost,
      postDetails, // include postDetails
    });
  
    // Send to sender for display
    io.to(senderEmail).emit("messageReceivedForDisplay", {
      chatId,
      senderEmail,
      message,
      isImage,
      imageUrl,
      timeSent,
      isPost,
      postDetails, // include postDetails
    });
  
    if (!onlineUsers.includes(receiverEmail)) {
      console.log(`User ${receiverEmail} is offline. Sending push...`);
      // Optional push notification
    }
  
    console.log(`1-to-1: ${senderEmail} -> ${receiverEmail}: ${message} (Image: ${isImage ? "Yes" : "No"}, Post: ${isPost ? "Yes" : "No"})`);
  });
  
  // 📞 Start a call
// ✅ Answer the call
socket.on("answerCall", ({ toEmail, answer }) => {
  const fromEmail = socketEmailMap[socket.id];
  io.to(toEmail).emit("callAnswered", { 
    fromEmail,
    answer, // Ensure that 'answer' is sent here (true/false or WebRTC answer)
  });
  io.to(fromEmail).emit("callAnswered2", { 
    fromEmail,
    answer, // Ensure that 'answer' is sent here (true/false or WebRTC answer)
  });
});

// ❌ End call
socket.on("endCall", ({ toEmail }) => {
  const fromEmail = socketEmailMap[socket.id];
  io.to(toEmail).emit("callEnded", { 
    fromEmail,
  });
});

// 🔁 ICE candidate exchange
socket.on("sendICECandidate", ({ toEmail, candidate }) => {
  const fromEmail = socketEmailMap[socket.id];
  io.to(toEmail).emit("iceCandidate", {
    toEmail:fromEmail,
    candidate,
  });
});

// 📞 Incoming call
socket.on("callUser", ({ fromEmail, toEmail, offer, callType, callerUsername, callerProfilePhoto }) => {
  console.log(`📞 ${fromEmail} is calling ${toEmail}`);
  console.log(offer)
  io.to(toEmail).emit("incomingCall", {
    fromEmail,
    offer,
    callType, 
    callerUsername,
    callerProfilePhoto,
  });
});
socket.on("sendOfferAnswer", ({ toEmail, answer }) => {
  const targetSocketId = users.get(toEmail);
  if (targetSocketId) {
    io.to(targetSocketId).emit("receiveAnswer", { answer });
  } else {
    console.log(`User with email ${toEmail} not found`);
  }
});
  // 🔌 Disconnect
  socket.on("disconnect", () => {
    const email = socketEmailMap[socket.id];

    if (email) {
      onlineUsers = onlineUsers.filter((user) => user !== email);
      delete socketEmailMap[socket.id];
    }

    io.emit("onlineUsersList", onlineUsers);
    console.log("Client disconnected:", socket.id);
  });
});

const HOST = process.env.HOST || '0.0.0.0'
const PORT = process.env.PORT || '4000'
server.listen(PORT,HOST, () => {
  console.log(`✅ Socket.IO server`);
});
