import { useNavigate } from 'react-router-dom';
import { Briefcase, Users, Activity, ExternalLink } from 'lucide-react';

const Dashboard = () => {
    const navigate = useNavigate();

    // Mock stats
    const stats = [
        { label: 'Active Jobs', value: '3', icon: <Briefcase size={24} className="text-blue-600" />, color: 'bg-blue-100' },
        { label: 'Total Candidates', value: '128', icon: <Users size={24} className="text-purple-600" />, color: 'bg-purple-100' },
        { label: 'Screening Batches', value: '12', icon: <Activity size={24} className="text-green-600" />, color: 'bg-green-100' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Dashboard Overview</h2>
                <p className="text-slate-500">Welcome back, Recruiter.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
                        <div className={`p-4 rounded-xl ${stat.color}`}>
                            {stat.icon}
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-bold text-lg text-slate-800">Recent Activity</h3>
                    <button
                        onClick={() => navigate('/jobs')}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                    >
                        View All Jobs <ExternalLink size={14} />
                    </button>
                </div>
                <div className="divide-y divide-slate-100">
                    {[1, 2, 3].map((item) => (
                        <div key={item} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                                <div>
                                    <p className="text-sm font-medium text-slate-800">New batch "Week 4" created</p>
                                    <p className="text-xs text-slate-500">Frontend Engineer • 2 hours ago</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
