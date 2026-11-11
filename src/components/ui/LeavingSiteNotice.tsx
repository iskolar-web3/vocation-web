import { ArrowUpRight, ExternalLink } from 'lucide-react';
import { Fragment, useId } from 'react';
import { Dialog, DialogClose } from './dialog';

/* BR-001: apply is an outbound redirect; the platform stores no application.
   M16: once per open, a dotted path draws from the Vocation mark to the domain chip
   (stroke-dashoffset through a mask, 500ms; CSS .leave-draw). */

const isHttp = (u: string) => /^https?:\/\//i.test(u);
const domainOf = (u: string): string => {
  try {
    return new URL(u).hostname.replace(/^www\./, '');
  } catch {
    return u;
  }
};

export interface LeavingSiteNoticeProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postingTitle: string;
  companyName: string;
  /** The company's own apply URL. The notice opens it itself, in a new tab, noopener. */
  url?: string | null;
  /** URL still being fetched: disables Continue. */
  loading?: boolean;
  /** Runs when the student continues (record the apply click here). */
  onContinue?: () => void;
}

export function LeavingSiteNotice({
  open,
  onOpenChange,
  postingTitle,
  companyName,
  url,
  loading,
  onContinue,
}: LeavingSiteNoticeProps) {
  const mask = `leave-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const domain = url ? domainOf(url) : companyName;

  const go = () => {
    if (url && isHttp(url)) window.open(url, '_blank', 'noopener,noreferrer');
    onContinue?.();
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Leaving Vocation for ${domain}`}
      hideTitle
      actions={
        <>
          <DialogClose className="btn btn-ghost">Stay on Vocation</DialogClose>
          <button
            type="button"
            className="btn btn-primary h-auto min-h-12 whitespace-normal py-3 text-center"
            onClick={go}
            disabled={loading && !url}
            autoFocus
          >
            {loading && !url ? (
              'Loading link…'
            ) : (
              <>
                Continue to {domain}
                <ArrowUpRight aria-hidden="true" />
              </>
            )}
          </button>
        </>
      }
    >
      <div style={{ display: 'grid', gap: 18 }}>
        <div>
          <p className="t-meta">You’re heading to</p>
          <div className="leave-line" style={{ marginTop: 10 }}>
            <span className="mono mono-2" aria-hidden="true">
              <img src="/vocation-logo.svg" alt="" width={28} height={28} style={{ filter: 'brightness(0) invert(1)' }} />
            </span>
            <svg className="leave-path" aria-hidden="true" focusable="false">
              <defs>
                <mask id={mask} maskUnits="userSpaceOnUse" x="0" y="0" width="100%" height="24">
                  <line className="leave-draw" x1="0" y1="12" x2="100%" y2="12" stroke="#fff" strokeWidth="6" pathLength="1" />
                </mask>
              </defs>
              <line
                x1="2"
                y1="12"
                x2="100%"
                y2="12"
                stroke="var(--link)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="0 7"
                mask={`url(#${mask})`}
              />
            </svg>
            <span className="leave-chip">
              <ExternalLink aria-hidden="true" />
              <span>
                {domain.split('.').map((part, i) => (
                  <Fragment key={i}>
                    {i > 0 ? (
                      <>
                        .<wbr />
                      </>
                    ) : null}
                    {part}
                  </Fragment>
                ))}
              </span>
            </span>
          </div>
        </div>
        <p className="t-body">
          You’ll apply for <b style={{ color: 'var(--tx)', fontWeight: 400, fontFamily: 'var(--f-display)' }}>{postingTitle}</b> on{' '}
          {companyName}’s own site. Vocation doesn’t see or store your application.
        </p>
        <p className="t-small">Have your resume ready. Good luck. You’ve prepped for this.</p>
      </div>
    </Dialog>
  );
}
