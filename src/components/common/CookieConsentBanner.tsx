import React, { useState, useEffect } from 'react';
import { ShieldCheck, Cookie } from 'lucide-react';
import { getStoredConsent, setStoredConsent } from '../../lib/analytics';

interface CookieConsentBannerProps {
  navigate?: (path: string) => void;
}

export const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({ navigate: propNavigate }) => {
  const navigate = propNavigate ?? ((path: string) => { if (typeof window !== 'undefined') { window.history.pushState({}, '', path); window.dispatchEvent(new PopStateEvent('popstate')); } });
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
      className="fixed bottom-3 right-3 left-3 sm:left-auto sm:right-4 sm:max-w-[300px] bg-white rounded-xl p-3 border border-slate-200/90 shadow-lift z-50 animate-fadeIn space-y-2"
    >
      <div className="flex items-start gap-2">
        <Cookie className="w-3.5 h-3.5 text-[#2563eb] shrink-0 mt-0.5" />
        <p className="text-[10px] text-slate-600 leading-snug flex-1">
          We use analytics to improve your experience. Read our{' '}
          <button
            type="button"
            onClick={() => navigate('/privacy')}
            className="text-[#1d4ed8] underline font-medium hover:text-[#021F53] cursor-pointer"
          >
            Privacy Policy
          </button>.
        </p>
      </div>

      <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-slate-100">
        <button
          type="button"
          onClick={handleDecline}
          className="px-2 py-1 rounded-md text-[10px] font-semibold text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          Decline
        </button>
        <button
          type="button"
          onClick={handleAccept}
          className="px-2.5 py-1 rounded-md text-[10px] font-bold text-white bg-[#021F53] hover:bg-[#1d4ed8] shadow-2xs transition-colors cursor-pointer"
        >
          Accept Analytics
        </button>
      </div>
    </div>
  );
};
