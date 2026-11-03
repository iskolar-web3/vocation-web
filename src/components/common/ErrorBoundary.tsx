import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, MessageSquareWarning } from 'lucide-react';
import { captureException, openFeedbackDialog } from '../../lib/sentry';

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
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    captureException(error, { componentStack: errorInfo.componentStack });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-[#f0f7ff]">
          <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-slate-200 shadow-soft text-center space-y-6">
            <div className="w-14 h-14 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-center mx-auto text-rose-600 shadow-2xs">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Error S-091 · Unexpected Render Fault
              </span>
              <h1 className="text-2xl font-bold text-[#021F53] font-display">
                Something went wrong
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                We've captured this issue with telemetry so our team can resolve it. Please try reloading or report what happened.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-left text-[11px] font-mono text-slate-700 overflow-x-auto max-h-24">
                {this.state.error.message}
              </div>
            )}

            <div className="pt-2 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={this.handleReload}
                className="tactile-btn-primary w-full py-3 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Application</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={this.handleGoHome}
                  className="py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>Back to Home</span>
                </button>

                <button
                  type="button"
                  onClick={openFeedbackDialog}
                  className="py-2.5 bg-[#f0f7ff] hover:bg-[#e0efff] text-[#3f58b2] font-bold text-xs rounded-xl border border-[#607ef2]/20 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <MessageSquareWarning className="w-3.5 h-3.5 text-[#2563eb]" />
                  <span>Report Problem</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
