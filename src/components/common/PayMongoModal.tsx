import React, { useState } from 'react';
import { CreditCard, CheckCircle2, Loader2, Lock, Shield, Smartphone, Clock } from 'lucide-react';
import { Modal } from './Modal';
import { Booking } from '../../types';
import { formatPHP, formatDateTime } from '../../lib/utils';
import { useData } from '../../context/DataContext';

interface PayMongoModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  onSuccess?: () => void;
}

export const PayMongoModal: React.FC<PayMongoModalProps> = ({
  isOpen,
  onClose,
  booking,
  onSuccess,
}) => {
  const { confirmPayment } = useData();
  const [paymentMethod, setPaymentMethod] = useState<'gcash' | 'maya' | 'card'>('gcash');
  const [mobileNumber, setMobileNumber] = useState('0917 123 4567');
  const [cardNumber, setCardNumber] = useState('4123 4567 8901 2345');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!booking) return null;

  const handlePay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      confirmPayment(booking.id);
      setIsProcessing(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
        if (onSuccess) onSuccess();
      }, 1500);
    }, 1800);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={isProcessing ? () => {} : onClose}
      title={
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#021F53] flex items-center justify-center text-white font-black text-xs">
            PM
          </div>
          <span className="text-[#021F53]">PayMongo Secure Checkout</span>
        </div>
      }
      maxWidth="lg"
    >
      {isSuccess ? (
        <div className="py-10 text-center space-y-4 animate-scaleUp">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-bold text-[#021F53] font-headline">
            Payment Confirmed!
          </h3>
          <p className="text-sm text-[#2c3f77] max-w-sm mx-auto">
            Your coaching session with <strong>{booking.coachName}</strong> has been confirmed. A Google Meet link has been generated for you.
          </p>
          <div className="inline-block bg-[#f0f7ff] border border-[#607ef2]/20 px-4 py-2 rounded-full text-xs font-semibold text-[#3f58b2]">
            Redirecting to your bookings...
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Booking Summary */}
          <div className="p-4 rounded-2xl bg-[#f0f7ff] border border-[#3f58b2]/15 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#3f58b2]">
                Session Summary
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                Pending Payment
              </span>
            </div>
            <div>
              <h4 className="font-bold text-[#021F53] text-base">{booking.sessionTypeName}</h4>
              <p className="text-xs text-[#2c3f77] mt-0.5">
                with <strong>{booking.coachName}</strong> ({booking.sessionDuration} mins)
              </p>
              <p className="text-xs text-[#3f58b2] font-semibold mt-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>{formatDateTime(booking.slotStartsAt)}</span>
              </p>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#2c3f77]">
              Choose Payment Method
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('gcash')}
                className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all ${
                  paymentMethod === 'gcash'
                    ? 'border-[#0055ff] bg-blue-50/50 shadow-sm ring-2 ring-[#0055ff]/20'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-[#0055ff] text-white flex items-center justify-center font-bold text-xs">
                  G
                </div>
                <span className="text-xs font-bold text-[#021F53]">GCash</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('maya')}
                className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all ${
                  paymentMethod === 'maya'
                    ? 'border-[#00b050] bg-emerald-50/50 shadow-sm ring-2 ring-[#00b050]/20'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-[#00b050] text-white flex items-center justify-center font-bold text-xs">
                  M
                </div>
                <span className="text-xs font-bold text-[#021F53]">Maya</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all ${
                  paymentMethod === 'card'
                    ? 'border-[#3f58b2] bg-[#f0f7ff] shadow-sm ring-2 ring-[#3f58b2]/20'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-[#3f58b2] text-white flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-[#021F53]">Card / Debit</span>
              </button>
            </div>
          </div>

          {/* Payment Details Input */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            {paymentMethod === 'gcash' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  GCash Registered Mobile Number
                </label>
                <div className="relative">
                  <Smartphone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="0917 123 4567"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0055ff]/30 focus:border-[#0055ff]"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  You will receive a PayMongo OTP via SMS to complete authorization.
                </p>
              </div>
            )}

            {paymentMethod === 'maya' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Maya Account Mobile Number
                </label>
                <div className="relative">
                  <Smartphone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="0918 987 6543"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00b050]/30 focus:border-[#00b050]"
                  />
                </div>
              </div>
            )}

            {paymentMethod === 'card' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Card Number
                  </label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="4123 4567 8901 2345"
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3f58b2]/30 focus:border-[#3f58b2]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Expiry (MM/YY)
                    </label>
                    <input
                      type="text"
                      defaultValue="08/28"
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      CVV / CVC
                    </label>
                    <input
                      type="password"
                      defaultValue="123"
                      maxLength={4}
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Pricing & BR-008 Platform Split Breakdown */}
          <div className="p-4 rounded-2xl bg-[#021F53]/5 border border-[#3f58b2]/10 space-y-2 text-xs">
            <div className="flex justify-between text-[#2c3f77]">
              <span>Session Fee</span>
              <span className="font-semibold">{formatPHP(booking.priceCentavos)}</span>
            </div>
            <div className="flex justify-between text-slate-500 text-[11px]">
              <span>Coach Payout (95%)</span>
              <span>{formatPHP(booking.coachPayoutCentavos)}</span>
            </div>
            <div className="flex justify-between text-slate-500 text-[11px]">
              <span>Platform Take Fee (5% iSkolar commission)</span>
              <span>{formatPHP(booking.platformFeeCentavos)}</span>
            </div>
            <div className="pt-2 border-t border-[#3f58b2]/15 flex justify-between items-center text-sm font-bold text-[#021F53]">
              <span>Total Amount Due</span>
              <span className="text-base text-[#3f58b2]">{formatPHP(booking.priceCentavos)}</span>
            </div>
          </div>

          {/* Action Button */}
          <button
            type="button"
            onClick={handlePay}
            disabled={isProcessing}
            className="w-full py-3.5 px-6 rounded-full bg-[#3f58b2] hover:bg-[#021F53] text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Processing PayMongo Gateway...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Pay {formatPHP(booking.priceCentavos)} with PayMongo</span>
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-2 text-[11px] text-[#2c3f77]/70">
            <Shield className="w-3.5 h-3.5 text-[#3f58b2]" />
            <span>256-bit encrypted checkout via PayMongo Payments Philippines</span>
          </div>
        </div>
      )}
    </Modal>
  );
};
