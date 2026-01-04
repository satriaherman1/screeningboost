import { useState, useEffect, useMemo } from 'react';
import { Search, Briefcase, Calendar, ClipboardList, Settings, CheckCircle2, XCircle, Check, X, FileText, ThumbsUp, ThumbsDown } from 'lucide-react';
import type { Candidate, Job } from '../types';
import CandidateStatusBadge from '../components/CandidateStatusBadge';
import api from '../services/api';
import { downloadBlob } from '../utils/fileHelpers';

type FilterTab = 'all' | 'processing' | 'done' | 'failed' | 'accepted' | 'rejected';

const Results = () => {
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<FilterTab>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedJobId, setSelectedJobId] = useState<string>('');
    const [selectedBatchId, setSelectedBatchId] = useState<string>('');
    const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        loadResults();
    }, [selectedJobId, selectedBatchId, activeTab]);

    const loadData = async () => {
        try {
            const jobsData = await api.getJobs();
            setJobs(jobsData);
        } catch (err) {
            console.error('Error loading jobs:', err);
        }
    };

    const loadResults = async () => {
        try {
            setIsLoading(true);
            const params: any = {};
            if (selectedJobId) params.jobId = selectedJobId;
            if (selectedBatchId) params.batchId = selectedBatchId;
            if (activeTab !== 'all') params.status = activeTab;

            const data = await api.getResults(params);
            setCandidates(data);
        } catch (err) {
            console.error('Error loading results:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownloadCV = async (candidateId: string, fileName: string) => {
        try {
            const blob = await api.downloadCV(candidateId);
            downloadBlob(blob, fileName || 'cv.pdf');
        } catch (err: any) {
            alert('Failed to download CV: ' + (err.message || 'Unknown error'));
        }
    };

    const handleUpdateStatus = async (candidateId: string, status: 'accepted' | 'rejected') => {
        const action = status === 'accepted' ? 'accept' : 'reject';
        const confirmed = window.confirm(`Are you sure you want to ${action} this candidate?`);

        if (!confirmed) return;

        try {
            setIsUpdatingStatus(true);
            await api.updateCandidateStatus(candidateId, status);

            // Refresh the results
            await loadResults();

            // Close modal
            setSelectedCandidate(null);

            alert(`Candidate ${status === 'accepted' ? 'accepted' : 'rejected'} successfully!`);
        } catch (err: any) {
            alert(`Failed to update candidate status: ${err.message || 'Unknown error'}`);
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    // Derived batches based on selected Job
    const availableBatches = useMemo(() => {
        const job = jobs.find(j => j.id === selectedJobId);
        return job ? job.batches : [];
    }, [selectedJobId, jobs]);

    const filteredCandidates = useMemo(() => {
        return candidates.filter(c => {
            const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
            return matchesSearch;
        });
    }, [candidates, searchTerm]);

    // Get job for selected candidate
    const getJobForCandidate = (candidate: Candidate | null): Job | null => {
        if (!candidate || !candidate.batchId) return null;

        for (const job of jobs) {
            const batch = job.batches.find(b => b.id === candidate.batchId);
            if (batch) return job;
        }
        return null;
    };

    const getFilterButtonStyle = (tab: FilterTab) => {
        const isActive = activeTab === tab;
        const baseStyles = "px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all border";

        switch (tab) {
            case 'all':
                return isActive
                    ? `${baseStyles} bg-slate-800 text-white border-slate-800 shadow-md`
                    : `${baseStyles} bg-white text-slate-600 border-slate-200 hover:bg-slate-50`;
            case 'processing':
                return isActive
                    ? `${baseStyles} bg-blue-100 text-blue-700 border-blue-200 shadow-sm`
                    : `${baseStyles} bg-white text-slate-600 border-slate-200 hover:bg-blue-50 hover:text-blue-600`;
            case 'done':
                return isActive
                    ? `${baseStyles} bg-emerald-100 text-emerald-700 border-emerald-200 shadow-sm`
                    : `${baseStyles} bg-white text-slate-600 border-slate-200 hover:bg-emerald-50 hover:text-emerald-600`;
            case 'failed':
                return isActive
                    ? `${baseStyles} bg-rose-100 text-rose-700 border-rose-200 shadow-sm`
                    : `${baseStyles} bg-white text-slate-600 border-slate-200 hover:bg-rose-50 hover:text-rose-600`;
            case 'accepted':
                return isActive
                    ? `${baseStyles} bg-green-100 text-green-700 border-green-200 shadow-sm`
                    : `${baseStyles} bg-white text-slate-600 border-slate-200 hover:bg-green-50 hover:text-green-600`;
            case 'rejected':
                return isActive
                    ? `${baseStyles} bg-red-100 text-red-700 border-red-200 shadow-sm`
                    : `${baseStyles} bg-white text-slate-600 border-slate-200 hover:bg-red-50 hover:text-red-600`;
            default:
                return baseStyles;
        }
    };

    const getFilterIcon = (tab: FilterTab) => {
        switch (tab) {
            case 'all': return <ClipboardList size={16} />;
            case 'processing': return <Settings size={16} />;
            case 'done': return <CheckCircle2 size={16} />;
            case 'failed': return <XCircle size={16} />;
            case 'accepted': return <Check size={16} />;
            case 'rejected': return <X size={16} />;
        }
    };

    const getFilterLabel = (tab: FilterTab) => {
        switch (tab) {
            case 'all': return 'All';
            case 'processing': return 'Processing';
            case 'done': return 'Done';
            case 'failed': return 'Failed';
            case 'accepted': return 'Accepted';
            case 'rejected': return 'Rejected';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Screening Results</h2>
                    <p className="text-slate-500">View and analyze candidate screening results.</p>
                </div>
            </div>

            {/* Job and Batch Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Select Job Position</label>
                    <div className="relative">
                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <select
                            value={selectedJobId}
                            onChange={(e) => {
                                setSelectedJobId(e.target.value);
                                setSelectedBatchId('');
                            }}
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                        >
                            <option value="">All Jobs</option>
                            {jobs.map(job => (
                                <option key={job.id} value={job.id}>{job.title}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Select Batch</label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <select
                            value={selectedBatchId}
                            onChange={(e) => setSelectedBatchId(e.target.value)}
                            disabled={!selectedJobId}
                            className={`w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none ${!selectedJobId ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <option value="">All Batches</option>
                            {availableBatches.map(batch => (
                                <option key={batch.id} value={batch.id}>{batch.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Search and Status Filter */}
            <div className="space-y-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex flex-col gap-4">
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search by name, email, or skills..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                            />
                        </div>

                        <div className="flex flex-wrap gap-3">
                            {(['all', 'processing', 'done', 'failed', 'accepted', 'rejected'] as FilterTab[]).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={getFilterButtonStyle(tab)}
                                >
                                    {getFilterIcon(tab)}
                                    {getFilterLabel(tab)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Results Table */}
            {isLoading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="text-slate-500">Loading results...</div>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Candidate</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Skills</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Score</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredCandidates.map((candidate) => (
                                    <tr key={candidate.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="font-medium text-slate-900">{candidate.name}</div>
                                                <div className="text-sm text-slate-500">{candidate.email}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {candidate.skills.slice(0, 3).map((skill, idx) => (
                                                    <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                                                        {skill}
                                                    </span>
                                                ))}
                                                {candidate.skills.length > 3 && (
                                                    <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded">
                                                        +{candidate.skills.length - 3}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-slate-900">{candidate.score || 0}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <CandidateStatusBadge status={candidate.status} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {candidate.cvFileKey && (
                                                    <button
                                                        onClick={() => handleDownloadCV(candidate.id, candidate.cvFileName || 'cv.pdf')}
                                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                                                    >
                                                        <FileText size={16} />
                                                        Download CV
                                                    </button>
                                                )}
                                                {candidate.summary && (
                                                    <button
                                                        onClick={() => setSelectedCandidate(candidate)}
                                                        className="text-slate-600 hover:text-slate-800 text-sm font-medium"
                                                    >
                                                        View Details
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {filteredCandidates.length === 0 && (
                        <div className="py-16 text-center">
                            <div className="mx-auto w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                                <Search className="text-slate-400" size={24} />
                            </div>
                            <h3 className="text-lg font-medium text-slate-900">No Candidates Found</h3>
                            <p className="text-slate-500 mt-1">Try adjusting your filters or search terms.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Candidate Details Modal */}
            {selectedCandidate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden">
                        {/* Header with Name, Email, and Overall Score - Fixed */}
                        <div className="bg-white border-b border-slate-200 p-8 relative flex-none z-10">
                            <button
                                onClick={() => setSelectedCandidate(null)}
                                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X size={24} />
                            </button>

                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h2 className="text-3xl font-bold text-slate-900">{selectedCandidate.name}</h2>
                                        <CandidateStatusBadge status={selectedCandidate.status} />
                                    </div>
                                    <p className="text-slate-600 text-lg">{selectedCandidate.email}</p>
                                </div>

                                {/* Circular Progress Indicator */}
                                <div className="relative w-28 h-28 flex-shrink-0">
                                    <svg className="w-28 h-28 transform -rotate-90">
                                        <circle
                                            cx="56"
                                            cy="56"
                                            r="50"
                                            stroke="#f1f5f9"
                                            strokeWidth="8"
                                            fill="none"
                                        />
                                        <circle
                                            cx="56"
                                            cy="56"
                                            r="50"
                                            stroke={selectedCandidate.score && selectedCandidate.score >= 70 ? "#22c55e" : selectedCandidate.score && selectedCandidate.score >= 50 ? "#f97316" : "#ef4444"}
                                            strokeWidth="8"
                                            fill="none"
                                            strokeDasharray={`${2 * Math.PI * 50}`}
                                            strokeDashoffset={`${2 * Math.PI * 50 * (1 - (selectedCandidate.score || 0) / 100)}`}
                                            strokeLinecap="round"
                                            className="transition-all duration-1000 ease-out"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-3xl font-bold text-slate-900">{selectedCandidate.score || 0}%</span>
                                        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Match</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {/* Two Column Layout */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
                                {/* Left Column - Contact Information */}
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                        <Briefcase className="text-blue-600" size={20} />
                                        Informasi Kontak
                                    </h3>

                                    <div className="bg-slate-50 rounded-xl p-6 border border-slate-100 space-y-5">
                                        {/* Contact items with better spacing */}
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center flex-shrink-0 shadow-sm text-slate-500">
                                                <div className="font-semibold text-lg">{selectedCandidate.name.charAt(0)}</div>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Full Name</p>
                                                <p className="text-slate-900 font-medium">{selectedCandidate.name}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center flex-shrink-0 shadow-sm text-slate-500">
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Email Address</p>
                                                <p className="text-slate-900 font-medium break-all">{selectedCandidate.email}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center flex-shrink-0 shadow-sm text-slate-500">
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                </svg>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Phone Number</p>
                                                <p className="text-slate-900 font-medium">{selectedCandidate.phone || 'Tidak tersedia'}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                                            <div>
                                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Judul Pekerjaan</p>
                                                <p className="text-slate-900 font-medium">{selectedCandidate.jobTitle || 'Backend Engineer'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Batch</p>
                                                <p className="text-slate-900 font-medium">{selectedCandidate.batch || 'Week 1'}</p>
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Tanggal Pengajuan</p>
                                            <p className="text-slate-900">
                                                {selectedCandidate.submissionDate
                                                    ? new Date(selectedCandidate.submissionDate).toLocaleDateString('id-ID', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })
                                                    : 'December 4th, 2025'
                                                }
                                            </p>
                                        </div>

                                        {/* Download Resume Button */}
                                        {selectedCandidate.cvFileKey && (
                                            <button
                                                onClick={() => handleDownloadCV(selectedCandidate.id, selectedCandidate.cvFileName || 'cv.pdf')}
                                                className="w-full mt-2 px-4 py-3 bg-white border border-slate-300 hover:bg-slate-50 hover:border-slate-400 text-slate-700 rounded-lg font-medium flex items-center justify-center gap-2 transition-all shadow-sm group"
                                            >
                                                <div className="p-1 bg-red-100 rounded text-red-600 group-hover:bg-red-200 transition-colors">
                                                    <FileText size={16} />
                                                </div>
                                                Unduh Resume (PDF)
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Right Column - Evaluation Score */}
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                        <ClipboardList className="text-blue-600" size={20} />
                                        Skor Evaluasi
                                    </h3>

                                    {(() => {
                                        const candidateJob = getJobForCandidate(selectedCandidate);
                                        const assessmentMatrix = candidateJob?.matrix || [];

                                        return assessmentMatrix.length > 0 ? (
                                            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                                <table className="w-full">
                                                    <thead>
                                                        <tr className="bg-slate-50 border-b border-slate-200">
                                                            <th className="px-5 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Kriteria Evaluasi</th>
                                                            <th className="px-5 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Deskripsi</th>
                                                            <th className="px-5 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Skor</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-100 bg-white">
                                                        {assessmentMatrix.map((criteria, idx) => {
                                                            const scoreColor = criteria.weight >= 15
                                                                ? 'text-green-600 bg-green-50'
                                                                : criteria.weight >= 10
                                                                    ? 'text-orange-600 bg-orange-50'
                                                                    : 'text-slate-600 bg-slate-50';

                                                            return (
                                                                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                                                    <td className="px-5 py-4 text-sm font-semibold text-slate-900 align-top w-1/3">{criteria.name}</td>
                                                                    <td className="px-5 py-4 text-sm text-slate-600 align-top">
                                                                        {criteria.name === 'Technical Skills' && 'Relevant technical skills and knowledge required for the role'}
                                                                        {criteria.name === 'Experience' && 'Relevant work experience in similar roles or industries'}
                                                                        {criteria.name === 'Education' && 'Educational background and qualifications'}
                                                                        {criteria.name === 'location' && 'Location matches the job requirements'}
                                                                        {!['Technical Skills', 'Experience', 'Education', 'location'].includes(criteria.name) && 'Assessment criteria for candidate evaluation'}
                                                                    </td>
                                                                    <td className="px-5 py-4 text-sm font-bold text-right align-top">
                                                                        <span className={`inline-block px-2.5 py-1 rounded-md text-xs ${scoreColor}`}>
                                                                            {criteria.weight}%
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <div className="border border-slate-200 rounded-xl p-8 text-center bg-slate-50">
                                                <div className="mx-auto w-12 h-12 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm text-slate-400">
                                                    <ClipboardList size={24} />
                                                </div>
                                                <h4 className="font-medium text-slate-900">No Assessment Criteria</h4>
                                                <p className="text-slate-500 text-sm mt-1">This job doesn't have an assessment matrix defined.</p>
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>

                            {/* Summary Section */}
                            {selectedCandidate.summary && (
                                <div className="px-8 pb-8">
                                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                            <FileText className="text-blue-600" size={20} />
                                            Rangkuman AI
                                        </h3>
                                        <p className="text-slate-700 leading-relaxed whitespace-pre-line text-sm">
                                            {selectedCandidate.summary}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Action Buttons - Sticky Footer */}
                        <div className="bg-white border-t border-slate-200 p-6 flex items-center justify-between flex-none z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                            <div className="text-sm text-slate-500 font-medium">
                                Current Status: <span className="text-slate-900 uppercase">{selectedCandidate.status}</span>
                            </div>

                            {['accepted', 'rejected'].includes(selectedCandidate.status) ? (
                                <div className="text-sm italic text-slate-500">
                                    Cannot change status of {selectedCandidate.status} candidate
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => handleUpdateStatus(selectedCandidate.id, 'rejected')}
                                        disabled={isUpdatingStatus}
                                        className="px-6 py-2.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 hover:shadow-sm rounded-lg font-medium flex items-center gap-2 transition-all"
                                    >
                                        <ThumbsDown size={18} />
                                        {isUpdatingStatus ? 'Processing...' : 'Reject'}
                                    </button>

                                    <button
                                        onClick={() => handleUpdateStatus(selectedCandidate.id, 'accepted')}
                                        disabled={isUpdatingStatus}
                                        className="px-6 py-2.5 bg-green-600 text-white hover:bg-green-700 hover:shadow-md hover:-translate-y-0.5 rounded-lg font-medium flex items-center gap-2 transition-all shadow-sm"
                                    >
                                        <ThumbsUp size={18} />
                                        {isUpdatingStatus ? 'Processing...' : 'Accept Candidate'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Results;
