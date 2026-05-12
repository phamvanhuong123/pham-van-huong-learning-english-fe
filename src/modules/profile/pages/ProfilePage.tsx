import { ProfileContainer } from '../components/ProfileContainer';

export function ProfilePage() {
  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8">
      {/* Breadcrumb giống trong ảnh mẫu */}
      <div className="flex items-center gap-2 mb-8 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span>Tài khoản</span>
        </div>
        <span className="text-muted-foreground">/</span>
        <span className="font-semibold text-foreground">Chung</span>
      </div>

      <ProfileContainer />
    </div>
  );
}

export default ProfilePage;
