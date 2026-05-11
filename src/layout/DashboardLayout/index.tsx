import { Outlet } from 'react-router';

function DashboardLayout() {
    return (
        <div className="min-h-screen bg-background">
            <Outlet />
        </div>
    );
}
export default DashboardLayout