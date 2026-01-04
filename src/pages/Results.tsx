import { useState, useMemo } from 'react';
import { Download, Search, Briefcase, Calendar, ClipboardList, Settings, CheckCircle2, XCircle, Check, X } from 'lucide-react';
import type { Candidate, Cluster, Job } from '../types';
import ClusterCard from '../components/ClusterCard';
import ClusterAnalysisModal from '../components/ClusterAnalysisModal';
import CandidateAnalysisModal from '../components/CandidateAnalysisModal';

// Mock Jobs and Batches for Filters
const MOCK_JOBS_FILTER: Job[] = [
    {
        id: 'j1',
        title: 'Frontend Engineer',
        department: 'Engineering',
        description: '',
        matrix: [],
        clusters: 3,
        requiredSkills: [],
        batches: [
            { id: 'b1', name: 'Week 1 - Oct', jobId: 'j1', status: 'active', candidates: [], createdAt: '' },
            { id: 'b2', name: 'Week 2 - Oct', jobId: 'j1', status: 'archived', candidates: [], createdAt: '' },
        ],
        createdAt: ''
    },
    {
        id: 'j2',
        title: 'Backend Engineer',
        department: 'Engineering',
        description: '',
        matrix: [],
        clusters: 3,
        requiredSkills: [],
        batches: [],
        createdAt: ''
    }
];

// Enhanced Mock Data
const MOCK_CLUSTERS: Cluster[] = [
    {
        id: 'c1',
        name: 'Cluster 1 - Highly Suitable',
        description: 'Strong match',
        jobId: 'j1',
        batchId: 'b1',
        candidates: [
            {
                id: '1', name: 'Muhammad Satria Herman', email: 'muhammadsatriaherman@gmail.com', skills: ['React', 'TS'], status: 'processing', score: 85,
                jobTitle: 'Frontend Engineer', batch: 'Week 1 - Oct', submissionDate: 'December 4th, 2025',
                summary: "CV kandidat telah ditinjau berdasarkan deskripsi pekerjaan...",
                evaluation: [
                    { criteria: 'Technical Skills', description: 'Relevant technical skills...', score: 85 },
                    { criteria: 'Experience', description: 'Relevant work experience...', score: 75 },
                    { criteria: 'Education', description: 'Educational background...', score: 90 },
                    { criteria: 'Location', description: 'Location must be on Jakarta', score: 60 },
                ]
            },
            { id: '2', name: 'Robert Smith', email: 'robert@example.com', skills: ['React', 'JS'], status: 'accepted', score: 92, jobTitle: 'Frontend Engineer', batch: 'Week 1 - Oct' },
        ]
    },
    {
        id: 'c2',
        name: 'Cluster 2 - Potential',
        description: 'Good foundation',
        jobId: 'j1',
        batchId: 'b1',
        candidates: [
            { id: '3', name: 'Carol Williams', email: 'carol@example.com', skills: ['JS', 'HTML'], status: 'rejected', score: 60, jobTitle: 'Frontend Engineer', batch: 'Week 1 - Oct' },
            { id: '4', name: 'David Brown', email: 'david@example.com', skills: ['React'], status: 'done', score: 75, jobTitle: 'Frontend Engineer', batch: 'Week 1 - Oct' },
        ]
    }
];

type FilterTab = 'all' | 'processing' | 'done' | 'failed' | 'accepted' | 'rejected';

const Results = () => {
    const [activeTab, setActiveTab] = useState<FilterTab>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCluster, setSelectedCluster] = useState<Cluster | null>(null);
    const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

    const [selectedJobId, setSelectedJobId] = useState<string>('j1');
    const [selectedBatchId, setSelectedBatchId] = useState<string>('b1');

    // Derived batches based on selected Job
    const availableBatches = useMemo(() => {
        const job = MOCK_JOBS_FILTER.find(j => j.id === selectedJobId);
        return job ? job.batches : [];
    }, [selectedJobId]);

    // Mock Update actions
    const handleAction = (candidateId: string, action: 'accepted' | 'rejected') => {
        console.log(`Candidate ${candidateId} marked as ${action}`);
        alert(`Candidate marked as ${action}`);
        setSelectedCandidate(null);
    };

    const filteredClusters = useMemo(() => {
        return MOCK_CLUSTERS.filter(cluster => {
            // Filter by Job and Batch (Mocking the relation)
            // In real app, cluster.jobId would align with selection
            const matchJob = selectedJobId ? cluster.jobId === selectedJobId : true;
            const matchBatch = selectedBatchId ? cluster.batchId === selectedBatchId : true;
            return matchJob && matchBatch;
        }).map(cluster => ({
            ...cluster,
            candidates: cluster.candidates.filter(c => {
                const matchesTab = activeTab === 'all' || c.status === activeTab;
                const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
                return matchesTab && matchesSearch;
            })
        })).filter(cluster => cluster.candidates.length > 0);
    }, [activeTab, searchTerm, selectedJobId, selectedBatchId]);

    const getFilterButtonStyle = (tab: FilterTab) => {
        const isActive = activeTab === tab;

        const baseStyles = "px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all border";

        switch (tab) {
            case 'all':
                return isActive
                    ? `${baseStyles} bg-slate-800 text-white border-slate-800 shadow-md`
                    : `${baseStyles} bg-white text-slate-600 border-slate-200 hover:bg-slate-50`;
            case 'processing': // Memproses
                return isActive
                    ? `${baseStyles} bg-blue-100 text-blue-700 border-blue-200 shadow-sm`
                    : `${baseStyles} bg-white text-slate-600 border-slate-200 hover:bg-blue-50 hover:text-blue-600`;
            case 'done': // Selesai
                return isActive
                    ? `${baseStyles} bg-emerald-100 text-emerald-700 border-emerald-200 shadow-sm`
                    : `${baseStyles} bg-white text-slate-600 border-slate-200 hover:bg-emerald-50 hover:text-emerald-600`;
            case 'failed': // Gagal
                return isActive
                    ? `${baseStyles} bg-rose-100 text-rose-700 border-rose-200 shadow-sm`
                    : `${baseStyles} bg-white text-slate-600 border-slate-200 hover:bg-rose-50 hover:text-rose-600`;
            case 'accepted': // Diterima
                return isActive
                    ? `${baseStyles} bg-green-100 text-green-700 border-green-200 shadow-sm`
                    : `${baseStyles} bg-white text-slate-600 border-slate-200 hover:bg-green-50 hover:text-green-600`;
            case 'rejected': // Ditolak
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
            case 'all': return 'Semua';
            case 'processing': return 'Memproses';
            case 'done': return 'Selesai';
            case 'failed': return 'Gagal';
            case 'accepted': return 'Diterima';
            case 'rejected': return 'Ditolak';
        }
    };


    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Screening Results</h2>
                    <p className="text-slate-500">Analyze clustering results and individual candidate profiles.</p>
                </div>
                <button className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors">
                    <Download size={18} />
                    Export Report
                </button>
            </div>

            {/* Job and Batch Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Select Job Position</label>
                    <div className="relative">
                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <select
                            value={selectedJobId}
                            onChange={(e) => {
                                setSelectedJobId(e.target.value);
                                setSelectedBatchId(''); // Reset batch
                            }}
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                        >
                            <option value="">All Jobs</option>
                            {MOCK_JOBS_FILTER.map(job => (
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

            {/* Search and Advanced Status Filter */}
            <div className="space-y-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex flex-col gap-4">
                        {/* Search Bar */}
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search candidate using name, skills, or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                            />
                        </div>

                        {/* Status Custom Buttons */}
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

            {/* Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredClusters.map(cluster => (
                    <ClusterCard
                        key={cluster.id}
                        cluster={cluster}
                        onViewAnalysis={() => setSelectedCluster(cluster)}
                        onViewCandidate={(c) => setSelectedCandidate(c)}
                    />
                ))}
                {filteredClusters.length === 0 && (
                    <div className="col-span-full py-16 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
                        <div className="mx-auto w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                            <Search className="text-slate-400" size={24} />
                        </div>
                        <h3 className="text-lg font-medium text-slate-900">No Candidates Found</h3>
                        <p className="text-slate-500 mt-1">Try adjusting your filters or search terms.</p>
                    </div>
                )}
            </div>

            {selectedCluster && (
                <ClusterAnalysisModal
                    cluster={selectedCluster}
                    isOpen={!!selectedCluster}
                    onClose={() => setSelectedCluster(null)}
                />
            )}

            {selectedCandidate && (
                <CandidateAnalysisModal
                    candidate={selectedCandidate}
                    isOpen={!!selectedCandidate}
                    onClose={() => setSelectedCandidate(null)}
                    onAccept={() => handleAction(selectedCandidate.id, 'accepted')}
                    onReject={() => handleAction(selectedCandidate.id, 'rejected')}
                />
            )}
        </div>
    );
};

export default Results;
