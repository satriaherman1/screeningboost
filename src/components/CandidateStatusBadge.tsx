import type { CandidateStatus } from '../types';
import { CheckCircle, XCircle, Clock, Ban, Award } from 'lucide-react';

interface CandidateStatusBadgeProps {
    status: CandidateStatus;
}

const statusConfig = {
    processing: { label: 'Processing', color: 'bg-blue-100 text-blue-700', icon: Clock },
    done: { label: 'Done', color: 'bg-gray-100 text-gray-700', icon: CheckCircle },
    failed: { label: 'Failed', color: 'bg-red-100 text-red-700', icon: XCircle },
    accepted: { label: 'Accepted', color: 'bg-green-100 text-green-700', icon: Award },
    rejected: { label: 'Rejected', color: 'bg-slate-100 text-slate-500', icon: Ban },
};

const CandidateStatusBadge = ({ status }: CandidateStatusBadgeProps) => {
    const config = statusConfig[status];
    const Icon = config.icon;

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
            <Icon size={12} />
            {config.label}
        </span>
    );
};

export default CandidateStatusBadge;
