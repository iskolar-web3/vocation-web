import { RefreshCw } from 'lucide-react';

interface MaintenanceScreenProps {
  onRetry?: () => void;
  navigate?: (path: string) => void;
}

export function MaintenanceScreen({ onRetry, navigate }: MaintenanceScreenProps) {
  return (
    <div className="sh-screen">
      <div className="panel sh-screen-card">
        <h1 className="t-h2">Vocation is down for maintenance</h1>
        <p className="t-body muted">
          We are making updates and expect to be back shortly. Your bookings and saved roles are not affected.
        </p>
        <p className="t-small muted">
          Need help right now? Email{' '}
          <a href="mailto:support@iskolar.io" className="link-btn">
            support@iskolar.io
          </a>
          .
        </p>
        <div className="sh-screen-actions">
          {onRetry ? (
            <button type="button" className="btn btn-primary" onClick={onRetry}>
              <RefreshCw aria-hidden="true" />
              Try again
            </button>
          ) : null}
          {navigate ? (
            <button type="button" className="btn btn-ghost" onClick={() => navigate('/')}>
              Back to home
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
