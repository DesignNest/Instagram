'use client';

interface LocalStreamProps {
  stream: MediaStream | null;
}

const LocalStream: React.FC<LocalStreamProps> = ({ stream }) => {
  if (!stream) return null;

  return (
    <video
      className="w-48 h-48 bg-black"
      autoPlay
      muted
      playsInline
      ref={(video) => {
        if (video) video.srcObject = stream;
      }}
    />
  );
};

export default LocalStream;
