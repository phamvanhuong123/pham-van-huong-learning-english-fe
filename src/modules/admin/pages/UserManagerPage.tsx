import { UserManagerContainer } from '../components/UserManagerContainer';

export default function UserManagerPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Quản lý người dùng</h1>
        <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
          Tra cứu, phân quyền và khóa tài khoản người dùng trên hệ thống.
        </p>
      </div>

      <UserManagerContainer />
    </div>
  );
}

