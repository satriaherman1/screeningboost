import type { Cluster } from '../types';
import { Users, User } from 'lucide-react';
import CandidateStatusBadge from './CandidateStatusBadge';

interface ClusterCardProps {
    cluster: Cluster;
    onViewAnalysis?: () => void;
    onViewCandidate?: (candidate: any) => void;
}

const ClusterCard = ({ cluster, onViewAnalysis, onViewCandidate }: ClusterCardProps) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-5 border-b border-slate-100 bg-slate-50">
                <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg text-slate-800">{cluster.name}</h3>
                    <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <Users size={14} />
                        {cluster.candidates.length} Candidates
                    </span>
                </div>
                <p className="text-sm text-slate-500 mt-2">{cluster.description}</p>
            </div>

            <div className="p-5">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                    Candidates in this Profile
                </h4>
                <div className="space-y-3">
                    {cluster.candidates.map((candidate) => (
                        <div
                            key={candidate.id}
                            onClick={() => onViewCandidate && onViewCandidate(candidate)}
                            className="flex items-start gap-3 p-3 bg-white border border-slate-100 rounded-lg hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
                        >
                            <div className="bg-slate-100 text-slate-600 p-2 rounded-full mt-0.5">
                                <User size={16} />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <p className="font-medium text-slate-900 text-sm">{candidate.name}</p>
                                    <CandidateStatusBadge status={candidate.status} />
                                </div>

                                {candidate.score !== undefined && (
                                    <div className="flex items-center gap-2 mt-1 mb-2">
                                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-blue-500 rounded-full"
                                                style={{ width: `${candidate.score}%` }}
                                            />
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-500">{candidate.score}%</span>
                                    </div>
                                )}

                                <div className="flex flex-wrap gap-1 mt-1">
                                    {candidate.skills.slice(0, 3).map(skill => (
                                        <span key={skill} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                                            {skill}
                                        </span>
                                    ))}
                                    {candidate.skills.length > 3 && (
                                        <span className="text-[10px] text-slate-400 px-1">
                                            +{candidate.skills.length - 3} more
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    {cluster.candidates.length === 0 && (
                        <p className="text-sm text-slate-400 italic">No candidates assigned to this cluster.</p>
                    )}
                </div>
            </div>

            <div className="bg-slate-50 p-3 border-t border-slate-100 flex justify-center">
                <button
                    onClick={onViewAnalysis}
                    className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1"
                >
                    View Detailed Analysis
                </button>
            </div>
        </div>
    );
};

export default ClusterCard;
