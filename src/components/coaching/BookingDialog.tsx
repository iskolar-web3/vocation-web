import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  Lock,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  MessageSquare,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Coach, SessionType, TimeSlot, Booking } from '../../types';
import { formatPHP, formatDate } from '../../lib/utils';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';

interface BookingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  coach: Coach | null;
  onOpenPayMongo: (booking: Booking) => void;
  onBookingSuccess: () => void;
}

export const BookingDialog: React.FC<BookingDialogProps> = ({
  isOpen,
  onClose,
  coach,
  onOpenPayMongo,
  onBookingSuccess,
}) => {
  const { createBooking } = useData();
  const { role, login } = useAuth();

  const [selectedSessionTypeId, setSelectedSessionTypeId] = useState<string>('');
  const [selectedSlotId, setSelectedSlotId] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [isFreeConfirmed, setIsFreeConfirmed] = useState(false);
  const [confirmedFreeBooking, setConfirmedFreeBooking] = useState<Booking | null>(null);

  if (!coach) return null;

  // Initialize selected session if none selected
  const activeSessionType =
    coach.sessionTypes.find((st) => st.id === selectedSessionTypeId) ||
    coach.sessionTypes[0];

  const availableSlots = coach.availableSlots.filter((s) => !s.isBooked);
  const selectedSlot = coach.availableSlots.find((s) => s.id === selectedSlotId) || availableSlots[0];

  const isFree = activeSessionType ? activeSessionType.priceCentavos === 0 : true;
  const priceCentavos = activeSessionType ? activeSessionType.priceCentavos : 0;
  const platformFeeCentavos = Math.round(priceCentavos * 0.05);
  const coachPayoutCentavos = priceCentavos - platformFeeCentavos;

  const handleProceed = () => {
    if (!activeSessionType || !selectedSlot) return;

    // Ensure user has student session for booking
    if (role === 'visitor') {
      login('student');
    }

    const slotIso = `${selectedSlot.date}T${selectedSlot.startTime}:00Z`;

    const newBooking = createBooking({
      coachSlug: coach.slug,
      sessionTypeId: activeSessionType.id,
      slotStartsAt: slotIso,
      notes: notes.trim(),
    });

    if (isFree) {
      setConfirmedFreeBooking(newBooking);
      setIsFreeConfirmed(true);
      onBookingSuccess();
    } else {
      onClose();
      onOpenPayMongo(newBooking);
    }
  };

  const handleCloseDialog = () => {
    setIsFreeConfirmed(false);
    setConfirmedFreeBooking(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCloseDialog}
      title={
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-[#3f58b2]" />
          <span>Book 1-on-1 Session</span>
        </div>
      }
      maxWidth="xl"
    >
      {isFreeConfirmed && confirmedFreeBooking ? (
        <div className="py-8 text-center space-y-4 animate-scaleUp">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-bold text-[#021F53] font-headline">
            Session Confirmed!
          </h3>
          <p className="text-sm text-[#2c3f77] max-w-md mx-auto">
            Your free 15-minute intro session with <strong>{coach.name}</strong> is booked. Your video call link is ready:
          </p>
          <div className="p-4 bg-[#f0f7ff] border border-[#607ef2]/20 rounded-2xl max-w-md mx-auto text-left space-y-2">
            <div className="text-xs text-slate-500 font-semibold">Google Meet Join URL:</div>
            <div className="text-xs font-mono text-[#3f58b2] bg-white p-2.5 rounded-xl border border-slate-200 break-all select-all font-bold">
              {confirmedFreeBooking.joinUrl}
            </div>
          </div>
          <button
            type="button"
            onClick={handleCloseDialog}
            className="px-6 py-2.5 bg-[#3f58b2] text-white font-bold rounded-full hover:bg-[#021F53] transition-all text-sm"
          >
            Go to My Bookings
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Coach Header */}
          <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-[#f0f7ff] border border-[#3f58b2]/10">
            <img
              src={coach.avatar}
              alt={coach.name}
              className="w-12 h-12 rounded-xl object-cover border border-white shadow-xs flex-shrink-0"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="font-bold text-[#021F53] text-base">{coach.name}</h4>
                {coach.isVerified && (
                  <ShieldCheck className="w-4 h-4 text-[#3f58b2]" />
                )}
              </div>
              <p className="text-xs text-[#2c3f77]">{coach.headline}</p>
            </div>
          </div>

          {/* Step 1: Session Type Selection */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#2c3f77]">
              1. Select Session Type
            </label>
            <div className="space-y-2">
              {coach.sessionTypes.map((st) => {
                const isSelected = activeSessionType?.id === st.id;
                return (
                  <div
                    key={st.id}
                    onClick={() => setSelectedSessionTypeId(st.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#3f58b2] bg-[#f0f7ff] shadow-xs ring-2 ring-[#3f58b2]/20'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="font-bold text-sm text-[#021F53]">{st.name}</h5>
                          {st.badge && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ff9b00]/15 text-[#ff9b00] border border-[#ff9b00]/30">
                              {st.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#2c3f77] mt-1 leading-relaxed">
                          {st.description}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-bold text-sm text-[#3f58b2]">
                          {formatPHP(st.priceCentavos)}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center justify-end gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          <span>{st.durationMinutes} mins</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 2: Slot Selection */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#2c3f77]">
              2. Choose Available Date & Time
            </label>
            {availableSlots.length === 0 ? (
              <p className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded-xl">
                No slots currently available for this coach.
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {availableSlots.map((slot) => {
                  const isSelected = selectedSlot?.id === slot.id;
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => setSelectedSlotId(slot.id)}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? 'border-[#3f58b2] bg-[#f0f7ff] shadow-xs ring-2 ring-[#3f58b2]/20 text-[#021F53]'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="text-xs font-bold">{formatDate(slot.date)}</div>
                      <div className="text-xs text-[#3f58b2] font-semibold mt-0.5">
                        {slot.startTime} – {slot.endTime}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Step 3: Preparation Goals */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#2c3f77]">
              3. Preparation Goals & Target Companies (Optional)
            </label>
            <div className="relative">
              <MessageSquare className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="E.g. Preparing for Maya's technical round, wanting advice on my React projects..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3f58b2]/30 focus:border-[#3f58b2]"
              />
            </div>
          </div>

          {/* Pricing Summary with BR-008 platform breakdown */}
          <div className="p-4 rounded-2xl bg-[#021F53]/5 border border-[#3f58b2]/10 space-y-2 text-xs">
            <div className="flex justify-between text-[#2c3f77]">
              <span>Base Session Fee</span>
              <span className="font-bold">{formatPHP(priceCentavos)}</span>
            </div>
            {!isFree && (
              <>
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>Coach Earnings (95%)</span>
                  <span>{formatPHP(coachPayoutCentavos)}</span>
                </div>
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>Platform Fee (5% iSkolar commission)</span>
                  <span>{formatPHP(platformFeeCentavos)}</span>
                </div>
              </>
            )}
            <div className="pt-2 border-t border-[#3f58b2]/15 flex justify-between items-center text-sm font-bold text-[#021F53]">
              <span>Total to Checkout</span>
              <span className="text-base text-[#3f58b2]">{formatPHP(priceCentavos)}</span>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={handleCloseDialog}
              className="px-5 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-full"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleProceed}
              disabled={!selectedSlot}
              className="px-6 py-3 rounded-full text-xs font-bold text-white bg-[#3f58b2] hover:bg-[#021F53] shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isFree ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Free Booking</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>Proceed to PayMongo ({formatPHP(priceCentavos)})</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};
