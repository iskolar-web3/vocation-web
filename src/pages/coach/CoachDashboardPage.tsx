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
  Sparkles,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { formatPHP, formatDateTime, formatDate } from '../../lib/utils';
import { Modal } from '../../components/common/Modal';

interface CoachDashboardPageProps {
  navigate: (path: string) => void;
}

export const CoachDashboardPage: React.FC<CoachDashboardPageProps> = ({ navigate }) => {
  const { bookings, coaches } = useData();
  const { userName } = useAuth();

  const [activeTab, setActiveTab] = useState<'sessions' | 'earnings' | 'availability'>('sessions');
  const [isAddSlotOpen, setIsAddSlotOpen] = useState(false);
  const [newSlotDate, setNewSlotDate] = useState('2026-09-28');
  const [newSlotStart, setNewSlotStart] = useState('17:00');
  const [newSlotEnd, setNewSlotEnd] = useState('17:45');

  const coach = coaches[0]; // Active coach persona

  // Coach bookings
  const coachBookings = bookings.filter((b) => b.coachSlug === coach.slug);
  const totalEarnedCentavos = coachBookings
    .filter((b) => b.paymentStatus === 'paid')
    .reduce((sum, b) => sum + b.coachPayoutCentavos, 0);

  const totalPlatformFeesCentavos = coachBookings
    .filter((b) => b.paymentStatus === 'paid')
    .reduce((sum, b) => sum + b.platformFeeCentavos, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#021F53] via-[#002774] to-[#3f58b2] rounded-3xl p-6 sm:p-10 text-white shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={coach.avatar}
            alt={coach.name}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-white shadow-md"
          />
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 bg-white/10 px-2.5 py-0.5 rounded-full text-xs font-bold text-[#ff9b00] uppercase tracking-wider">
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
          onClick={() => setIsAddSlotOpen(true)}
          className="px-5 py-2.5 bg-[#ff9b00] hover:bg-[#e68c00] text-[#021F53] font-bold text-xs rounded-full shadow-md transition-all flex items-center gap-1.5 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Availability Slot</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {[
          { id: 'sessions', label: 'Booked Sessions', count: coachBookings.length },
          { id: 'earnings', label: 'Earnings & Payouts (BR-008)', count: `${formatPHP(totalEarnedCentavos)}` },
          { id: 'availability', label: 'Manage Available Slots', count: coach.availableSlots.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
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

      {/* Sessions Tab */}
      {activeTab === 'sessions' && (
        <div className="space-y-4">
          {coachBookings.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-3xl p-6 border border-[#3f58b2]/10 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-base text-[#021F53]">{b.sessionTypeName}</h4>
                  <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                    {b.status}
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  Student: <strong>{b.studentName}</strong> ({b.studentEmail})
                </p>
                <p className="text-xs text-[#3f58b2] font-semibold flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{formatDateTime(b.slotStartsAt)} ({b.sessionDuration} mins)</span>
                </p>
                {b.notes && (
                  <p className="text-xs text-slate-500 italic pt-1">
                    Student goal: "{b.notes}"
                  </p>
                )}
              </div>

              <div className="flex flex-col sm:items-end gap-2">
                <div className="text-xs font-bold text-[#021F53]">
                  Your Payout: <span className="text-[#3f58b2]">{formatPHP(b.coachPayoutCentavos)}</span>
                </div>
                {b.joinUrl && (
                  <a
                    href={b.joinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-full flex items-center gap-1.5 shadow-xs"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Launch Call</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Earnings Tab */}
      {activeTab === 'earnings' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-[#3f58b2]/10 shadow-soft space-y-1">
              <span className="text-xs text-slate-500 font-semibold uppercase">Total Coach Payout (95%)</span>
              <div className="text-3xl font-black text-emerald-600 font-headline">
                {formatPHP(totalEarnedCentavos)}
              </div>
              <p className="text-[11px] text-slate-400">Net payout derived by subtraction (BR-008)</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-[#3f58b2]/10 shadow-soft space-y-1">
              <span className="text-xs text-slate-500 font-semibold uppercase">Platform Fee (5%)</span>
              <div className="text-3xl font-black text-slate-700 font-headline">
                {formatPHP(totalPlatformFeesCentavos)}
              </div>
              <p className="text-[11px] text-slate-400">iSkolar platform service take</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-[#3f58b2]/10 shadow-soft space-y-1">
              <span className="text-xs text-slate-500 font-semibold uppercase">Paid Sessions</span>
              <div className="text-3xl font-black text-[#3f58b2] font-headline">
                {coachBookings.filter((b) => b.paymentStatus === 'paid').length}
              </div>
              <p className="text-[11px] text-slate-400">Collected via PayMongo</p>
            </div>
          </div>
        </div>
      )}

      {/* Availability Tab */}
      {activeTab === 'availability' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#3f58b2]/10 shadow-soft space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h3 className="font-bold text-base text-[#021F53]">Bookable Calendar Slots</h3>
            <button
              onClick={() => setIsAddSlotOpen(true)}
              className="px-4 py-2 bg-[#f0f7ff] text-[#3f58b2] text-xs font-bold rounded-full border border-[#3f58b2]/20"
            >
              + Add Slot
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {coach.availableSlots.map((slot) => (
              <div
                key={slot.id}
                className={`p-4 rounded-2xl border ${
                  slot.isBooked
                    ? 'bg-slate-50 border-slate-200 text-slate-500'
                    : 'bg-[#f0f7ff]/60 border-[#607ef2]/20 text-[#021F53]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">{formatDate(slot.date)}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      slot.isBooked ? 'bg-slate-200 text-slate-600' : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {slot.isBooked ? 'Booked' : 'Available'}
                  </span>
                </div>
                <div className="text-sm font-semibold mt-1">
                  {slot.startTime} – {slot.endTime}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Slot Modal */}
      <Modal
        isOpen={isAddSlotOpen}
        onClose={() => setIsAddSlotOpen(false)}
        title="Add Bookable Availability Slot"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-[#2c3f77] mb-1">
              Date
            </label>
            <input
              type="date"
              value={newSlotDate}
              onChange={(e) => setNewSlotDate(e.target.value)}
              className="w-full p-2.5 bg-[#f0f7ff] border border-[#607ef2]/20 rounded-xl text-xs font-semibold"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-[#2c3f77] mb-1">
                Start Time
              </label>
              <input
                type="time"
                value={newSlotStart}
                onChange={(e) => setNewSlotStart(e.target.value)}
                className="w-full p-2.5 bg-[#f0f7ff] border border-[#607ef2]/20 rounded-xl text-xs font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-[#2c3f77] mb-1">
                End Time
              </label>
              <input
                type="time"
                value={newSlotEnd}
                onChange={(e) => setNewSlotEnd(e.target.value)}
                className="w-full p-2.5 bg-[#f0f7ff] border border-[#607ef2]/20 rounded-xl text-xs font-semibold"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-3">
            <button
              onClick={() => setIsAddSlotOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-500"
            >
              Cancel
            </button>
            <button
              onClick={() => setIsAddSlotOpen(false)}
              className="px-5 py-2 bg-[#3f58b2] text-white font-bold text-xs rounded-full"
            >
              Add Slot
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
