// Google Analytics 4 with strict Consent Mode (Issue #22)

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
  }
}

const CONSENT_STORAGE_KEY = 'vocation_analytics_consent';

export function getStoredConsent(): 'granted' | 'denied' | null {
  try {
    const val = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (val === 'granted' || val === 'denied') return val;
  } catch {
    // localStorage not accessible
  }
  return null;
}

export function setStoredConsent(status: 'granted' | 'denied') {
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, status);
  } catch {
    // localStorage not accessible
  }

  if (status === 'granted') {
    enableAnalytics();
  } else {
    disableAnalytics();
  }
}

export function initAnalytics() {
  if (typeof window === 'undefined') return;

  window.dataLayer = window.dataLayer || [];
  function gtag(...args: any[]) {
    window.dataLayer.push(args);
  }
  window.gtag = gtag;

  // Default: Deny analytics storage prior to consent (Google Consent Mode v2)
  gtag('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  });

  const stored = getStoredConsent();
  if (stored === 'granted') {
    enableAnalytics();
  }
}

function enableAnalytics() {
  if (typeof window === 'undefined' || !GA_MEASUREMENT_ID) return;

  if (window.gtag) {
    window.gtag('consent', 'update', {
      analytics_storage: 'granted',
    });
  }

  // Load GA script if not already present
  const scriptId = 'ga4-gtag-script';
  if (!document.getElementById(scriptId)) {
    const script = document.createElement('script');
    script.id = scriptId;
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    if (window.gtag) {
      window.gtag('js', new Date());
      window.gtag('config', GA_MEASUREMENT_ID, {
        send_page_view: true,
        anonymize_ip: true,
      });
    }
  }
}

function disableAnalytics() {
  if (typeof window === 'undefined') return;
  if (window.gtag) {
    window.gtag('consent', 'update', {
      analytics_storage: 'denied',
    });
  }
}

// Funnel Events with Zero Personal Data (Issue #22)
export const analytics = {
  viewCoach(coachSlug: string, priceType: string) {
    if (window.gtag && getStoredConsent() === 'granted') {
      window.gtag('event', 'view_coach', {
        coach_slug: coachSlug,
        price_type: priceType,
      });
    }
  },

  startBooking(coachSlug: string, sessionTypeId: string) {
    if (window.gtag && getStoredConsent() === 'granted') {
      window.gtag('event', 'start_booking', {
        coach_slug: coachSlug,
        session_type_id: sessionTypeId,
      });
    }
  },

  checkoutStart(coachSlug: string, isFree: boolean, pricePesos: number) {
    if (window.gtag && getStoredConsent() === 'granted') {
      window.gtag('event', 'checkout_start', {
        coach_slug: coachSlug,
        is_free: isFree,
        price_pesos: pricePesos,
      });
    }
  },

  bookingConfirmed(isFree: boolean, paymentStatus: string) {
    if (window.gtag && getStoredConsent() === 'granted') {
      window.gtag('event', 'booking_confirmed', {
        is_free: isFree,
        payment_status: paymentStatus,
      });
    }
  },
};
