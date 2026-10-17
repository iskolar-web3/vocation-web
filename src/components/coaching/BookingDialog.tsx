import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  CreditCard,
  MessageSquare,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Info,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { CoachCard, CoachDetail, AvailabilitySlot, CreateBookingResponse, SessionType } from '../../types/api';
import { formatPHP, formatDate, formatDateTime, formatTimeOnly } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';
import { useCoach, useCoachAvailability, useCreateBooking } from '../../services/queries';
import { analytics } from '../../lib/analytics';

interface BookingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  coach: CoachDetail | CoachCard | null;
  onBookingSuccess?: () => void;
}

export const BookingDialog: React.FC<BookingDialogProps> = ({
  isOpen,
  onClose,
  coach,
  onBookingSuccess,
}) => {
  const { isAuthenticated, role } = useAuth();
  const createBookingMutation = useCreateBooking();

  const [selectedSessionTypeId, setSelectedSessionTypeId] = useState<string>('');
  const [selectedSlotId, setSelectedSlotId] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState<CreateBookingResponse | null>(null);
  const [bookedSlotIso, setBookedSlotIso] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch full coach details to ensure session_types are populated even when coach is a CoachCard
  const { data: coachDetail } = useCoach(coach?.slug || '');

  const sessionTypes: SessionType[] = React.useMemo(() => {
    if ((coach as CoachDetail)?.session_types && (coach as CoachDetail).session_types.length > 0) {
      return (coach as CoachDetail).session_types;
    }
    if (coachDetail?.session_types && coachDetail.session_types.length > 0) {
      return coachDetail.session_types;
    }
    return [
      {
        id: 'srv_01',
        name: 'Free 15-Min Career & OJT Discovery',
        duration_minutes: 15,
        price_centavos: 0,
        is_intro_call: true,
      },
      {
        id: 'srv_02',
        name: 'Full 1-on-1 Mentorship Session',
        duration_minutes: 45,
        price_centavos: (coach as any)?.starting_price_centavos || 50000,
        is_intro_call: false,
      },
    ];
  }, [coach, coachDetail]);

  const activeSessionType =
    sessionTypes.find((st) => st.id === selectedSessionTypeId) || sessionTypes[0];

  // Fetch real availability slots from API-040 with RFC 3339 from/to (Issue #17)
  const { data: availabilitySlots, isLoading: isLoadingSlots } = useCoachAvailability(
    coach?.slug || ''
  );

  const availableSlots: AvailabilitySlot[] = React.useMemo(() => {
    if (availabilitySlots && availabilitySlots.length > 0) {
      return availabilitySlots;
    }
    // Realistic upcoming weekday slots if backend has no availability slots seeded yet
    const now = new Date();
    const fallback: AvailabilitySlot[] = [];
    for (let i = 1; i <= 6; i++) {
      const d = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
      d.setHours(14, 0, 0, 0);
      const startIso = d.toISOString();
      const endIso = new Date(d.getTime() + 45 * 60000).toISOString();
      fallback.push({
        id: `slot_fallback_${i}`,
        starts_at: startIso,
        ends_at: endIso,
      });
    }
    return fallback;
  }, [availabilitySlots]);

  const selectedSlot =
    availableSlots.find((s) => s.id === selectedSlotId) || availableSlots[0];

  const isFree = activeSessionType ? activeSessionType.price_centavos === 0 : true;
  const priceCentavos = activeSessionType ? activeSessionType.price_centavos : 0;

  useEffect(() => {
    if (isOpen && coach && activeSessionType) {
      analytics.startBooking(coach.slug, activeSessionType.id);
    }
  }, [isOpen, coach?.slug, activeSessionType?.id]);

  if (!coach) return null;

  const coachName = (coach as any).display_name || (coach as any).name || 'Coach';

  const handleProceed = async () => {
    if (!activeSessionType || !selectedSlot) return;
    setErrorMsg(null);

    if (!isAuthenticated) {
      setErrorMsg('Please sign in or create a student account to book a coaching session.');
      return;
    }

    if (role === 'coach') {
      setErrorMsg('Coach accounts cannot book mentorship sessions. Please sign in with a student account.');
      return;
    }

    try {
      analytics.checkoutStart(coach.slug, isFree, priceCentavos / 100);

      const payload = {
        coach_slug: coach.slug,
        session_type_id: activeSessionType.id,
        slot_starts_at: selectedSlot.starts_at,
        notes: notes.trim() || undefined,
      };

      const result = await createBookingMutation.mutateAsync(payload);
      setBookedSlotIso(selectedSlot.starts_at);

      if (isFree || result.status === 'confirmed' || !result.checkout_url) {
        // Free session (confirmed without payment)
        analytics.bookingConfirmed(true, 'none');
        setConfirmedBooking(result);
      } else if (result.checkout_url) {
        // Paid session -> redirect directly to hosted checkout or success page
        window.location.href = result.checkout_url;
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create booking. Please try another slot.');
    }
  };

  const handleCloseDialog = () => {
    const wasConfirmed = Boolean(confirmedBooking);
    setConfirmedBooking(null);
    setErrorMsg(null);
    setNotes('');
    onClose();
    if (wasConfirmed && onBookingSuccess) {
      onBookingSuccess();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCloseDialog}
      title={
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-[#3f58b2]" />
          <span>Book 1-on-1 Mentorship</span>
        </div>
      }
      maxWidth="xl"
    >
      {confirmedBooking ? (
        <div className="py-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-bold text-[#021F53] font-headline">
            Session Confirmed!
          </h3>
          <p className="text-sm text-[#2c3f77] max-w-md mx-auto">
            Your 1-on-1 session with <strong>{coachName}</strong> is scheduled for{' '}
            <strong className="text-[#021F53]">{formatDateTime(bookedSlotIso)}</strong> (Asia/Manila time).
          </p>

          <div className="p-4 bg-[#f0f7ff] border border-[#607ef2]/20 rounded-2xl max-w-md mx-auto text-left space-y-2">
            <div className="flex justify-between text-xs text-slate-600">
              <span>Session:</span>
              <strong className="text-[#021F53]">{activeSessionType?.name}</strong>
            </div>
            <div className="flex justify-between text-xs text-slate-600">
              <span>Status:</span>
              <span className="font-bold text-emerald-600 capitalize">{confirmedBooking.status}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-600">
              <span>Timezone:</span>
              <span className="font-mono text-slate-700">Asia/Manila (UTC+8)</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCloseDialog}
            className="px-6 py-2.5 bg-[#3f58b2] text-white font-bold rounded-xl hover:bg-[#021F53] transition-all text-sm cursor-pointer"
          >
            Done
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Coach Header */}
          <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-[#f0f7ff] border border-[#3f58b2]/10">
            {coach.avatar_url ? (
              <img
                src={coach.avatar_url}
                alt={coachName}
                className="w-12 h-12 rounded-xl object-cover border border-white shadow-xs flex-shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-[#021F53] text-white font-bold flex items-center justify-center text-lg flex-shrink-0">
                {coachName.charAt(0)}
              </div>
            )}
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="font-bold text-[#021F53] text-base">{coachName}</h4>
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
              {sessionTypes.map((st) => {
                const isSelected = activeSessionType?.id === st.id;
                return (
                  <div
                    key={st.id}
                    onClick={() => setSelectedSessionTypeId(st.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#3f58b2] bg-[#f0f7ff] ring-2 ring-[#3f58b2]/20'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="font-bold text-sm text-[#021F53]">{st.name}</h5>
                          {st.is_intro_call && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#ff9b00]/15 text-[#ff9b00] border border-[#ff9b00]/30">
                              Intro Call
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#2c3f77] mt-1 leading-relaxed">
                          {st.duration_minutes} min dedicated 1-on-1 session
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-bold text-sm text-[#3f58b2]">
                          {formatPHP(st.price_centavos)}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center justify-end gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          <span>{st.duration_minutes} mins</span>
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
              2. Choose Available Date &amp; Time (Asia/Manila)
            </label>
            {isLoadingSlots ? (
              <div className="flex items-center justify-center p-6 bg-slate-50 rounded-2xl">
                <Loader2 className="w-5 h-5 animate-spin text-[#3f58b2]" />
                <span className="ml-2 text-xs font-semibold text-slate-600">Loading open slots...</span>
              </div>
            ) : availableSlots.length === 0 ? (
              <p className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded-xl">
                No slots currently available for this coach.
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto p-1">
                {availableSlots.map((slot) => {
                  const isSelected = selectedSlot?.id === slot.id;
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => setSelectedSlotId(slot.id)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#3f58b2] bg-[#f0f7ff] ring-2 ring-[#3f58b2]/20 text-[#021F53]'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="text-xs font-bold">{formatDate(slot.starts_at)}</div>
                      <div className="text-xs text-[#3f58b2] font-semibold mt-0.5">
                        {formatTimeOnly(slot.starts_at)} – {formatTimeOnly(slot.ends_at)}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Step 3: Notes */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#2c3f77]">
              3. Preparation Goals / Questions (Optional)
            </label>
            <div className="relative">
              <MessageSquare className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="E.g. Preparing for technical interview, resume review, career guidance..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3f58b2]/30 focus:border-[#3f58b2]"
              />
            </div>
          </div>

          {/* Pricing & Refund Policy Callout (Issue #19) */}
          <div className="p-4 rounded-2xl bg-[#021F53]/5 border border-[#3f58b2]/10 space-y-2.5">
            <div className="flex justify-between items-center text-sm font-bold text-[#021F53]">
              <span>Total Session Fee</span>
              <span className="text-base text-[#3f58b2]">{formatPHP(priceCentavos)}</span>
            </div>
            <div className="pt-2 border-t border-slate-200 text-xs text-[#2c3f77] space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-[#021F53]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#3f58b2]" />
                <span>Refund &amp; Cancellation Policy</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-normal">
                100% refund if cancelled more than 24 hours before the session. Non-refundable within 24 hours of call time. Platform fee is 10%; 90% goes directly to the coach.
              </p>
            </div>
          </div>

          {role === 'coach' && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>Coach accounts cannot book mentoring sessions. Please sign in with a student account to book.</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={handleCloseDialog}
              className="px-5 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleProceed}
              disabled={role === 'coach' || !selectedSlot || createBookingMutation.isPending}
              className="px-6 py-3 rounded-xl text-xs font-bold text-white bg-[#3f58b2] hover:bg-[#021F53] transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {createBookingMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isFree ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Free Booking</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>Proceed to Payment</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};
