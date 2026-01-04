import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, X } from 'lucide-react';

interface FileUploadProps {
    files: File[];
    onChange: (files: File[]) => void;
}

const FileUpload = ({ files, onChange }: FileUploadProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files).filter(
                (file) => file.type === 'application/pdf'
            );
            onChange([...files, ...newFiles]);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files) {
            const newFiles = Array.from(e.dataTransfer.files).filter(
                (file) => file.type === 'application/pdf'
            );
            onChange([...files, ...newFiles]);
        }
    };

    const removeFile = (index: number) => {
        const newFiles = [...files];
        newFiles.splice(index, 1);
        onChange(newFiles);
    };

    return (
        <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">
                Upload CVs (PDF Only)
            </label>

            <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${isDragging
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
                    }`}
                onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".pdf"
                    multiple
                    className="hidden"
                />
                <div className="flex flex-col items-center gap-3">
                    <div className="p-4 bg-blue-100 text-blue-600 rounded-full">
                        <UploadCloud size={32} />
                    </div>
                    <div>
                        <p className="text-slate-700 font-medium text-lg">
                            Click to upload or drag and drop
                        </p>
                        <p className="text-slate-500 text-sm">
                            PDF files only (Max 10MB per file)
                        </p>
                    </div>
                </div>
            </div>

            {files.length > 0 && (
                <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-700">
                        Selected Files ({files.length})
                    </p>
                    <div className="bg-slate-50 rounded-lg border border-slate-200 divide-y divide-slate-200 max-h-60 overflow-y-auto">
                        {files.map((file, index) => (
                            <div key={`${file.name}-${index}`} className="flex items-center justify-between p-3">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <FileText className="text-red-500 flex-shrink-0" size={20} />
                                    <span className="text-sm text-slate-700 truncate">
                                        {file.name}
                                    </span>
                                    <span className="text-xs text-slate-400 flex-shrink-0">
                                        {(file.size / 1024 / 1024).toFixed(2)} MB
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeFile(index)}
                                    className="text-slate-400 hover:text-red-500 transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FileUpload;
