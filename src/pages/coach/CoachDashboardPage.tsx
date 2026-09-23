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
} from 'lucide-react';
import { useCoaches, useStudentBookings } from '../../services/queries';
import { useAuth } from '../../context/AuthContext';
import { formatPHP, formatDateTime, formatDate, manilaWallClockToUtcIso } from '../../lib/utils';
import { Modal } from '../../components/common/Modal';

interface CoachDashboardPageProps {
  navigate: (path: string) => void;
}

export const CoachDashboardPage: React.FC<CoachDashboardPageProps> = ({ navigate }) => {
  const { user } = useAuth();
  const { data: coachesData } = useCoaches();
  const { data: bookings = [] } = useStudentBookings();

  const [activeTab, setActiveTab] = useState<'sessions' | 'earnings' | 'availability'>('sessions');
  const [isAddSlotOpen, setIsAddSlotOpen] = useState(false);
  const [newSlotDate, setNewSlotDate] = useState('2026-09-28');
  const [newSlotStart, setNewSlotStart] = useState('17:00');
  const [newSlotEnd, setNewSlotEnd] = useState('17:45');

  const coach = coachesData?.items?.[0] || {
    id: 'coach-1',
    slug: 'paolo-ramos',
    name: user?.full_name || 'Coach Paolo Ramos',
    headline: 'Senior Engineering Lead at Grab',
    avatar_url: user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
    starting_price_centavos: 0,
    session_types: [],
  };

  const totalEarnedCentavos = bookings
    .filter((b) => b.payment_status === 'paid' || b.payment_status === 'none')
    .reduce((sum, b) => sum + (b.coach_payout_centavos || 0), 0);

  const totalPlatformFeesCentavos = bookings
    .filter((b) => b.payment_status === 'paid')
    .reduce((sum, b) => sum + (b.platform_fee_centavos || 0), 0);

  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddSlotOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#021F53] via-[#002774] to-[#3f58b2] rounded-3xl p-6 sm:p-10 text-white shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={coach.avatar_url}
            alt={coach.name}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-white shadow-md"
          />
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 bg-white/10 px-2.5 py-0.5 rounded-full text-xs font-bold text-[#ff9b00] uppercase tracking-wider font-accent">
              <Award className="w-3.5 h-3.5" />
              <span>Coach Portal (S-041)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display">
              {coach.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-200">{coach.headline}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsAddSlotOpen(true)}
          className="px-5 py-2.5 bg-[#ff9b00] hover:bg-[#e68c00] text-[#021F53] font-bold text-xs rounded-full shadow-md transition-all flex items-center gap-1.5 self-start md:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Availability Slot</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {[
          { id: 'sessions', label: 'Booked Sessions', count: bookings.length },
          { id: 'earnings', label: 'Earnings & Payouts (BR-008)', count: `${formatPHP(totalEarnedCentavos)}` },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === tab.id
                ? 'bg-[#3f58b2] text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Tab 1: Sessions */}
      {activeTab === 'sessions' && (
        <div className="space-y-4">
          {bookings.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
              <Calendar className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-[#021F53]">No booked sessions yet.</p>
            </div>
          ) : (
            bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div>
                  <h4 className="font-bold text-[#021F53] text-sm font-headline">{booking.session_type_name}</h4>
                  <p className="text-xs text-slate-500">Student: {booking.student_name} ({booking.student_email})</p>
                  <p className="text-xs text-[#3f58b2] font-semibold mt-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{formatDateTime(booking.slot_starts_at)} (Asia/Manila)</span>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-[#021F53]">
                    Payout: {formatPHP(booking.coach_payout_centavos)}
                  </span>
                  {booking.join_url && (
                    <a
                      href={booking.join_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl flex items-center gap-1 hover:bg-emerald-700"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Join Call</span>
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Earnings & Payout Ledger (BR-008: Render server values directly) */}
      {activeTab === 'earnings' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Net Earnings</span>
              <div className="text-2xl font-bold text-emerald-600 font-display">{formatPHP(totalEarnedCentavos)}</div>
              <span className="text-[11px] text-slate-400">Deposited via GCash/Direct Bank</span>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Platform Fees Retained</span>
              <div className="text-2xl font-bold text-[#3f58b2] font-display">{formatPHP(totalPlatformFeesCentavos)}</div>
              <span className="text-[11px] text-slate-400">5% iSkolar platform fee</span>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Completed Sessions</span>
              <div className="text-2xl font-bold text-[#021F53] font-display">{bookings.length}</div>
              <span className="text-[11px] text-slate-400">100% attendance rate</span>
            </div>
          </div>
        </div>
      )}

      {/* Add Slot Modal */}
      <Modal
        isOpen={isAddSlotOpen}
        onClose={() => setIsAddSlotOpen(false)}
        title="Add Open Mentorship Slot (Asia/Manila)"
        maxWidth="md"
      >
        <form onSubmit={handleAddSlot} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#2c3f77] mb-1">
              Slot Date
            </label>
            <input
              type="date"
              value={newSlotDate}
              onChange={(e) => setNewSlotDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#f0f7ff] border border-[#607ef2]/20 rounded-xl text-xs font-semibold text-[#021F53]"
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
                value={newSlotStart}
                onChange={(e) => setNewSlotStart(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#f0f7ff] border border-[#607ef2]/20 rounded-xl text-xs font-semibold text-[#021F53]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2c3f77] mb-1">
                End Time (HH:mm)
              </label>
              <input
                type="time"
                value={newSlotEnd}
                onChange={(e) => setNewSlotEnd(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#f0f7ff] border border-[#607ef2]/20 rounded-xl text-xs font-semibold text-[#021F53]"
                required
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddSlotOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-full"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#3f58b2] text-white font-bold text-xs rounded-full hover:bg-[#021F53]"
            >
              Publish Slot
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
