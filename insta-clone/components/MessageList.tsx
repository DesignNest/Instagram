'use client';
import Image from 'next/image';

interface PostDetails {
  postPhoto: string;
  postTitle: string;
  postCreatorUsername: string;
  postCreatorProfilePhoto: string;
  profilePhoto?: string;
  username?: string;
}

interface Message {
  senderEmail: string;
  sender: string;
  timeSent?: string;
  message?: string;
  isImage?: boolean;
  imageUrl?: string;
  isPost?: boolean;
  postDetails?: PostDetails;
}

interface MessageListProps {
  groupedMessages: { [dateLabel: string]: Message[] };
  userEmail: string;
  scrollRef: React.RefObject<HTMLDivElement>;
}

const MessageList: React.FC<MessageListProps> = ({ groupedMessages, userEmail, scrollRef }) => {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 pb-24 space-y-4 bg-white scrollbar-hidden">
      {Object.entries(groupedMessages).map(([dateLabel, messages], i) => (
        <div key={i}>
          <div className="text-center text-sm text-gray-400 mb-4 mt-2">{dateLabel}</div>
          {messages.map((msg, idx) => {
            const isMe = msg.senderEmail === userEmail;
            return (
              <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} mb-3`}>
                {msg.isImage && msg.imageUrl && (
                  <div className="max-w-[80%] md:max-w-[60%] lg:max-w-[50%]">
                    <Image
                      src={msg.imageUrl}
                      alt="sent image"
                      width={300}
                      height={300}
                      className="rounded-2xl object-cover mb-1"
                    />
                  </div>
                )}
                {msg.isPost && msg.postDetails && (
                  <div className={`rounded-2xl shadow-md p-2 mb-2 max-w-[80%] md:max-w-[60%] lg:max-w-[50%] 
                    ${isMe ? 'ml-auto bg-gray-100' : 'mr-auto bg-white'}`}>
                    <div className="flex items-center mb-2">
                      <img
                        src={msg.postDetails.postCreatorProfilePhoto || msg.postDetails.profilePhoto}
                        alt="creator"
                        className="w-8 h-8 rounded-full mr-2 object-cover"
                      />
                      <span className="font-semibold text-sm">{msg.postDetails.postCreatorUsername || msg.postDetails.username}</span>
                    </div>
                    <div className="w-full h-auto mb-2">
                      <img
                        src={msg.postDetails.postPhoto}
                        alt="post"
                        className="rounded-lg object-cover w-full max-h-[400px]"
                      />
                    </div>
                    <div className="px-2 text-sm">
                      <span className="font-semibold mr-2">{msg.postDetails.postCreatorUsername}</span>
                      {msg.postDetails.postTitle}
                    </div>
                  </div>
                )}
                {msg.message && (
                  <div
                    className={`px-4 py-2 rounded-3xl text-sm break-words shadow-sm 
                      ${isMe ? 'bg-blue-500 text-white' : 'bg-gray-100 text-black'}
                      max-w-[80%] md:max-w-[60%] lg:max-w-[50%]
                    `}>
                    {!msg.message.startsWith("[Image]") && msg.message}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
      <div ref={scrollRef}></div>
    </div>
  );
};

export default MessageList;
