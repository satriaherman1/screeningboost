import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FileUpload from '../components/FileUpload';
import SkillSelector from '../components/SkillSelector';
import { BrainCircuit, Loader2 } from 'lucide-react';

const Upload = () => {
    const [files, setFiles] = useState<File[]>([]);
    const [skills, setSkills] = useState<string[]>([]);
    const [clusters, setClusters] = useState<number>(3);
    const [isProcessing, setIsProcessing] = useState(false);
    const navigate = useNavigate();

    const handleScreening = async () => {
        if (files.length === 0) return;

        setIsProcessing(true);

        try {
            // Mock API call simulation
            await new Promise((resolve) => setTimeout(resolve, 2000));

            // In a real app, we would send FormData to backend here
            // const formData = new FormData();
            // files.forEach(file => formData.append('files', file));
            // formData.append('k', clusters.toString());
            // formData.append('skills', JSON.stringify(skills));

            // Navigate to results (in real app, pass ID or data via state/context)
            navigate('/results', {
                state: {
                    processedData: {
                        totalFiles: files.length,
                        k: clusters
                    }
                }
            });

        } catch (error) {
            console.error('Screening failed:', error);
            alert('An error occurred during screening processing');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="mb-6 border-b border-slate-100 pb-4">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <BrainCircuit className="text-blue-600" />
                        Configure Screening Parameters
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">
                        Upload candidates and define clustering criteria.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Column - Configuration */}
                    <div className="space-y-6">
                        <SkillSelector skills={skills} onChange={setSkills} />

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">
                                Number of Clusters (K)
                            </label>
                            <input
                                type="number"
                                min="2"
                                max="10"
                                value={clusters}
                                onChange={(e) => setClusters(parseInt(e.target.value) || 2)}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            <p className="text-xs text-slate-500">
                                Recommended: 3-5 clusters for optimal separation.
                            </p>
                        </div>
                    </div>

                    {/* Right Column - Upload */}
                    <div className="space-y-6">
                        <FileUpload files={files} onChange={setFiles} />
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                    <button
                        onClick={handleScreening}
                        disabled={isProcessing || files.length === 0}
                        className={`
              flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition-all
              ${isProcessing || files.length === 0
                                ? 'bg-slate-300 cursor-not-allowed'
                                : 'bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-xl'
                            }
            `}
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="animate-spin" size={20} />
                                Processing Candidates...
                            </>
                        ) : (
                            <>
                                Start Screening Analysis
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Upload;
