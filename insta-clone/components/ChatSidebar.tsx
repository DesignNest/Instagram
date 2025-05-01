import { useState, useEffect } from 'react';
import { Edit, Loader2, Image as ImageIcon } from 'lucide-react'; // Import Image icon from lucide-react
import Image from 'next/image';
import axios from 'axios';
import io from 'socket.io-client';

interface ChatSidebarProps {
  onSelectChat: (chat: any) => void;
}

const socket = io('http://192.168.29.121:4000');

const ChatSidebar = ({ onSelectChat }: ChatSidebarProps) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [myEmail, setMyEmail] = useState('');
  const [myUsername, setMyUsername] = useState('');
  const [myProfilePhoto, setMyProfilePhoto] = useState('');

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const tokenRes = await axios.get('/api/authenticate/token');
        const email = tokenRes.data.token?.email;
        const username = tokenRes.data.token?.username;
        const profilePhoto = tokenRes.data.token?.profilePhoto;
        if (!email) return;
        setMyUsername(username);
        setMyEmail(email);
        setMyProfilePhoto(profilePhoto);
        const res = await axios.post('/api/chat/getChat', { email });

        if (res.data.success) {
          setMessages(res.data.data);
          console.log(res.data.data);
        } else {
          console.error('Error fetching chats:', res.data.message);
        }
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, []);

  useEffect(() => {
    if (!myEmail) return;
    socket.emit('join', myEmail);

    socket.on('messageReceivedForDisplay', (data) => {
      const { chatId, message } = data;

      setMessages((prevMessages) =>
        prevMessages.map((chat) =>
          chat.chatId === chatId
            ? { ...chat, recentMessage: message }
            : chat
        )
      );
    });

    socket.on('messageReceived', (data) => {
      const { chatId, message } = data;

      setMessages((prevMessages) =>
        prevMessages.map((chat) =>
          chat.chatId === chatId
            ? { ...chat, recentMessage: message }
            : chat
        )
      );
    });

    return () => {
      socket.off('messageReceivedForDisplay');
    };
  }, [myEmail]);

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center py-20 md:w-[400px] border-r border-gray-300 h-screen">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-white text-black flex flex-col border-r border-gray-300">
      <div className="px-4 py-10 flex items-center justify-between">
        <h2 className="text-xl font-semibold">{myUsername}</h2>
        <Edit className="w-6 h-6 cursor-pointer" />
      </div>

      <div className="pl-6 px-4 flex justify-between items-center mt-2">
        <p className="text-lg font-semibold">Messages</p>
        <button className="text-sm text-blue-500 hover:underline">Requests</button>
      </div>

      <div className="overflow-y-auto flex-1 px-4 mt-4 space-y-4 py-4">
        {messages.length > 0 ? (
          messages.map((chat, idx) => (
            <div
              key={idx}
              className="flex items-center space-x-4 hover:bg-gray-100 p-2 rounded-lg cursor-pointer"
              onClick={() =>
                onSelectChat({
                  friendUsername: chat.friendUsername,
                  friendEmail: chat.otherUserEmail,
                  friendProfilePhoto: chat.friendProfilePhoto,
                  chatId: chat.chatId,
                  messages: chat.chats || [],
                  userEmail: myEmail,
                  username: myUsername,
                  myProfilePhoto: myProfilePhoto,
                })
              }
            >
              {chat.friendProfilePhoto ? (
                <Image
                  src={chat.friendProfilePhoto}
                  alt={chat.friendUsername}
                  width={44}
                  height={44}
                  className="rounded-full"
                  unoptimized
                />
              ) : (
                <div className="w-11 h-11 rounded-full bg-gray-300 flex items-center justify-center text-white text-sm">
                  {chat.friendUsername?.[0]?.toUpperCase() || "?"}
                </div>
              )}
              <div>
                <p className="font-semibold text-sm">{chat.friendUsername}</p>
                <p className="text-gray-500 text-xs">
                  {chat.recentMessage?.startsWith("[Image]") ? (
                    <span className="flex items-center space-x-1">
                      <ImageIcon className="w-4 h-4 text-gray-500" />
                      <span>Image</span>
                    </span>
                  ) : chat.recentMessage?.startsWith("[Post]") ? (
                    <span className="flex items-center space-x-1">
                      <ImageIcon className="w-4 h-4 text-gray-500" />
                      <span>Post</span>
                    </span>
                  ) : (
                    chat.recentMessage || "No messages yet"
                  )}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p>No messages</p>
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;
