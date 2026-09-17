import React from 'react';
import {
  Building,
  Briefcase,
  Clock,
  CheckCircle2,
  PlusCircle,
  Eye,
  ExternalLink,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { ModerationQueueTable } from '../../components/employer/ModerationQueueTable';

interface EmployerDashboardPageProps {
  navigate: (path: string) => void;
}

export const EmployerDashboardPage: React.FC<EmployerDashboardPageProps> = ({ navigate }) => {
  const { internships, employerProfile, applyClickCount } = useData();

  const myCompanyInternships = internships.filter(
    (i) => i.company.name.toLowerCase() === employerProfile.companyName.toLowerCase()
  );

  const openCount = myCompanyInternships.filter((i) => i.status === 'open').length;
  const pendingCount = myCompanyInternships.filter((i) => i.status === 'pending').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-[#021F53] rounded-3xl p-6 sm:p-8 text-white shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-6 border border-[#3f58b2]/30">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs font-bold text-[#ff9b00] uppercase tracking-wider font-accent">
            <Building className="w-3.5 h-3.5" />
            <span>Employer Management Hub (S-031)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display">
            {employerProfile.companyName} Employer Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            {employerProfile.industry} · {employerProfile.location}
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => navigate('/employer/postings/new')}
            className="px-4 py-2 bg-[#ff9b00] hover:bg-[#e68c00] text-[#021F53] font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Post New Role</span>
          </button>
          <button
            onClick={() => navigate('/employer/profile')}
            className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white font-semibold text-xs rounded-xl border border-white/20 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>Edit Profile</span>
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Live Roles
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-[#021F53] font-headline">
            {openCount}
          </div>
          <div className="text-[11px] text-slate-400">Published to Directory</div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              In Review
            </span>
            <Clock className="w-4 h-4 text-[#ff9b00]" />
          </div>
          <div className="text-2xl font-bold text-[#021F53] font-headline">
            {pendingCount}
          </div>
          <div className="text-[11px] text-slate-400">Moderation Queue</div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Apply Clicks
            </span>
            <ExternalLink className="w-4 h-4 text-[#3f58b2]" />
          </div>
          <div className="text-2xl font-bold text-[#021F53] font-headline">
            {applyClickCount}
          </div>
          <div className="text-[11px] text-slate-400">Outbound Direct Tracks</div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Status
            </span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-sm font-bold text-emerald-700 pt-1 flex items-center gap-1">
            <span>Verified Employer</span>
          </div>
          <div className="text-[11px] text-slate-400">BR-012 Compliant</div>
        </div>
      </div>

      {/* Moderation Pipeline & Listings Management */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-[#021F53] font-headline">
            Company Listings &amp; Moderation Pipeline
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            New postings and edits are verified in the moderation queue before going public.
          </p>
        </div>

        <ModerationQueueTable
          onViewPosting={(int) => navigate(`/internships/${int.slug}`)}
          onEditPosting={(int) => navigate(`/employer/postings/edit?id=${int.id}`)}
        />
      </div>
    </div>
  );
};

