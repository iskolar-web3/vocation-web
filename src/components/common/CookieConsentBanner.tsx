import React, { useState, useEffect } from 'react';
import { ShieldCheck, Cookie } from 'lucide-react';
import { getStoredConsent, setStoredConsent } from '../../lib/analytics';

interface CookieConsentBannerProps {
  navigate: (path: string) => void;
}

export const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({ navigate }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = getStoredConsent();
    if (consent === null) {
      setIsVisible(true);
    }
  }, []);

  if (!isVisible) return null;

  const handleAccept = () => {
    setStoredConsent('granted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    setStoredConsent('denied');
    setIsVisible(false);
  };

  return (
    <div
      role="region"
      aria-label="Cookie consent banner"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md bg-white rounded-2xl p-5 border border-slate-200 shadow-soft z-50 animate-fadeIn"
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-[#f0f7ff] border border-[#607ef2]/20 flex items-center justify-center text-[#3f58b2] shrink-0 mt-0.5">
          <Cookie className="w-4 h-4 text-[#ff9b00]" />
        </div>
        <div className="space-y-1.5 flex-1">
          <h4 className="text-xs font-bold text-[#021F53] font-headline">
            Cookie &amp; Analytics Consent
          </h4>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            We use privacy-friendly Google Analytics with Consent Mode to track booking funnel performance without storing personal data. Read our{' '}
            <button
              type="button"
              onClick={() => navigate('/privacy')}
              className="text-[#3f58b2] underline font-semibold hover:text-[#021F53] cursor-pointer"
            >
              Privacy Policy
            </button>.
          </p>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={handleDecline}
          className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          Decline
        </button>
        <button
          type="button"
          onClick={handleAccept}
          className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-[#021F53] hover:bg-[#002774] shadow-xs transition-colors cursor-pointer"
        >
          Accept Analytics
        </button>
      </div>
    </div>
  );
};
