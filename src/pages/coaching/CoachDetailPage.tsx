import { Link } from '@tanstack/react-router';
import { ArrowLeft, Star } from 'lucide-react';
import { useState } from 'react';
import {
  BookingBody,
  BookingFoot,
  type BookingState,
  useBooking,
  useIsDesktop,
} from '../../components/coaching/Booking';
import { Disc, Empty, Sheet, Skeleton, Stars, coachFromPrice } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { formatDate, formatPHP } from '../../lib/utils';
import { useCoach, useCoachReviews } from '../../services/queries';
import type { CoachDetail } from '../../types/api';
import '../../components/coaching/coaching.css';

interface CoachDetailPageProps {
  slug: string;
  navigate: (path: string) => void;
}

const firstName = (name: string) => name.trim().split(/\s+/)[0] ?? '';

export function CoachDetailPage({ slug, navigate }: CoachDetailPageProps) {
  const { data: coach, isLoading } = useCoach(slug);

  if (isLoading) {
    return (
      <div className="wrap" style={{ paddingBlock: 56 }} aria-busy="true">
        <div style={{ display: 'grid', justifyItems: 'center', gap: 14 }}>
          <Skeleton variant="circle" width={128} height={128} />
          <Skeleton width={240} height={32} />
          <Skeleton width={320} height={16} />
        </div>
      </div>
    );
  }

  if (!coach) {
    return (
      <div className="wrap" style={{ paddingBlock: 72 }}>
        <div className="panel panel-pad" style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center', display: 'grid', gap: 14, justifyItems: 'center' }}>
          <h1 className="t-h1">Coach not found</h1>
          <p className="t-body">This profile may have been archived, or the link is off. Browse the directory to find someone else.</p>
          <button type="button" className="btn btn-primary" onClick={() => navigate('/coaches')}>
            Browse coaches
          </button>
        </div>
      </div>
    );
  }

  return <CoachProfile coach={coach} navigate={navigate} />;
}

function CoachProfile({ coach, navigate }: { coach: CoachDetail; navigate: (path: string) => void }) {
  const { role, user } = useAuth();
  const { data: reviews = [] } = useCoachReviews(coach.slug);
  const b = useBooking(coach);
  const desktop = useIsDesktop();
  const [sheetOpen, setSheetOpen] = useState(false);

  const isOwn = role === 'coach' && user?.full_name === coach.display_name;
  const canBook = role !== 'coach';
  const sessions = coach.session_types ?? [];

  const choose = (id: string) => {
    b.setSession(id);
    if (!desktop) setSheetOpen(true);
  };

  return (
    <div className="cp">
      <header className="cp-head wrap">
        <Link to="/coaches" className="link-btn cp-back">
          <ArrowLeft aria-hidden="true" /> All coaches
        </Link>
        <Disc name={coach.display_name} src={coach.avatar_url} size="xl" />
        <h1 className="t-h1">{coach.display_name}</h1>
        <p className="t-lede">{coach.headline}</p>
        <Stars coach={coach} />
        {coach.expertise.length ? (
          <div className="tags">
            {coach.expertise.map((e) => (
              <span className="tag" key={e}>
                {e}
              </span>
            ))}
          </div>
        ) : null}
      </header>

      <div className="wrap cp-layout">
        <div className="cp-main">
          <section>
            <h2 className="t-h2">About</h2>
            <p className="t-body measure" style={{ whiteSpace: 'pre-line' }}>
              {coach.bio}
            </p>
            {coach.experience ? (
              <p className="t-body measure" style={{ marginTop: 12 }}>
                {coach.experience}
              </p>
            ) : null}
            {coach.languages?.length ? <p className="t-small" style={{ marginTop: 12 }}>Speaks {coach.languages.join(', ')}</p> : null}
          </section>

          <section>
            <h2 className="t-h2">Sessions</h2>
            {sessions.length ? (
              <div className="panel">
                {sessions.map((s) => {
                  const soon = s.price_centavos > 0 && !b.checkoutEnabled;
                  return (
                    <div className="cp-srow" key={s.id}>
                      <div>
                        <h3>
                          {s.name}
                          <span className="min num">{s.duration_minutes} min</span>
                        </h3>
                        {s.is_intro_call ? <p className="t-small">Intro call</p> : null}
                      </div>
                      <div className="r">
                        <span className="pr">{formatPHP(s.price_centavos)}</span>
                        {soon ? (
                          <span className="soon">Paid sessions are coming soon</span>
                        ) : canBook ? (
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            aria-pressed={b.sessionId === s.id}
                            aria-label={`Choose ${s.name}`}
                            onClick={() => choose(s.id)}
                          >
                            Choose
                          </button>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <Empty title="No sessions yet" body="This coach has not published any sessions." />
            )}
          </section>

          <section>
            <h2 className="t-h2">What students say</h2>
            {reviews.length ? (
              <div className="panel">
                {reviews.map((r, i) => (
                  <div className="cp-rev" key={`${r.created_at}-${i}`}>
                    <div className="by">
                      {r.reviewer_first_name ? firstName(r.reviewer_first_name) : null}
                      <span className="stars">
                        <Star aria-hidden="true" />
                        <span className="num">{r.rating}.0</span>
                      </span>
                      <span className="when">{formatDate(r.created_at)}</span>
                    </div>
                    {r.body ? <p>{r.body}</p> : null}
                  </div>
                ))}
              </div>
            ) : (
              <Empty icon={Star} title="No reviews yet" body="Reviews show up here after students finish a session." />
            )}
          </section>
        </div>

        {desktop ? (
          <aside className="cp-aside panel" aria-label="Book a session">
            {isOwn ? (
              <div className="bk">
                <h2>Your profile</h2>
                <button type="button" className="btn btn-secondary" onClick={() => navigate('/coach')}>
                  Manage in coach portal
                </button>
              </div>
            ) : (
              <>
                <BookingBody b={b} pfx="p" heading />
                <div className="bk-panel-foot">
                  <BookingFoot b={b} pfx="p" />
                </div>
              </>
            )}
          </aside>
        ) : null}
      </div>

      {!desktop && !isOwn && canBook ? (
        <>
          <MobileBar b={b} price={coachFromPrice(coach)} onOpen={() => setSheetOpen(true)} />
          <Sheet
            open={sheetOpen}
            onOpenChange={setSheetOpen}
            title="Book a session"
            footer={<BookingFoot b={b} pfx="s" />}
          >
            <BookingBody b={b} pfx="s" />
          </Sheet>
        </>
      ) : null}
    </div>
  );
}

function MobileBar({ b, price, onOpen }: { b: BookingState; price: string; onOpen: () => void }) {
  return (
    <div className="bk-bar">
      <div className="t">{b.done ? 'You’re booked.' : price}</div>
      {b.done ? (
        <Link to="/app/bookings" className="btn btn-primary">
          See my bookings
        </Link>
      ) : (
        <button type="button" className="btn btn-primary" onClick={onOpen}>
          Book a session
        </button>
      )}
    </div>
  );
}
