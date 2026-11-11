import { RefreshCw } from 'lucide-react';
import { Component, type ErrorInfo, type ReactNode, useState } from 'react';
import { captureException } from '../../lib/sentry';
import { FeedbackModal } from './FeedbackModal';

/** Full-screen "Something went wrong". Shared by the React boundary and the router's errorComponent. */
export function ErrorScreen({ message }: { message?: string }) {
  const [feedback, setFeedback] = useState(false);
  return (
    <div className="sh-screen">
      <div className="panel sh-screen-card" role="alert">
        <h1 className="t-h2">Something went wrong</h1>
        <p className="t-body muted">
          This page hit an error. Reload to try again. If it keeps happening, tell us what you were doing.
        </p>
        {import.meta.env.DEV && message ? <pre className="note is-bad t-small" style={{ overflowX: 'auto' }}>{message}</pre> : null}
        <div className="sh-screen-actions">
          <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>
            <RefreshCw aria-hidden="true" />
            Reload page
          </button>
          <a href="/" className="btn btn-ghost">
            Back to home
          </a>
          <button type="button" className="btn btn-ghost" onClick={() => setFeedback(true)}>
            Report a problem
          </button>
        </div>
      </div>
      <FeedbackModal isOpen={feedback} onClose={() => setFeedback(false)} />
    </div>
  );
}

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  navigate?: (path: string) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false, error: null };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    captureException(error, { componentStack: errorInfo.componentStack });
  }

  public render() {
    if (!this.state.hasError) return this.props.children;
    return this.props.fallback ?? <ErrorScreen message={this.state.error?.message} />;
  }
}
