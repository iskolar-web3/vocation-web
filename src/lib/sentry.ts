import * as Sentry from '@sentry/react';

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;

export function initSentry() {
  if (!SENTRY_DSN) {
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: import.meta.env.MODE || 'development',
    // Scrub personal data (ADR-0032 / Issue #20)
    beforeSend(event) {
      if (event.user) {
        delete event.user.email;
        delete event.user.ip_address;
        delete event.user.username;
      }
      if (event.request?.headers) {
        delete (event.request.headers as any).authorization;
        delete (event.request.headers as any).cookie;
      }
      // Scrub any personal email addresses from error messages or breadcrumbs
      if (event.breadcrumbs) {
        event.breadcrumbs = event.breadcrumbs.map((crumb) => {
          if (crumb.data && typeof crumb.data === 'object') {
            const sanitized = { ...crumb.data };
            delete (sanitized as any).email;
            delete (sanitized as any).password;
            return { ...crumb, data: sanitized };
          }
          return crumb;
        });
      }
      return event;
    },
  });
}

export function captureException(error: unknown, context?: Record<string, any>) {
  if (SENTRY_DSN) {
    Sentry.captureException(error, { extra: context });
  } else {
    console.error('[Error Captured]:', error, context);
  }
}

export function openFeedbackDialog() {
  // If Sentry is initialized, trigger Sentry user feedback dialog if available
  try {
    const feedback = Sentry.getFeedback();
    if (feedback && typeof (feedback as any).openDialog === 'function') {
      (feedback as any).openDialog();
      return;
    }
  } catch {
    // Sentry feedback not active, fallback
  }

  // Fallback to in-app feedback modal
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('app:open_feedback'));
  }
}
