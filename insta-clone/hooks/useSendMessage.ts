import axios from 'axios';
import { Socket } from 'socket.io-client';

interface SendMessageParams {
  chatData: any;
  socket: Socket;
  localMessagesSetter: React.Dispatch<React.SetStateAction<Message[]>>;
  messageInput: string;
  selectedImage: File | null;
  cloudinaryUrl: string | null;
  handleRemoveImage: () => void;
  setMessageInput: React.Dispatch<React.SetStateAction<string>>;
  setShowEmojiPicker: React.Dispatch<React.SetStateAction<boolean>>;
}

export async function handleSubmitMessage({
  chatData,
  socket,
  localMessagesSetter,
  messageInput,
  selectedImage,
  cloudinaryUrl,
  handleRemoveImage,
  setMessageInput,
  setShowEmojiPicker,
}: SendMessageParams, e: React.FormEvent) {
  e.preventDefault();
  if (!messageInput.trim() && !selectedImage) return;

  const now = new Date().toISOString();
  const isImage = !!selectedImage && !!cloudinaryUrl;
  const imageUrl = isImage ? cloudinaryUrl : '';

  const newMessage: Message = {
    senderEmail: chatData.userEmail,
    message: messageInput || '',
    sender: 'me',
    timeSent: now,
    isImage,
    imageUrl,
    isPost: false,
    postDetails: undefined,
  };

  localMessagesSetter((prev) => [...prev, newMessage]);

  try {
    await axios.post('/api/chat/sendMessage', {
      senderEmail: chatData.userEmail,
      receiverEmail: chatData.friendEmail,
      message: messageInput || '',
      chatId: chatData.chatId,
      isImage,
      imageUrl,
      isPost: false,
      postDetails: undefined,
    });
  } catch (err) {
    console.error('Error sending message:', err);
  }

  socket.emit('newMessage', {
    chatId: chatData.chatId,
    senderEmail: chatData.userEmail,
    receiverEmail: chatData.friendEmail,
    message: messageInput || '[Image]',
    isImage,
    imageUrl,
    timeSent: now,
    isPost: false,
    postDetails: undefined,
    senderUsername: chatData.username,
  });

  setMessageInput('');
  setShowEmojiPicker(false);
  handleRemoveImage();
}
