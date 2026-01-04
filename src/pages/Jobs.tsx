import { useState, useEffect } from 'react';
import { Plus, Briefcase, Calendar, UploadCloud, X } from 'lucide-react';
import type { Job, AssessmentMatrix } from '../types';
import AssessmentMatrixInput from '../components/AssessmentMatrixInput';
import SkillSelector from '../components/SkillSelector';
import FileUpload from '../components/FileUpload';
import api from '../services/api';
import { extractTextFromPDF, fileToBase64 } from '../utils/fileHelpers';

const DEFAULT_MATRIX: AssessmentMatrix = [
    { id: 'def-1', name: 'Technical Skills', weight: 40 },
    { id: 'def-2', name: 'Education', weight: 20 },
    { id: 'def-3', name: 'Experience', weight: 40 }
];

const Jobs = () => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreatingJob, setIsCreatingJob] = useState(false);
    const [newJob, setNewJob] = useState<Partial<Job>>({
        title: '',
        department: '',
        description: '',
        matrix: DEFAULT_MATRIX,
        clusters: 3,
        requiredSkills: []
    });

    const [uploadModal, setUploadModal] = useState<{ isOpen: boolean; batchId: string; jobId: string } | null>(null);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch jobs on mount
    useEffect(() => {
        loadJobs();
    }, []);

    const loadJobs = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await api.getJobs();
            setJobs(data);
        } catch (err: any) {
            setError(err.message || 'Failed to load jobs');
            console.error('Error loading jobs:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateJob = async () => {
        if (!newJob.title || !newJob.matrix) return;

        // Validate matrix
        const totalWeight = newJob.matrix.reduce((sum, item) => sum + item.weight, 0);
        if (totalWeight !== 100) {
            alert('Assessment Matrix must total 100%');
            return;
        }

        try {
            setError(null);
            const createdJob = await api.createJob({
                title: newJob.title,
                department: newJob.department || 'Engineering',
                description: newJob.description || '',
                matrix: newJob.matrix,
                clusters: newJob.clusters || 3,
                requiredSkills: newJob.requiredSkills || []
            });

            // Add to local state
            setJobs([createdJob, ...jobs]);
            setIsCreatingJob(false);
            setNewJob({
                title: '',
                department: '',
                description: '',
                matrix: DEFAULT_MATRIX,
                clusters: 3,
                requiredSkills: []
            });
        } catch (err: any) {
            setError(err.message || 'Failed to create job');
            alert('Failed to create job: ' + (err.message || 'Unknown error'));
        }
    };

    const handleAddBatch = async (jobId: string) => {
        const batchName = prompt('Enter Batch Name (e.g., Week 3):');
        if (!batchName) return;

        try {
            setError(null);
            const createdBatch = await api.createBatch(jobId, { name: batchName });

            // Update local state
            setJobs(jobs.map(job => {
                if (job.id === jobId) {
                    return {
                        ...job,
                        batches: [...job.batches, createdBatch]
                    };
                }
                return job;
            }));
        } catch (err: any) {
            setError(err.message || 'Failed to create batch');
            alert('Failed to create batch: ' + (err.message || 'Unknown error'));
        }
    };

    const [processingStatus, setProcessingStatus] = useState<string | null>(null);

    const handleUploadFiles = async () => {
        if (!uploadModal || selectedFiles.length === 0) return;

        setIsProcessing(true);
        setError(null);

        let successCount = 0;
        let failCount = 0;
        const totalFiles = selectedFiles.length;

        try {
            // Process files sequentially (Chunk of 1)
            for (let i = 0; i < totalFiles; i++) {
                const file = selectedFiles[i];
                setProcessingStatus(`Uploading ${i + 1} of ${totalFiles}: ${file.name}...`);

                try {
                    const base64 = await fileToBase64(file);
                    const text = await extractTextFromPDF(file);
                    const name = file.name.replace('.pdf', '').replace(/_/g, ' ');

                    const candidatePayload = {
                        name,
                        cvText: text,
                        cvFile: base64,
                        cvFileName: file.name
                    };

                    // Upload single candidate (or small batch)
                    const uploadedCandidates = await api.uploadCandidates(uploadModal.batchId, { candidates: [candidatePayload] });

                    // Update local state immediately for better UX
                    setJobs(prevJobs => prevJobs.map(job => {
                        if (job.id === uploadModal.jobId) {
                            return {
                                ...job,
                                batches: job.batches?.map(batch => {
                                    if (batch.id === uploadModal.batchId) {
                                        return {
                                            ...batch,
                                            candidates: [...batch.candidates, ...uploadedCandidates]
                                        };
                                    }
                                    return batch;
                                })
                            };
                        }
                        return job;
                    }));

                    successCount++;
                } catch (err) {
                    console.error(`Failed to upload ${file.name}:`, err);
                    failCount++;
                }
            }

            setUploadModal(null);
            setSelectedFiles([]);
            alert(`Upload Complete!\nSuccess: ${successCount}\nFailed: ${failCount}`);
        } catch (err: any) {
            setError(err.message || 'Failed to upload CVs');
            alert('Critical error during upload: ' + (err.message || 'Unknown error'));
        } finally {
            setIsProcessing(false);
            setProcessingStatus(null);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-slate-500">Loading jobs...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Recruitment Jobs</h2>
                    <p className="text-slate-500">Manage positions and screening batches.</p>
                </div>
                <button
                    onClick={() => setIsCreatingJob(!isCreatingJob)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                    {isCreatingJob ? 'Cancel' : <><Plus size={20} /> Create New Job</>}
                </button>
            </div>

            {isCreatingJob && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 animate-in slide-in-from-top-4 fade-in duration-300">
                    <h3 className="font-bold text-lg text-slate-800 mb-4">Define New Position</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Job Title</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                                    placeholder="e.g. Senior Backend Engineer"
                                    value={newJob.title}
                                    onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Job Description</label>
                                <textarea
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg resize-none h-[42px] min-h-[42px] overflow-hidden focus:min-h-[80px] transition-all"
                                    placeholder="Brief description of the role..."
                                    value={newJob.description || ''}
                                    onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                                />
                            </div>
                            <SkillSelector
                                skills={newJob.requiredSkills || []}
                                onChange={(skills) => setNewJob({ ...newJob, requiredSkills: skills })}
                            />
                        </div>

                        <div>
                            <AssessmentMatrixInput
                                value={newJob.matrix!}
                                onChange={(matrix) => setNewJob({ ...newJob, matrix })}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-slate-100">
                        <button
                            onClick={handleCreateJob}
                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium"
                        >
                            Save Job Position
                        </button>
                    </div>
                </div>
            )}

            <div className="grid gap-6">
                {jobs.map(job => (
                    <div key={job.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="bg-blue-100 text-blue-700 p-3 rounded-lg">
                                    <Briefcase size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-slate-900">{job.title}</h3>
                                    <div className="flex items-center gap-3 text-sm text-slate-500">
                                        <span>{job.department}</span>
                                        <span>•</span>
                                        <span>{job.requiredSkills.length} Required Skills</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => handleAddBatch(job.id)}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                            >
                                <Plus size={16} /> Add Batch
                            </button>
                        </div>

                        <div className="bg-slate-50 p-6">
                            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                                Recruitment Batches
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {job.batches?.map(batch => (
                                    <div key={batch.id} className="bg-white p-4 rounded-lg border border-slate-200 hover:border-blue-300 transition-colors group relative">
                                        <div className="flex justify-between items-start mb-2">
                                            <h5 className="font-medium text-slate-800">{batch.name}</h5>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase ${batch.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                                                }`}>
                                                {batch.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center text-xs text-slate-500 gap-2 mb-3">
                                            <Calendar size={14} />
                                            {new Date(batch.createdAt).toLocaleDateString()}
                                        </div>

                                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                            <span className="text-xs text-slate-600">
                                                {batch.candidates?.length || 0} Candidates
                                            </span>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setUploadModal({ isOpen: true, batchId: batch.id, jobId: job.id });
                                                    setSelectedFiles([]);
                                                }}
                                                className="text-blue-600 text-xs font-bold hover:underline flex items-center gap-1"
                                            >
                                                <UploadCloud size={14} /> Upload CV
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {job.batches.length === 0 && (
                                    <p className="text-sm text-slate-400 italic">No active batches. Create one to start screening.</p>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                {jobs.length === 0 && !isCreatingJob && (
                    <div className="text-center py-12 text-slate-500">
                        No jobs yet. Create your first job to get started!
                    </div>
                )}
            </div>

            {/* Upload Modal */}
            {uploadModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-slate-900">Upload CVs</h3>
                            <button
                                onClick={() => setUploadModal(null)}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-6">
                            <p className="text-sm text-slate-500 mb-4">
                                Upload candidate CVs for this batch. They will be automatically screened against the job criteria.
                            </p>
                            <FileUpload
                                files={selectedFiles}
                                onChange={setSelectedFiles}
                            />

                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    onClick={() => setUploadModal(null)}
                                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUploadFiles}
                                    disabled={selectedFiles.length === 0 || isProcessing}
                                    className={`px-4 py-2 bg-blue-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2 ${(selectedFiles.length === 0 || isProcessing) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
                                        }`}
                                >
                                    {isProcessing ? (processingStatus || 'Processing...') : 'Start Screening'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Jobs;
