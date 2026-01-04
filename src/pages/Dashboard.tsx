import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Users, Activity, ExternalLink } from 'lucide-react';
import api from '../services/api';
import type { Job } from '../types';

const Dashboard = () => {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const data = await api.getJobs();
            setJobs(data);
        } catch (err) {
            console.error('Error loading dashboard data:', err);
        } finally {
            setIsLoading(false);
        }
    };

    // Calculate stats from real data
    const totalCandidates = jobs.reduce((sum, job) =>
        sum + job.batches.reduce((batchSum, batch) =>
            batchSum + (batch.candidates?.length || 0), 0
        ), 0
    );

    const totalBatches = jobs.reduce((sum, job) => sum + job.batches.length, 0);

    const stats = [
        { label: 'Active Jobs', value: jobs.length.toString(), icon: <Briefcase size={24} className="text-blue-600" />, color: 'bg-blue-100' },
        { label: 'Total Candidates', value: totalCandidates.toString(), icon: <Users size={24} className="text-purple-600" />, color: 'bg-purple-100' },
        { label: 'Screening Batches', value: totalBatches.toString(), icon: <Activity size={24} className="text-green-600" />, color: 'bg-green-100' },
    ];

    // Get recent batches for activity feed
    const recentBatches = jobs
        .flatMap(job => job.batches.map(batch => ({ ...batch, jobTitle: job.title })))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-slate-500">Loading dashboard...</div>
            </div>
        );
    }

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
                    {recentBatches.length > 0 ? (
                        recentBatches.map((batch) => (
                            <div key={batch.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`h-2 w-2 rounded-full ${batch.status === 'active' ? 'bg-blue-500' : 'bg-slate-400'}`}></div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-800">Batch "{batch.name}" created</p>
                                        <p className="text-xs text-slate-500">
                                            {batch.jobTitle} • {new Date(batch.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <span className="text-xs text-slate-500">
                                    {batch.candidates?.length || 0} candidates
                                </span>
                            </div>
                        ))
                    ) : (
                        <div className="p-8 text-center text-slate-400">
                            No recent activity. Create a job to get started!
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
