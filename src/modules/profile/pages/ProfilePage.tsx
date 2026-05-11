import { ProfileContainer } from '../components/ProfileContainer';

export function ProfilePage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Hồ sơ cá nhân</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Quản lý thông tin cá nhân và mục tiêu học tập
        </p>
      </div>
      <ProfileContainer />
    </div>
  );
}

export default ProfilePage;
