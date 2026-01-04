import { useState, type KeyboardEvent } from 'react';
import { X, Plus } from 'lucide-react';

interface SkillSelectorProps {
    skills: string[];
    onChange: (skills: string[]) => void;
}

const SkillSelector = ({ skills, onChange }: SkillSelectorProps) => {
    const [inputValue, setInputValue] = useState('');

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addSkill();
        }
    };

    const addSkill = () => {
        const trimmed = inputValue.trim();
        if (trimmed && !skills.includes(trimmed)) {
            onChange([...skills, trimmed]);
            setInputValue('');
        }
    };

    const removeSkill = (skillToRemove: string) => {
        onChange(skills.filter((skill) => skill !== skillToRemove));
    };

    return (
        <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700">
                Required Skills
            </label>

            <div className="flex gap-2">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="e.g., Python, SQL, React"
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
                <button
                    type="button"
                    onClick={addSkill}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors"
                    disabled={!inputValue.trim()}
                >
                    <Plus size={24} />
                </button>
            </div>

            <div className="flex flex-wrap gap-2 min-h-[40px] p-1">
                {skills.map((skill) => (
                    <span
                        key={skill}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full border border-blue-100"
                    >
                        {skill}
                        <button
                            onClick={() => removeSkill(skill)}
                            className="text-blue-400 hover:text-blue-600 transition-colors"
                        >
                            <X size={14} />
                        </button>
                    </span>
                ))}
                {skills.length === 0 && (
                    <span className="text-slate-400 text-sm italic py-1">
                        No skills added yet. Add relevant technical skills for screening.
                    </span>
                )}
            </div>
        </div>
    );
};

export default SkillSelector;
