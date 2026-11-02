import React, { useState } from 'react';
import {
  Award,
  Calendar,
  DollarSign,
  Clock,
  Video,
  ExternalLink,
  Plus,
  CheckCircle2,
  TrendingUp,
  Banknote,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Trash2,
  ShieldCheck,
} from 'lucide-react';
import {
  useCoachSessions,
  useCoachEarnings,
  useCoachAvailabilityMe,
  usePublishAvailability,
  useCurrentUser,
} from '../../services/queries';
import { formatPHP, formatDateTime, formatDate, formatTimeOnly, manilaWallClockToUtcIso } from '../../lib/utils';
import { Modal } from '../../components/common/Modal';
import { CoachBooking, MyAvailabilitySlot } from '../../types/api';

interface CoachDashboardPageProps {
  navigate: (path: string) => void;
}

export const CoachDashboardPage: React.FC<CoachDashboardPageProps> = ({ navigate }) => {
  const { data: user } = useCurrentUser();
  const { data: sessions = [], isLoading: isLoadingSessions } = useCoachSessions();
  const { data: earningsData, isLoading: isLoadingEarnings } = useCoachEarnings();
  const { data: mySlots = [], isLoading: isLoadingSlots } = useCoachAvailabilityMe();
  const publishAvailabilityMutation = usePublishAvailability();

  const [activeTab, setActiveTab] = useState<'sessions' | 'earnings' | 'availability'>('sessions');
  const [isAddSlotOpen, setIsAddSlotOpen] = useState(false);
  const [slotDate, setSlotDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [slotStartTime, setSlotStartTime] = useState('14:00');
  const [slotEndTime, setSlotEndTime] = useState('14:45');
  const [publishError, setPublishError] = useState<string | null>(null);
  const [publishSuccess, setPublishSuccess] = useState<string | null>(null);

  // BR-008: Render server values directly from meta.balance. Never compute money in client.
  const balance = earningsData?.meta?.balance || {
    available_centavos: 0,
    in_transit_centavos: 0,
    paid_out_centavos: 0,
    pending_centavos: 0,
  };

  const earningsItems = earningsData?.items || [];

  const handlePublishSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setPublishError(null);
    setPublishSuccess(null);

    try {
      const startsAtUtc = manilaWallClockToUtcIso(slotDate, slotStartTime);
      const endsAtUtc = manilaWallClockToUtcIso(slotDate, slotEndTime);

      if (new Date(endsAtUtc) <= new Date(startsAtUtc)) {
        setPublishError('End time must be after start time.');
        return;
      }

      // The PUT replaces unbooked slots only; booked ones stay server-side.
      const existingInputs = mySlots
        .filter((s) => !s.is_booked)
        .map((s) => ({ starts_at: s.starts_at, ends_at: s.ends_at }));

      const updatedSlots = [...existingInputs, { starts_at: startsAtUtc, ends_at: endsAtUtc }];

      await publishAvailabilityMutation.mutateAsync(updatedSlots);
      setIsAddSlotOpen(false);
      setPublishSuccess('Availability slot successfully published to your public profile!');
    } catch (err: any) {
      setPublishError(err.message || 'Failed to publish availability slot.');
    }
  };

  const handleRemoveSlot = async (slotId: string) => {
    try {
      const remainingSlots = mySlots
        .filter((s) => s.id !== slotId && !s.is_booked)
        .map((s) => ({ starts_at: s.starts_at, ends_at: s.ends_at }));

      await publishAvailabilityMutation.mutateAsync(remainingSlots);
      setPublishSuccess('Slot removed.');
    } catch (err: any) {
      setPublishError(err.message || 'Failed to remove slot.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header - Solid Brand Midnight Blue (Issue #21) */}
      <div className="bg-[#021F53] rounded-2xl p-6 sm:p-8 text-white shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 border border-[#021F53]">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#3f58b2] text-white font-bold flex items-center justify-center text-2xl border-2 border-white/20 flex-shrink-0">
            {user?.full_name ? user.full_name.charAt(0) : 'C'}
          </div>
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 bg-white/10 px-2.5 py-0.5 rounded-md text-xs font-bold text-[#ff9b00] uppercase tracking-wider">
              <Award className="w-3.5 h-3.5" />
              <span>Verified Coach Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-headline">
              {user?.full_name || 'Coach Dashboard'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Manage your mentorship availability, review student bookings, and monitor earnings.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setPublishError(null);
            setIsAddSlotOpen(true);
          }}
          className="px-5 py-2.5 bg-[#ff9b00] hover:bg-[#e68c00] text-[#021F53] font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 self-start md:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Availability Slot</span>
        </button>
      </div>

      {publishSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between">
          <span>{publishSuccess}</span>
          <button
            type="button"
            onClick={() => setPublishSuccess(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold cursor-pointer"
          >
            ×
          </button>
        </div>
      )}

      {publishError && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{publishError}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {[
          { id: 'sessions', label: 'Booked Sessions', count: sessions.length },
          { id: 'availability', label: 'My Availability', count: mySlots.length },
          {
            id: 'earnings',
            label: 'Earnings & Balance',
            count: formatPHP(balance.available_centavos),
          },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === tab.id
                ? 'bg-[#3f58b2] text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.5 rounded-md text-[10px] ${
                activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Tab 1: Booked Sessions (API-063 GET /me/sessions) */}
      {activeTab === 'sessions' && (
        <div className="space-y-4">
          {isLoadingSessions ? (
            <div className="p-12 flex justify-center bg-white rounded-2xl border border-slate-200">
              <Loader2 className="w-8 h-8 animate-spin text-[#3f58b2]" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#f0f7ff] text-[#3f58b2] flex items-center justify-center mx-auto">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#021F53]">No student sessions booked yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Publish open availability slots so students can schedule 1-on-1 career coaching with you.
              </p>
              <button
                type="button"
                onClick={() => setIsAddSlotOpen(true)}
                className="mt-2 px-5 py-2 bg-[#3f58b2] text-white font-bold text-xs rounded-xl cursor-pointer hover:bg-[#021F53]"
              >
                Publish First Slot
              </button>
            </div>
          ) : (
            sessions.map((booking) => (
              <div
                key={booking.booking_id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-[#021F53] text-sm">
                      1-on-1 Session with {booking.student_name || 'Student'}
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#f0f7ff] text-[#3f58b2] border border-[#3f58b2]/20 capitalize">
                      {booking.status}
                    </span>
                  </div>
                  <p className="text-xs text-[#3f58b2] font-semibold mt-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{formatDateTime(booking.slot_starts_at)} (Asia/Manila)</span>
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  {/* BR-008: Render coach_payout_centavos directly as returned */}
                  <div className="text-right">
                    <div className="text-xs text-slate-500">Coach Payout</div>
                    <div className="text-sm font-bold text-[#021F53]">
                      {formatPHP(booking.coach_payout_centavos)}
                    </div>
                  </div>

                  {booking.status === 'confirmed' && booking.join_url && (
                    <a
                      href={booking.join_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl flex items-center gap-1 hover:bg-emerald-700 cursor-pointer shadow-xs"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Join Call</span>
                      <ExternalLink className="w-3 h-3 ml-0.5" />
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: My Availability (API-064 GET /me/availability) */}
      {activeTab === 'availability' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200">
            <div>
              <h3 className="text-sm font-bold text-[#021F53]">Published Open Slots</h3>
              <p className="text-xs text-slate-500">
                Times shown in Asia/Manila (UTC+8). Only unbooked slots can be removed.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsAddSlotOpen(true)}
              className="px-4 py-2 bg-[#3f58b2] text-white text-xs font-bold rounded-xl hover:bg-[#021F53] flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Slot</span>
            </button>
          </div>

          {isLoadingSlots ? (
            <div className="p-12 flex justify-center bg-white rounded-2xl border border-slate-200">
              <Loader2 className="w-8 h-8 animate-spin text-[#3f58b2]" />
            </div>
          ) : mySlots.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
              <p className="text-xs text-slate-500">No availability slots published yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {mySlots.map((slot) => (
                <div
                  key={slot.id}
                  className={`p-4 rounded-2xl border text-xs flex justify-between items-center ${
                    slot.is_booked
                      ? 'bg-emerald-50/50 border-emerald-200'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div>
                    <div className="font-bold text-[#021F53]">{formatDate(slot.starts_at)}</div>
                    <div className="text-slate-600 mt-0.5">
                      {formatTimeOnly(slot.starts_at)} – {formatTimeOnly(slot.ends_at)}
                    </div>
                    {slot.is_booked ? (
                      <span className="inline-block mt-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                        Booked
                      </span>
                    ) : (
                      <span className="inline-block mt-1 text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        Available
                      </span>
                    )}
                  </div>

                  {!slot.is_booked && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSlot(slot.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                      title="Remove slot"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Earnings & Balance Gauges (BR-008: Server numbers directly from meta.balance) */}
      {activeTab === 'earnings' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Available for Payout
              </span>
              <div className="text-2xl font-bold text-emerald-600 font-headline">
                {formatPHP(balance.available_centavos)}
              </div>
              <span className="text-[11px] text-slate-400">Ready for automated disbursement</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Pending Balance
              </span>
              <div className="text-2xl font-bold text-amber-600 font-headline">
                {formatPHP(balance.pending_centavos)}
              </div>
              <span className="text-[11px] text-slate-400">Within 24h dispute escrow window</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                In Transit
              </span>
              <div className="text-2xl font-bold text-[#3f58b2] font-headline">
                {formatPHP(balance.in_transit_centavos)}
              </div>
              <span className="text-[11px] text-slate-400">Batch payout processing</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Total Paid Out
              </span>
              <div className="text-2xl font-bold text-[#021F53] font-headline">
                {formatPHP(balance.paid_out_centavos)}
              </div>
              <span className="text-[11px] text-slate-400">Disbursed to date</span>
            </div>
          </div>

          {/* Policy Information Callout (Issue #19: 10% platform fee, 90% coach share) */}
          <div className="p-4 bg-[#f0f7ff] rounded-2xl border border-[#3f58b2]/20 flex items-start gap-3 text-xs text-[#021F53]">
            <ShieldCheck className="w-5 h-5 text-[#3f58b2] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold">Transparent Marketplace Revenue Split</div>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                iSkolar retains a 10% platform fee on all paid bookings; you receive 90% of the session price. Earnings clear out of pending status 24 hours after session completion. Payouts are transferred automatically to your designated Philippine bank account or electronic wallet.
              </p>
            </div>
          </div>

          {/* Earnings Items */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
            <h3 className="text-sm font-bold text-[#021F53]">Recent Session Earnings</h3>
            {isLoadingEarnings ? (
              <div className="p-8 flex justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-[#3f58b2]" />
              </div>
            ) : earningsItems.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No earnings recorded yet.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {earningsItems.map((item) => (
                  <div key={item.id} className="py-3 flex justify-between items-center text-xs">
                    <div>
                      <div className="font-bold text-[#021F53]">
                        Session on {formatDate(item.slot_starts_at)}
                      </div>
                      <div className="text-slate-500 text-[11px]">
                        Payment Status: <span className="capitalize">{item.payment_status}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-emerald-600">
                        +{formatPHP(item.coach_payout_centavos)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Fee: {formatPHP(item.platform_fee_centavos)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Availability Slot Modal (API-065 PUT /me/availability) */}
      <Modal
        isOpen={isAddSlotOpen}
        onClose={() => setIsAddSlotOpen(false)}
        title="Add Mentorship Availability Slot (Asia/Manila)"
        maxWidth="md"
      >
        <form onSubmit={handlePublishSlot} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#2c3f77] mb-1">
              Slot Date
            </label>
            <input
              type="date"
              value={slotDate}
              onChange={(e) => setSlotDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-[#021F53] outline-none focus:bg-white focus:border-[#3f58b2]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2c3f77] mb-1">
                Start Time (HH:mm)
              </label>
              <input
                type="time"
                value={slotStartTime}
                onChange={(e) => setSlotStartTime(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-[#021F53] outline-none focus:bg-white focus:border-[#3f58b2]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2c3f77] mb-1">
                End Time (HH:mm)
              </label>
              <input
                type="time"
                value={slotEndTime}
                onChange={(e) => setSlotEndTime(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-[#021F53] outline-none focus:bg-white focus:border-[#3f58b2]"
                required
              />
            </div>
          </div>

          <p className="text-[11px] text-slate-500">
            Slots are stored in UTC and automatically displayed to students in Asia/Manila (UTC+8).
          </p>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddSlotOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={publishAvailabilityMutation.isPending}
              className="px-5 py-2 bg-[#3f58b2] text-white font-bold text-xs rounded-xl hover:bg-[#021F53] cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              {publishAvailabilityMutation.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : null}
              <span>Publish Slot</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
