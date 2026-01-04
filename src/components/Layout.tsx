import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';

const Layout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex bg-slate-50 min-h-screen font-sans">
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            <div className="flex-1 flex flex-col lg:ml-64 transition-all duration-300">
                {/* Mobile Header */}
                <header className="bg-white border-b border-slate-200 lg:hidden h-16 flex items-center px-4 sticky top-0 z-10">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 -ml-2 text-slate-600 hover:text-slate-900"
                    >
                        <Menu size={24} />
                    </button>
                    <span className="ml-3 font-semibold text-slate-800">ScreeningBoost</span>
                </header>

                {/* Main Content */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
