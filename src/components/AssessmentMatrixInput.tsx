import { useState, useEffect } from 'react';
import type { AssessmentMatrix } from '../types';
import { AlertCircle, Plus, Trash2 } from 'lucide-react';

interface AssessmentMatrixInputProps {
    value: AssessmentMatrix;
    onChange: (matrix: AssessmentMatrix) => void;
}

const AssessmentMatrixInput = ({ value, onChange }: AssessmentMatrixInputProps) => {
    const [total, setTotal] = useState(100);

    useEffect(() => {
        const sum = value.reduce((acc, curr) => acc + curr.weight, 0);
        setTotal(sum);
    }, [value]);

    const handleWeightChange = (id: string, newWeight: number) => {
        onChange(value.map(item =>
            item.id === id ? { ...item, weight: newWeight } : item
        ));
    };

    const handleNameChange = (id: string, newName: string) => {
        onChange(value.map(item =>
            item.id === id ? { ...item, name: newName } : item
        ));
    };

    const handleAddCriteria = () => {
        const newId = Math.random().toString(36).substr(2, 9);
        onChange([...value, { id: newId, name: 'New Criteria', weight: 0 }]);
    };

    const handleRemoveCriteria = (id: string) => {
        onChange(value.filter(item => item.id !== id));
    };

    return (
        <div className="space-y-6 bg-slate-50 p-6 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-800">Assessment Matrix</h3>
                <span className={`text-sm font-bold px-3 py-1 rounded-full ${total === 100
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                    Total: {total}%
                </span>
            </div>

            <div className="space-y-4">
                {value.map((criteria) => (
                    <div key={criteria.id} className="flex gap-4 items-start bg-white p-3 rounded-md border border-slate-200">
                        <div className="flex-1">
                            <label className="block text-xs font-medium text-slate-500 mb-1">Criteria Name</label>
                            <input
                                type="text"
                                value={criteria.name}
                                onChange={(e) => handleNameChange(criteria.id, e.target.value)}
                                className="w-full text-sm font-medium text-slate-800 border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none px-1 py-0.5"
                            />
                        </div>

                        <div className="flex-[2]">
                            <label className="block text-xs font-medium text-slate-500 mb-1">
                                Weight ({criteria.weight}%)
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                step="5"
                                value={criteria.weight}
                                onChange={(e) => handleWeightChange(criteria.id, parseInt(e.target.value))}
                                className="w-full"
                            />
                        </div>

                        <button
                            onClick={() => handleRemoveCriteria(criteria.id)}
                            className="mt-4 text-slate-400 hover:text-red-500 transition-colors"
                            title="Remove Criteria"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
            </div>

            <button
                type="button"
                onClick={handleAddCriteria}
                className="w-full py-2 border-2 border-dashed border-slate-300 rounded-lg text-slate-500 hover:border-blue-400 hover:text-blue-600 transition-all flex items-center justify-center gap-2 text-sm font-medium"
            >
                <Plus size={16} />
                Add Assessment Criteria
            </button>

            {total !== 100 && (
                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-md">
                    <AlertCircle size={16} />
                    <span>Total weight must equal 100%. Adjust weights needed.</span>
                </div>
            )}
        </div>
    );
};

export default AssessmentMatrixInput;
