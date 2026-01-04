import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Briefcase, FileText, LogOut, GraduationCap, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
    const { logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path: string) => location.pathname === path;

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 z-20 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 h-full w-64 bg-slate-900 text-white z-30 transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="flex items-center justify-between p-6 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                        <div className="bg-blue-600 p-1.5 rounded-lg text-white">
                            <GraduationCap size={20} />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold leading-none">ScreeningBoost</h1>
                            <span className="text-[10px] text-slate-400 font-medium tracking-wider">RECRUITER</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <nav className="p-4 space-y-1 mt-4">
                    <Link
                        to="/"
                        onClick={onClose}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive('/')
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                    >
                        <LayoutDashboard size={20} />
                        Dashboard
                    </Link>

                    <Link
                        to="/jobs"
                        onClick={onClose}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive('/jobs') || location.pathname.startsWith('/jobs')
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                    >
                        <Briefcase size={20} />
                        Jobs & Batches
                    </Link>

                    <Link
                        to="/results"
                        onClick={onClose}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive('/results')
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                    >
                        <FileText size={20} />
                        Screening Results
                    </Link>
                </nav>

                <div className="absolute bottom-0 left-0 w-full p-4 border-t border-slate-800">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-red-950/30 hover:text-red-300 transition-colors"
                    >
                        <LogOut size={20} />
                        Sign Out
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
