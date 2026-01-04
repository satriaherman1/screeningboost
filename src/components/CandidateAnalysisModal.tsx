import type { Candidate } from '../types';
import { X, Download, User, CheckCircle, XCircle, Mail, Phone, MapPin, Calendar, Briefcase, Linkedin, Globe } from 'lucide-react';
import CandidateStatusBadge from './CandidateStatusBadge';

interface CandidateAnalysisModalProps {
    candidate: Candidate;
    isOpen: boolean;
    onClose: () => void;
    onAccept: (id: string) => void;
    onReject: (id: string) => void;
}

const CandidateAnalysisModal = ({ candidate, isOpen, onClose, onAccept, onReject }: CandidateAnalysisModalProps) => {
    if (!isOpen) return null;

    // Mock evaluation data if not present
    const evaluationData = candidate.evaluation || [
        { criteria: 'Technical Skills', description: 'Relevant technical skills and knowledge required for the role', score: candidate.score || 85 },
        { criteria: 'Experience', description: 'Relevant work experience in similar roles or industries', score: 75 },
        { criteria: 'Education', description: 'Educational background and qualifications', score: 80 },
        { criteria: 'Location', description: 'Location must be in Jakarta', score: 0 },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
            <div className="bg-slate-50 rounded-2xl shadow-2xl w-full max-w-5xl my-8 animate-in slide-in-from-bottom-4 duration-300">

                {/* Header Section */}
                <div className="relative bg-white p-6 md:p-8 rounded-t-2xl border-b border-slate-200">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                    >
                        <X size={24} />
                    </button>

                    <div className="flex flex-col md:flex-row gap-6 md:items-start">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h2 className="text-3xl font-bold text-slate-900">{candidate.name}</h2>
                                <CandidateStatusBadge status={candidate.status} />
                            </div>
                            <div className="flex flex-wrap gap-4 text-slate-500 text-sm mb-4">
                                <span className="flex items-center gap-1.5"><Mail size={16} /> {candidate.email}</span>
                                <span className="flex items-center gap-1.5"><Phone size={16} /> {candidate.phone || '+62 812-3456-7890'}</span>
                                <span className="flex items-center gap-1.5"><MapPin size={16} /> Jakarta, Indonesia</span>
                            </div>

                            <div className="flex gap-3">
                                <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:border-blue-300 hover:text-blue-600 transition-colors flex items-center gap-2">
                                    <Linkedin size={16} /> LinkedIn Profile
                                </button>
                                <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:border-blue-300 hover:text-blue-600 transition-colors flex items-center gap-2">
                                    <Globe size={16} /> Portfolio Website
                                </button>
                            </div>
                        </div>

                        {/* Overall Score Circle */}
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-4 min-w-[200px]">
                            <div className="relative h-16 w-16 flex-shrink-0 flex items-center justify-center">
                                <svg className="h-full w-full transform -rotate-90">
                                    <circle cx="32" cy="32" r="28" stroke="#e2e8f0" strokeWidth="6" fill="none" />
                                    <circle
                                        cx="32" cy="32" r="28"
                                        stroke={candidate.score && candidate.score >= 80 ? '#22c55e' : candidate.score && candidate.score >= 60 ? '#eab308' : '#ef4444'}
                                        strokeWidth="6" fill="none"
                                        strokeDasharray="175"
                                        strokeDashoffset={175 - (175 * (candidate.score || 0)) / 100}
                                        className="transition-all duration-1000 ease-out"
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <span className="absolute text-sm font-bold text-slate-900">{candidate.score}%</span>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-800">Match Score</p>
                                <p className="text-xs text-slate-500">Overall fit for Job Matrix</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Application Details & Actions */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Briefcase size={16} /> Application Details
                            </h3>
                            <div className="space-y-4 text-sm">
                                <div className="flex justify-between py-2 border-b border-slate-50">
                                    <span className="text-slate-500">Job Title</span>
                                    <span className="font-medium text-slate-900">{candidate.jobTitle || 'Backend Engineer'}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-slate-50">
                                    <span className="text-slate-500">Batch</span>
                                    <span className="font-medium text-slate-900">{candidate.batch || 'Week 1'}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-slate-50">
                                    <span className="text-slate-500">Applied Date</span>
                                    <span className="font-medium text-slate-900">{candidate.submissionDate || 'N/A'}</span>
                                </div>
                            </div>

                            <div className="mt-6">
                                <button className="w-full flex items-center justify-center gap-2 bg-blue-50 text-blue-700 hover:bg-blue-100 py-3 rounded-lg font-bold transition-colors">
                                    <Download size={18} /> Download CV / Resume
                                </button>
                            </div>
                        </div>

                        {/* Decisions */}
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => onAccept(candidate.id)}
                                className="bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold shadow-sm flex items-center justify-center gap-2 transition-all hover:shadow-md hover:-translate-y-0.5"
                            >
                                <CheckCircle size={18} /> Accept
                            </button>
                            <button
                                onClick={() => onReject(candidate.id)}
                                className="bg-white border border-red-200 text-red-600 hover:bg-red-50 py-3 rounded-lg font-bold shadow-sm flex items-center justify-center gap-2 transition-all hover:shadow-md hover:-translate-y-0.5"
                            >
                                <XCircle size={18} /> Reject
                            </button>
                        </div>
                    </div>

                    {/* Right Column: Evaluation & Summary */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Score Table */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                                <h3 className="font-bold text-lg text-slate-800">Evaluation Criteria Breakdown</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-white text-slate-500 border-b border-slate-200">
                                        <tr>
                                            <th className="px-6 py-3 font-semibold w-1/4">Criteria</th>
                                            <th className="px-6 py-3 font-semibold w-1/2">Key Observations</th>
                                            <th className="px-6 py-3 font-semibold text-right w-1/4">Score</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {evaluationData.map((item, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4 font-medium text-slate-800">{item.criteria}</td>
                                                <td className="px-6 py-4 text-slate-600 text-xs leading-relaxed">{item.description}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className={`inline-block px-2 py-1 rounded-md text-xs font-bold ${item.score >= 80 ? 'bg-green-100 text-green-700' :
                                                            item.score >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                                                        }`}>
                                                        {item.score}%
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* AI Summary */}
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
                            <h3 className="font-bold text-lg text-blue-900 mb-3 flex items-center gap-2">
                                ✨ AI Executive Summary
                            </h3>
                            <div className="prose prose-sm text-slate-700 max-w-none text-justify">
                                <p>
                                    {candidate.summary ||
                                        "CV kandidat telah ditinjau berdasarkan deskripsi pekerjaan dan preferensi HRD yang diberikan. Kandidat memiliki pengalaman yang relevan dengan spesifikasi yang dibutuhkan, khususnya dalam pengembangan web modern. Keterampilan teknis kandidat cukup kuat, namun ada beberapa area yang mungkin perlu diverifikasi lebih lanjut saat wawancara, seperti kedalaman pemahaman pada arsitektur sistem skala besar. Secara keseluruhan, kandidat menunjukkan potensi yang baik untuk posisi ini."}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CandidateAnalysisModal;
