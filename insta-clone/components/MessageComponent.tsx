'use client';

import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import dynamic from 'next/dynamic';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import ImagePreview from './ImagePreview';
import MessageInput from './MessageInput';

import { useImageHandler } from '@/hooks/useImageHandler';
import { useEmojiHandler } from '@/hooks/useEmojiHandler';
import { handleSubmitMessage } from '@/hooks/useSendMessage';
import { useGroupMessages } from '@/hooks/useGroupMessages';


const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false });

interface Message {
  senderEmail: string;
  sender: string;
  timeSent?: string;
  message?: string;
  isImage?: boolean;
  imageUrl?: string;
  isPost?: boolean;
  postDetails?: {
    postPhoto: string;
    postTitle: string;
    postCreatorUsername: string;
    postCreatorProfilePhoto: string;
    profilePhoto?:string
    username?:string
  };
}


interface ChatData {
  friendUsername: string;
  friendProfilePhoto?: string;
  friendEmail: string;
  chatId: string;
  messages?: Message[];
  userEmail: string;
  username: string;
  myProfilePhoto:string;
}

interface MessageComponentProps {
  chatData: ChatData;
  onBack: () => void;
}

const socket = io(`${process.env.NEXT_PUBLIC_URL}`);

const MessageComponent: React.FC<MessageComponentProps> = ({ chatData, onBack }) => {
  const [messageInput, setMessageInput] = useState('');
  const [localMessages, setLocalMessages] = useState<Message[]>(chatData.messages || []);
  const {
    selectedImage,
    imagePreview,
    cloudinaryUrl,
    isUploading,
    handleImageSelect,
    handleRemoveImage,
  } = useImageHandler();

  const {
    showEmojiPicker,
    setShowEmojiPicker,
    emojiPickerRef,
    handleEmojiClick,
  } = useEmojiHandler(setMessageInput);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatData.userEmail) {
      socket.emit('join', chatData.userEmail);
    }
    socket.on('messageReceived', (data: any) => {
      if (data.chatId === chatData.chatId) {
        const newMessage: Message = {
          senderEmail: data.senderEmail,
          message: data.message,
          sender: chatData.friendUsername,
          timeSent: data.timeSent,
          isImage: data.isImage,
          imageUrl: data.imageUrl,
          isPost: data.isPost,
          postDetails: data.postDetails,
        };
        setLocalMessages((prev) => [...prev, newMessage]);
      }
    });
    return () => {
      socket.off('messageReceived');
    };
  }, [chatData, socket]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [localMessages]);

  const groupedMessages = useGroupMessages(localMessages);


  return (
    <div className="flex flex-col w-full bg-white text-black h-screen">
      <ChatHeader
        friendProfilePhoto={chatData.friendProfilePhoto}
        friendUsername={chatData.friendUsername}
        onBack={onBack}
      />
  
      <MessageList groupedMessages={groupedMessages} userEmail={chatData.userEmail} scrollRef={scrollRef} />
      <ImagePreview imagePreview={imagePreview} handleRemoveImage={handleRemoveImage} isUploading={isUploading} />
      <form
        onSubmit={(e) =>
          handleSubmitMessage({
            chatData,
            socket,
            localMessagesSetter: setLocalMessages,
            messageInput,
            selectedImage,
            cloudinaryUrl,
            handleRemoveImage,
            setMessageInput,
            setShowEmojiPicker,
          }, e)
        }>
        <MessageInput
          messageInput={messageInput}
          setMessageInput={setMessageInput}
          handleEmojiClick={handleEmojiClick}
          showEmojiPicker={showEmojiPicker}
          setShowEmojiPicker={setShowEmojiPicker}
          emojiPickerRef={emojiPickerRef}
          handleImageSelect={handleImageSelect}
          isUploading={isUploading}
        />
      </form>
    </div>
  );
};

export default MessageComponent;
