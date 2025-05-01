'use client';

import { useEffect, useState, useRef } from 'react';
import { ZegoClient } from 'zego-express-engine-webrtc';
import LocalStream from './LocalStream';
import RemoteStreams from './RemoteStreams';

interface VideoCallProps {
  roomId: string;
  userID: string;
  userName: string;
  onLeave: () => void;
}

const appID = process.env.NEXT_PUBLIC_ZEGOCLOUD_APP_ID; // replace
const server = 'wss://webliveroom2131388307-api.coolzcloud.com/ws'

const VideoCall: React.FC<VideoCallProps> = ({ roomId, userID, userName, onLeave }) => {
  const [client, setClient] = useState<any>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<MediaStream[]>([]);

  const clientRef = useRef<any>(null);

  useEffect(() => {
    const initClient = async () => {
      const zg = new ZegoClient(appID, server);
      clientRef.current = zg;

      zg.on('stream-added', (stream: any) => {
        setRemoteStreams((prev) => [...prev, stream]);
      });

      zg.on('stream-removed', (stream: any) => {
        setRemoteStreams((prev) => prev.filter((s) => s !== stream));
      });

      await zg.loginRoom(roomId, userID, userName);

      const local = await zg.createStream();
      setLocalStream(local);
      zg.publishStream(local);
    };

    initClient();

    return () => {
      if (clientRef.current) {
        clientRef.current.logoutRoom(roomId);
        clientRef.current = null;
      }
    };
  }, [roomId, userID, userName]);

  const leaveCall = () => {
    if (clientRef.current && localStream) {
      clientRef.current.stopPublishingStream(localStream);
      clientRef.current.destroyStream(localStream);
      onLeave();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="flex gap-2">
        <LocalStream stream={localStream} />
        <RemoteStreams streams={remoteStreams} />
      </div>
      <button
        onClick={leaveCall}
        className="bg-red-500 text-white px-4 py-2 rounded mt-4"
      >
        Leave Call
      </button>
    </div>
  );
};

export default VideoCall;
