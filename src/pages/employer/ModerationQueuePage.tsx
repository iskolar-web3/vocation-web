import React from 'react';
import { ShieldAlert, CheckCircle2, XCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { ModerationQueueTable } from '../../components/employer/ModerationQueueTable';

interface ModerationQueuePageProps {
  navigate: (path: string) => void;
}

export const ModerationQueuePage: React.FC<ModerationQueuePageProps> = ({ navigate }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-[#021F53] rounded-2xl p-6 sm:p-10 text-white shadow-soft space-y-3">
        <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-md text-xs font-bold text-[#607ef2] uppercase tracking-wider border border-white/15">
          <ShieldAlert className="w-3.5 h-3.5 text-[#607ef2]" />
          <span>Platform Moderation Suite</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold font-display">
          Admin Listing Moderation & Compliance
        </h1>
        <p className="text-xs sm:text-sm text-slate-200 max-w-2xl leading-relaxed">
          Enforce quality guidelines, verify external application URLs, and manage listing status. Only approved roles with status "open" appear in the public student directory.
        </p>
      </div>

      <ModerationQueueTable
        onViewPosting={(int) => navigate(`/internships/${int.slug}`)}
      />
    </div>
  );
};
