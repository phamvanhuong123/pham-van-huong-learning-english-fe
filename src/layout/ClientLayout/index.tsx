import { Outlet } from 'react-router';
import { Header } from '@/components/layout/Header';

function ClientLayout() {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />
            <main className="flex-1 overflow-y-auto">
                <div className="container mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
export default ClientLayout