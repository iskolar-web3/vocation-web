import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  ShieldCheck,
  Building,
  MapPin,
  ExternalLink,
  Ban,
  Clock,
} from 'lucide-react';
import { Internship, ListingStatus } from '../../types';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { formatDate, formatPesos } from '../../lib/utils';
import { Modal } from '../common/Modal';

interface ModerationQueueTableProps {
  onEditPosting?: (internship: Internship) => void;
  onViewPosting?: (internship: Internship) => void;
}

export const ModerationQueueTable: React.FC<ModerationQueueTableProps> = ({
  onEditPosting,
  onViewPosting,
}) => {
  const { internships, moderateListing } = useData();
  const { role } = useAuth();

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [rejectModalItem, setRejectModalItem] = useState<Internship | null>(null);
  const [rejectReason, setRejectReason] = useState('Please provide more specific deliverables for OJT credit hours and ensure external apply URL is active.');
  const [withdrawModalItem, setWithdrawModalItem] = useState<Internship | null>(null);

  const filteredInternships = internships.filter((item) => {
    if (filterStatus === 'all') return true;
    return item.status === filterStatus;
  });

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
            <span>Withdrawn (BR-006)</span>
          </span>
        );
    }
  };

  const handleApprove = (id: string) => {
    moderateListing(id, 'approve');
  };

  const handleConfirmReject = () => {
    if (rejectModalItem) {
      moderateListing(rejectModalItem.id, 'reject', rejectReason);
      setRejectModalItem(null);
    }
  };

  const handleConfirmWithdraw = () => {
    if (withdrawModalItem) {
      moderateListing(withdrawModalItem.id, 'withdraw');
      setWithdrawModalItem(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Status Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div className="flex flex-wrap gap-1.5">
          {[
            { value: 'all', label: 'All Postings', count: internships.length },
            {
              value: 'pending',
              label: 'Pending Queue',
              count: internships.filter((i) => i.status === 'pending').length,
            },
            {
              value: 'open',
              label: 'Live / Open',
              count: internships.filter((i) => i.status === 'open').length,
            },
            {
              value: 'rejected',
              label: 'Needs Revision',
              count: internships.filter((i) => i.status === 'rejected').length,
            },
            {
              value: 'withdrawn',
              label: 'Withdrawn',
              count: internships.filter((i) => i.status === 'withdrawn').length,
            },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilterStatus(tab.value)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                filterStatus === tab.value
                  ? 'bg-[#021F53] text-white shadow-xs font-bold'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  filterStatus === tab.value
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Postings Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        {filteredInternships.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-[#021F53]">No listings in this status view</h4>
            <p className="text-xs text-slate-500">
              There are no internship postings with status "{filterStatus}".
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredInternships.map((internship) => (
              <div
                key={internship.id}
                className="p-4 sm:p-5 hover:bg-slate-50/70 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                {/* Left: Role Info */}
                <div className="flex items-start gap-3.5">
                  <img
                    src={internship.company.logo}
                    alt={internship.company.name}
                    className="w-11 h-11 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                  />
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-bold text-base text-[#021F53] font-headline">
                        {internship.title}
                      </h4>
                      {getStatusBadge(internship.status)}
                    </div>
                    <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-500">
                      <span className="font-semibold text-slate-700">{internship.company.name}</span>
                      <span>·</span>
                      <span className="text-[#3f58b2] font-medium">{internship.field}</span>
                      <span>·</span>
                      <span className="capitalize">{internship.workSetup}</span>
                      {internship.isPaid && internship.stipendAmount && (
                        <>
                          <span>·</span>
                          <span className="text-amber-900 font-semibold">
                            {formatPesos(internship.stipendAmount)}/mo
                          </span>
                        </>
                      )}
                    </div>
                    {internship.rejectionReason && internship.status === 'rejected' && (
                      <div className="p-2.5 mt-2 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                        <strong>Moderation Feedback:</strong> {internship.rejectionReason}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex flex-wrap items-center gap-2 justify-end pt-2 lg:pt-0">
                  {onViewPosting && (
                    <button
                      type="button"
                      onClick={() => onViewPosting(internship)}
                      className="p-2 text-slate-600 hover:text-[#3f58b2] hover:bg-slate-100 rounded-xl cursor-pointer"
                      title="View Public Detail"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  )}

                  {onEditPosting && (
                    <button
                      type="button"
                      onClick={() => onEditPosting(internship)}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center gap-1 cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                  )}

                  {/* Admin Moderation Actions */}
                  {role === 'admin' && (
                    <>
                      {internship.status === 'pending' && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleApprove(internship.id)}
                            className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs flex items-center gap-1 cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approve (Publish)</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setRejectModalItem(internship)}
                            className="px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl flex items-center gap-1 cursor-pointer"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </>
                      )}

                      {internship.status === 'open' && (
                        <button
                          type="button"
                          onClick={() => setWithdrawModalItem(internship)}
                          className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 rounded-xl flex items-center gap-1 cursor-pointer"
                          title="Withdraw from public directory immediately (BR-006)"
                        >
                          <Ban className="w-3.5 h-3.5" />
                          <span>Withdraw (BR-006)</span>
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reject Modal */}
      <Modal
        isOpen={!!rejectModalItem}
        onClose={() => setRejectModalItem(null)}
        title="Reject Listing with Feedback"
        maxWidth="md"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Provide actionable feedback for {rejectModalItem?.company.name} on what changes are needed before publishing this role.
          </p>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={3}
            className="w-full p-3 text-xs bg-slate-50 border border-slate-300 rounded-xl"
          />
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setRejectModalItem(null)}
              className="px-4 py-2 text-xs font-bold text-slate-500 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmReject}
              className="px-4 py-2 text-xs font-bold text-white bg-rose-600 rounded-xl hover:bg-rose-700 cursor-pointer"
            >
              Confirm Rejection
            </button>
          </div>
        </div>
      </Modal>

      {/* Withdraw Modal (S-107, BR-006) */}
      <Modal
        isOpen={!!withdrawModalItem}
        onClose={() => setWithdrawModalItem(null)}
        title="Confirm Immediate Listing Withdrawal"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
            <strong>BR-006 Rule:</strong> A posting may be withdrawn at any time, immediately removing it from public view.
          </div>
          <p className="text-xs text-slate-600">
            Are you sure you want to withdraw <strong>{withdrawModalItem?.title}</strong>? Students will no longer see this opportunity in the directory.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setWithdrawModalItem(null)}
              className="px-4 py-2 text-xs font-bold text-slate-500 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmWithdraw}
              className="px-4 py-2 text-xs font-bold text-white bg-slate-900 rounded-xl hover:bg-black cursor-pointer"
            >
              Withdraw Listing Now
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

