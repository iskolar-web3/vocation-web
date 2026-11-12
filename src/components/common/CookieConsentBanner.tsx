import { useEffect, useState } from 'react';
import { getStoredConsent, setStoredConsent } from '../../lib/analytics';
import { SiteLink } from '../layout/shell';

/* Small glass card, bottom-left on desktop; on phones it floats above the tab bar (see shell.css). */
export function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (getStoredConsent() === null) setIsVisible(true);
  }, []);

  if (!isVisible) return null;

  const choose = (value: 'granted' | 'denied') => {
    setStoredConsent(value);
    setIsVisible(false);
  };

  return (
    <section className="sh-cookie glass" aria-label="Cookie consent">
      <p>
        We use analytics to improve Vocation. Details are in our{' '}
        <SiteLink to="/privacy" className="link-btn" style={{ display: 'inline', minHeight: 0 }}>
          Privacy Policy
        </SiteLink>
        .
      </p>
      <div className="sh-cookie-actions">
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => choose('denied')}>
          Decline
        </button>
        <button type="button" className="btn btn-primary btn-sm" onClick={() => choose('granted')}>
          Accept analytics
        </button>
      </div>
    </section>
  );
}
