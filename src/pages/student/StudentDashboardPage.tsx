import { SiteLink } from '../../components/layout/shell';
import { AlertCircle, Bookmark, Calendar, Clock, Video } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { ComingSoonBadge } from '../../components/common/ComingSoonBadge';
import { type BookingX, CancelBookingDialog } from '../../components/student/CancelBookingDialog';
import { Progress } from '../../components/student/forms';
import { ProfileMeter, completenessItems } from '../../components/student/ProfileMeter';
import { Dialog, Disc, Empty, OjtCalculator, PostingRow, Skeleton, Status, daysUntil, toast } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { formatDateTime, formatPHP, MANILA_TZ } from '../../lib/utils';
import {
  useFeatures,
  useInternships,
  useResumeCheckout,
  useSavedInternships,
  useStudentBookings,
  useStudentDashboard,
  useStudentProfile,
} from '../../services/queries';

interface StudentDashboardPageProps {
  navigate: (path: string) => void;
}

const today = () =>
  new Intl.DateTimeFormat('en-PH', { timeZone: MANILA_TZ, weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());

export const StudentDashboardPage: React.FC<StudentDashboardPageProps> = ({ navigate }) => {
  const { user, role } = useAuth();
  const enabled = role === 'student';
  const dashboard = useStudentDashboard({ enabled });
  const { data: profile } = useStudentProfile({ enabled });
  const saved = useSavedInternships({ enabled });
  const bookingsQ = useStudentBookings('upcoming', { enabled });
  const { data: internshipsData, isLoading: loadingRoles } = useInternships();
  const resumeCheckout = useResumeCheckout();
  const features = useFeatures();

  const [calcOpen, setCalcOpen] = useState(false);
  const [cancelling, setCancelling] = useState<BookingX | null>(null);

  const bookings = useMemo(
    () => [...((bookingsQ.data ?? []) as BookingX[])].sort((a, b) => a.slot_starts_at.localeCompare(b.slot_starts_at)),
    [bookingsQ.data]
  );
  const next = bookings.find((b) => b.status === 'confirmed');
  const pending = bookings.find((b) => b.status === 'pending');

  const savedList = useMemo(
    () => [...(saved.data ?? [])].sort((a, b) => (a.deadline ?? '9999').localeCompare(b.deadline ?? '9999')),
    [saved.data]
  );

  // Roles for you: unsaved roles first matching a listed skill, else the first few.
  const roles = useMemo(() => {
    const savedIds = new Set((saved.data ?? []).map((s) => s.id));
    const skills = profile?.skills ?? [];
    const all = (internshipsData?.items ?? []).filter((i) => !savedIds.has(i.id));
    const hit = (i: (typeof all)[number]) =>
      skills.find((s) => `${i.title} ${i.field ?? ''}`.toLowerCase().includes(s.toLowerCase()));
    const scored = all.map((i) => ({ i, skill: hit(i) }));
    return [...scored.filter((x) => x.skill), ...scored.filter((x) => !x.skill)].slice(0, 3);
  }, [internshipsData, saved.data, profile?.skills]);

  const pct = dashboard.data?.completeness_pct ?? (user?.is_onboarded ? 85 : 40);
  const items = profile
    ? completenessItems(profile).filter((i) => features.uploads || (i.key !== 'photo' && i.key !== 'resume'))
    : undefined;

  const target = profile?.target_ojt_hours ?? null;
  const done = profile?.completed_ojt_hours ?? 0;
  const remaining = target ? Math.max(0, target - done) : 0;
  const ojtPct = target ? (done / target) * 100 : 0;
  const firstName = user?.full_name?.replace(/^(engr|dr|atty|arch|prof|mr|ms|mrs)\.?\s+/i, '').split(' ')[0] || 'there';

  const finishPaying = async (bookingId: string) => {
    try {
      const res = await resumeCheckout.mutateAsync(bookingId);
      if (res?.checkout_url) {
        window.location.href = res.checkout_url;
        return;
      }
    } catch (err: any) {
      toast.error(err.message || 'We couldn’t open checkout. Your booking is in Bookings.');
    }
    navigate('/app/bookings');
  };

  const failed = dashboard.isError || bookingsQ.isError;
  const retry = () => {
    void dashboard.refetch();
    void bookingsQ.refetch();
    void saved.refetch();
  };

  const nextDays = next ? daysUntil(next.slot_starts_at) : 0;
  const mins = next ? Math.round((new Date(next.slot_ends_at).getTime() - new Date(next.slot_starts_at).getTime()) / 60000) : 0;
  const session = (b: BookingX) => b.session_type_name || 'Coaching session';

  return (
    <div className="wrap py-6 min-[721px]:py-10">
      <header className="mb-5">
        <h1 className="t-h1">Hi, {firstName}</h1>
        <p className="t-body muted mt-1.5">{today()}</p>
      </header>

      {failed ? (
        <div className="mb-5 grid justify-items-start gap-3">
          <div className="note is-bad" role="alert">
            <AlertCircle aria-hidden="true" />
            <span>We couldn’t load everything. Check your connection and try again.</span>
          </div>
          <button type="button" className="btn btn-secondary btn-sm" onClick={retry}>
            Try again
          </button>
        </div>
      ) : null}

      {pending ? (
        <div className="mb-5">
          <div className="note is-warn">
            <Clock aria-hidden="true" />
            <div>
              <b>
                Your {session(pending).toLowerCase()} with {pending.coach_display_name} isn’t booked yet.
              </b>{' '}
              Finish paying <span className="num">{formatPHP(pending.amount_due_centavos ?? pending.price_centavos)}</span> to keep{' '}
              <span className="num">{formatDateTime(pending.slot_starts_at)}</span>.
              <div className="mt-3 flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  className="btn btn-brand btn-sm max-[720px]:!h-11"
                  disabled={resumeCheckout.isPending || !features.checkout}
                  onClick={() => finishPaying(pending.booking_id)}
                >
                  {resumeCheckout.isPending ? 'Opening checkout…' : 'Finish paying'}
                </button>
                {!features.checkout ? <ComingSoonBadge /> : null}
                <button type="button" className="btn btn-secondary btn-sm max-[720px]:!h-11" onClick={() => setCancelling(pending)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="grid items-stretch gap-5 min-[1025px]:grid-cols-[minmax(0,1.9fr)_minmax(0,1fr)]">
        <section className="panel panel-pad flex flex-col justify-between gap-7" aria-labelledby="d-next" aria-busy={bookingsQ.isLoading}>
          <h2 className="t-h3" id="d-next">
            Next session
          </h2>
          {bookingsQ.isLoading ? (
            <Skeleton variant="block" height={180} />
          ) : next ? (
            <>
              <div>
                <div className="flex items-center gap-3.5 min-[721px]:gap-[18px]">
                  <Disc name={next.coach_display_name || 'Coach'} size="lg" src={next.coach_avatar_url} className="max-[720px]:!size-16 max-[720px]:!text-xl" />
                  <div className="min-w-0">
                    <p className="t-title">
                      {session(next)} with {next.coach_display_name}
                    </p>
                    <p className="mt-1.5 font-display text-[clamp(20px,5.6vw,30px)] leading-tight text-tx">
                      <span className="num">{formatDateTime(next.slot_starts_at)}</span>
                    </p>
                    <div className="mt-2.5 flex flex-wrap items-center gap-3">
                      <span className="t-small">
                        {nextDays <= 0 ? 'today' : nextDays === 1 ? 'tomorrow' : `in ${nextDays} days`}
                      </span>
                      <Status status="confirmed" />
                    </div>
                  </div>
                </div>
                <p className="t-small mt-5">
                  <span className="num">{mins} min</span> video call with {next.coach_display_name}.{' '}
                  <span className="num">{formatPHP(next.price_centavos)}</span>. Times are in Manila time.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                {next.join_url ? (
                  <a className="btn btn-brand" href={next.join_url} target="_blank" rel="noopener noreferrer">
                    <Video aria-hidden="true" />
                    Join video call
                  </a>
                ) : null}
                <SiteLink to="/app/bookings" className="inline-flex min-h-11 items-center whitespace-nowrap">
                  Manage booking
                </SiteLink>
              </div>
            </>
          ) : (
            <Empty
              icon={Calendar}
              title="No sessions yet"
              body={pending ? 'Finish paying above to lock in your slot.' : 'Many coaches offer a free intro call.'}
              action={
                <SiteLink to="/coaches" className="btn btn-brand">
                  Browse coaches
                </SiteLink>
              }
            />
          )}
        </section>

        <div className="grid content-start gap-5">
          <ProfileMeter pct={pct} items={items} />

          <section className="panel panel-pad" aria-labelledby="d-ojt">
            <h2 className="t-h3 mb-3" id="d-ojt">
              OJT hours
            </h2>
            {target ? (
              <>
                <p className="num font-data text-[22px] leading-tight font-semibold text-tx">
                  {done} of {target} hours
                </p>
                <Progress className="my-3" value={ojtPct} label="OJT hours completed" />
                <p className="t-small">
                  {remaining > 0 ? (
                    <>
                      <span className="num">{remaining}</span> hours to go. About{' '}
                      <span className="num">{Math.ceil(remaining / 8 / 5)}</span> weeks at 8 hours a day.
                    </>
                  ) : (
                    'You’ve logged all your required hours.'
                  )}
                </p>
              </>
            ) : (
              <p className="t-small">
                Add your required hours in your <SiteLink to="/app/profile">profile</SiteLink> to track them here.
              </p>
            )}
            <button type="button" className="link-btn mt-1 inline-flex min-h-11 items-center" onClick={() => setCalcOpen(true)}>
              See how long it takes
            </button>
          </section>
        </div>
      </div>

      <section className="mt-9" aria-labelledby="d-sv">
        <div className="mb-3.5 flex flex-wrap items-center justify-between gap-4">
          <h2 className="t-h2" id="d-sv">
            Saved roles closing soon
          </h2>
          {savedList.length ? (
            <SiteLink to="/app/saved" className="inline-flex min-h-11 items-center whitespace-nowrap">
              All saved (<span className="num">{savedList.length}</span>)
            </SiteLink>
          ) : null}
        </div>
        {saved.isLoading ? (
          <div className="grid gap-2.5" aria-busy="true">
            <Skeleton variant="row" count={2} />
          </div>
        ) : savedList.length ? (
          <div className="grid gap-2.5">
            {savedList.slice(0, 3).map((i) => (
              <PostingRow key={i.id} internship={i} compact headingLevel={3} />
            ))}
          </div>
        ) : (
          <Empty
            icon={Bookmark}
            title="Nothing saved yet"
            body="Tap the bookmark on any role to keep it here, with its deadline."
            action={
              <SiteLink to="/internships" className="btn btn-brand">
                Browse internships
              </SiteLink>
            }
          />
        )}
      </section>

      <section className="mt-9" aria-labelledby="d-rf">
        <div className="mb-3.5 flex flex-wrap items-center justify-between gap-4">
          <h2 className="t-h2" id="d-rf">
            Roles for you
          </h2>
          <SiteLink to="/internships" className="inline-flex min-h-11 items-center whitespace-nowrap">
            All internships
          </SiteLink>
        </div>
        {loadingRoles ? (
          <div className="grid gap-2.5" aria-busy="true">
            <Skeleton variant="row" count={3} />
          </div>
        ) : roles.length ? (
          <div className="grid gap-2.5">
            {roles.map(({ i, skill }) => (
              <div key={i.id}>
                <PostingRow internship={i} compact headingLevel={3} />
                {skill ? <p className="t-meta mt-1.5 ml-4">Because you listed {skill}</p> : null}
              </div>
            ))}
          </div>
        ) : (
          <div className="note">
            <Bookmark aria-hidden="true" />
            <span>Add your skills in your profile and we’ll match roles to them.</span>
          </div>
        )}
      </section>

      <Dialog open={calcOpen} onOpenChange={setCalcOpen} title="OJT hours calculator" size="lg" showClose>
        <OjtCalculator stacked defaultHours={target ?? undefined} />
      </Dialog>
      <CancelBookingDialog booking={cancelling} onClose={() => setCancelling(null)} />
    </div>
  );
};
