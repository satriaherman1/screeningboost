import type { Cluster } from '../types';
import { X, TrendingUp, Award, BarChart3, AlertCircle } from 'lucide-react';

interface ClusterAnalysisModalProps {
    cluster: Cluster;
    isOpen: boolean;
    onClose: () => void;
}

const ClusterAnalysisModal = ({ cluster, isOpen, onClose }: ClusterAnalysisModalProps) => {
    if (!isOpen) return null;

    // Mock analytics data based on cluster score averages (simulated)
    const avgScore = Math.round(
        cluster.candidates.reduce((acc, c) => acc + (c.score || 0), 0) / (cluster.candidates.length || 1)
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            {cluster.name}
                            <span className="text-sm font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                                Analyzed Profile
                            </span>
                        </h3>
                        <p className="text-slate-500 text-sm mt-1">{cluster.description}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Section 1: Key Metrics */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                            <BarChart3 size={16} /> Key Metrics
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                <p className="text-blue-600 text-xs font-bold uppercase">Avg. Score</p>
                                <p className="text-2xl font-bold text-slate-900 mt-1">{avgScore}%</p>
                            </div>
                            <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                                <p className="text-purple-600 text-xs font-bold uppercase">Candidates</p>
                                <p className="text-2xl font-bold text-slate-900 mt-1">{cluster.candidates.length}</p>
                            </div>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <p className="text-sm font-medium text-slate-700 mb-2">Skill Distribution</p>
                            {/* Mock Skill Distribution */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-xs">
                                    <span className="w-20 text-slate-500">React</span>
                                    <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500 w-[80%]"></div>
                                    </div>
                                    <span className="font-bold text-slate-700">80%</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs">
                                    <span className="w-20 text-slate-500">TypeScript</span>
                                    <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500 w-[65%]"></div>
                                    </div>
                                    <span className="font-bold text-slate-700">65%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Insights */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                            <TrendingUp size={16} /> Recruiter Insights
                        </h4>
                        <div className="space-y-3">
                            <div className="p-3 bg-green-50 border border-green-100 rounded-lg flex gap-3">
                                <Award className="text-green-600 flex-shrink-0" size={20} />
                                <div>
                                    <p className="text-sm font-semibold text-green-800">Top Performer Potential</p>
                                    <p className="text-xs text-green-700 mt-0.5">
                                        Candidates in this cluster show strong alignment with the Job Matrix, particularly in Technical Skills weights.
                                    </p>
                                </div>
                            </div>

                            <div className="p-3 bg-yellow-50 border border-yellow-100 rounded-lg flex gap-3">
                                <AlertCircle className="text-yellow-600 flex-shrink-0" size={20} />
                                <div>
                                    <p className="text-sm font-semibold text-yellow-800">Assessment Note</p>
                                    <p className="text-xs text-yellow-700 mt-0.5">
                                        Review individual portfolio projects as experience weight was high for this job position.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100 mt-4">
                            <p className="text-xs text-slate-400">
                                Generated by Clustering Algorithm (K-Means) based on weighted matrix criteria.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                        Close Analysis
                    </button>
                    <button className="px-4 py-2 bg-blue-600 rounded-lg text-sm font-medium text-white hover:bg-blue-700 transition-colors">
                        Export Analysis PDF
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ClusterAnalysisModal;
