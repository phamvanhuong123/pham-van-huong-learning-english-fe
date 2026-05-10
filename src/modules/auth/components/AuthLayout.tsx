import { Outlet } from 'react-router';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Learning English</h1>
        </div>
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
