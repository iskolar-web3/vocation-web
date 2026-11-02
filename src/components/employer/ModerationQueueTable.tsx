import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Eye,
  Ban,
  Clock,
  Loader2,
  Building,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { ListingStatus, AdminInternshipCard } from '../../types/api';
import { useAdminInternships, useAdminWithdrawInternship } from '../../services/queries';
import { Modal } from '../common/Modal';

interface ModerationQueueTableProps {
  onEditPosting?: (internship: AdminInternshipCard) => void;
  onViewPosting?: (internship: AdminInternshipCard) => void;
}

export const ModerationQueueTable: React.FC<ModerationQueueTableProps> = ({
  onViewPosting,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [withdrawModalItem, setWithdrawModalItem] = useState<AdminInternshipCard | null>(null);

  const { data: internships = [], isLoading } = useAdminInternships(
    filterStatus !== 'all' ? filterStatus : undefined
  );
  const withdrawMutation = useAdminWithdrawInternship();

  const getStatusBadge = (status: ListingStatus) => {
    switch (status) {
      case 'open':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Open (Public)</span>
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-[#ff9b00]" />
            <span>Pending Review</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" />
            <span>Needs Revision</span>
          </span>
        );
      case 'withdrawn':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            <Ban className="w-3.5 h-3.5 text-slate-500" />
            <span>Withdrawn</span>
          </span>
        );
    }
  };

  const handleConfirmWithdraw = async () => {
    if (withdrawModalItem) {
      await withdrawMutation.mutateAsync(withdrawModalItem.id);
      setWithdrawModalItem(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Status Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div className="flex flex-wrap gap-1.5">
          {['all', 'open', 'pending', 'rejected', 'withdrawn'].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setFilterStatus(status)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                filterStatus === status
                  ? 'bg-[#021F53] text-white shadow-2xs'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              {status === 'all' ? 'All Roles' : status}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-16 bg-white rounded-2xl border border-slate-200">
          <Loader2 className="w-8 h-8 animate-spin text-[#3f58b2]" />
        </div>
      ) : internships.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <p className="text-sm font-bold text-[#021F53]">No internships found in this view.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f0f7ff] text-[#2c3f77] font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Opportunity</th>
                  <th className="px-5 py-3.5">Company</th>
                  <th className="px-5 py-3.5">Compensation</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {internships.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-bold text-sm text-[#021F53]">{item.title}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {item.field}
                        {item.duration_weeks != null && ` · ${item.duration_weeks} wks`}
                        {` · ${item.work_setup.charAt(0).toUpperCase()}${item.work_setup.slice(1)}`}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-800">{item.company?.name}</div>
                      <div className="text-[11px] text-slate-500">{item.location}</div>
                    </td>
                    <td className="px-5 py-4">
                      {item.is_paid ? (
                        <span className="font-bold text-emerald-700">Paid</span>
                      ) : (
                        <span className="text-slate-400">Unpaid / Credit</span>
                      )}
                    </td>
                    <td className="px-5 py-4">{getStatusBadge(item.status)}</td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {onViewPosting && (
                          <button
                            type="button"
                            onClick={() => onViewPosting(item)}
                            className="p-1.5 text-slate-500 hover:text-[#3f58b2] hover:bg-[#f0f7ff] rounded-lg transition-colors cursor-pointer"
                            title="Preview Listing"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        {item.status === 'open' && (
                          <button
                            type="button"
                            onClick={() => setWithdrawModalItem(item)}
                            className="px-3 py-1 bg-rose-50 text-rose-700 font-bold rounded-lg border border-rose-200 hover:bg-rose-100 text-[11px] cursor-pointer"
                          >
                            Withdraw
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      <Modal
        isOpen={!!withdrawModalItem}
        onClose={() => setWithdrawModalItem(null)}
        title="Withdraw Listing from Directory"
        maxWidth="md"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Are you sure you want to withdraw <strong>{withdrawModalItem?.title}</strong>? It will immediately be removed from the public directory.
          </p>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setWithdrawModalItem(null)}
              className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-full cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmWithdraw}
              disabled={withdrawMutation.isPending}
              className="px-5 py-2 bg-rose-600 text-white font-bold text-xs rounded-full hover:bg-rose-700 cursor-pointer"
            >
              Confirm Withdraw
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
