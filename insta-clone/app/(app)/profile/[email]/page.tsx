import OtherUserProfilePage from '@/components/UserProfileView';
import { notFound } from 'next/navigation';

interface ProfilePageProps {
  params: {
    email?: string;
  };
}

export default async function UserProfilePage({ params }: ProfilePageProps) {
  const email = params?.email;

  if (!email) return notFound();

  return (
    <div className="flex items-start justify-start w-full h-screen">
      <OtherUserProfilePage email={decodeURIComponent(email)} />
    </div>
  );
}
