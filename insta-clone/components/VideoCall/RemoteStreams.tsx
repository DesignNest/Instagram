'use client';

interface RemoteStreamsProps {
  streams: MediaStream[];
}

const RemoteStreams: React.FC<RemoteStreamsProps> = ({ streams }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {streams.map((stream, index) => (
        <video
          key={index}
          className="w-48 h-48 bg-gray-700"
          autoPlay
          playsInline
          ref={(video) => {
            if (video) video.srcObject = stream;
          }}
        />
      ))}
    </div>
  );
};

export default RemoteStreams;
