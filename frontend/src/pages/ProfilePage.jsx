import { useParams } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { ProfilePlatform, ProfileBanner, ProfileContest, ProfileSubmission } from '../components/profile';

export function ProfilePage() {
  const { username } = useParams();

  return (
    <>
      <Header />
      <div className="">
        <ProfileBanner username={username} />
        <div className="gap-2 flex">
          <div className="flex flex-col gap-2 w-full">
            <ProfilePlatform username={username} />
            <ProfileSubmission username={username} />
          </div>
          <div className="flex flex-col w-full">
            <ProfileContest username={username} />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
