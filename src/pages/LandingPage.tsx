import { Link } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { ApplySection } from '../components/landing/ApplySection';
import { ClosingSoon } from '../components/landing/ClosingSoon';
import { CoachingSection } from '../components/landing/CoachingSection';
import { Reveal } from '../components/landing/Reveal';
import { WeekStack } from '../components/landing/WeekStack';
import '../components/landing/landing.css';
import { Accordion, OjtCalculator, daysUntil } from '../components/ui';
import { useCoaches, useInternships } from '../services/queries';

const FAQ = [
  {
    id: 'free',
    q: 'Is Vocation free for students?',
    a: 'Yes. Browsing and saving roles is free. You only pay for coaching sessions that have a price, and the price is shown before you book.',
  },
  {
    id: 'apply',
    q: 'Do you send my application to the company?',
    a: 'No. Apply takes you to the company’s own site, and you apply there. Vocation never sees or stores your application.',
  },
  {
    id: 'ojt',
    q: 'What does “OJT-eligible” mean?',
    a: 'The company has said the internship can count toward your school’s required OJT or practicum hours. Always confirm with your OJT coordinator.',
  },
  {
    id: 'paid',
    q: 'How do paid sessions work?',
    a: 'Pick a time, then pay on a secure checkout page. Your booking shows as pending until the payment provider confirms it, usually within a minute.',
  },
  {
    id: 'cancel',
    q: 'Can I cancel a session?',
    a: 'Cancel more than 24 hours before the session and you get a full refund. At 24 hours or less, it isn’t refundable. If the coach cancels, you always get a full refund.',
  },
];

/** M11 plays once per browser session. */
const ENTER_KEY = 'vocation:landing-entered';
function readEnter(): boolean {
  try {
    return sessionStorage.getItem(ENTER_KEY) === null;
  } catch {
    return false;
  }
}

/** `navigate` is accepted for the legacy App shell and ignored: links use the router. */
export function LandingPage(_props: { navigate?: (path: string) => void }) {
  const [enter] = useState(readEnter);
  // Written after first render so a StrictMode double render still plays the entrance.
  useMemo(() => {
    if (!enter) return;
    queueMicrotask(() => {
      try {
        sessionStorage.setItem(ENTER_KEY, '1');
      } catch {
        /* storage blocked: entrance plays every load, which is harmless */
      }
    });
  }, [enter]);

  const jobs = useInternships({ sort: 'deadline_soon', per_page: 24 });
  const coaches = useCoaches({ per_page: 12 });

  // Open roles that haven't closed, soonest deadline first; roles without a deadline last.
  const open = useMemo(() => {
    const list = (jobs.data?.items ?? []).filter((i) => {
      const s = (i as { status?: string }).status;
      if (s && s !== 'open') return false;
      return !i.deadline || daysUntil(i.deadline) >= 0;
    });
    const t = (d?: string | null) => (d ? new Date(d).getTime() : Number.POSITIVE_INFINITY);
    return list.sort((a, b) => t(a.deadline) - t(b.deadline));
  }, [jobs.data]);

  const coachList = coaches.data?.items ?? [];
  const featuredRole = open[0];
  const featuredCoach = [...coachList].sort((a, b) => (b.rating_avg ?? 0) - (a.rating_avg ?? 0))[0];

  return (
    <div className="pg-home" data-enter={enter ? '' : undefined}>
      <section className="hero lit" aria-labelledby="h-title">
        <div className="wrap hero-in">
          <div>
            <h1 className="t-hero h-title" id="h-title">
              <span className="hx" style={{ '--i': 0 } as React.CSSProperties}>
                Walk in
              </span>
              <span className="l2 hx" style={{ '--i': 1 } as React.CSSProperties}>
                <span className="h-tone">already</span> <span className="h-box">ready.</span>
              </span>
            </h1>
            <p className="h-sub hx" style={{ '--i': 2 } as React.CSSProperties}>
              Find the internship.
              <br />
              Rehearse the interview.
            </p>
            <div className="h-cta hx" style={{ '--i': 3 } as React.CSSProperties}>
              <Link to="/internships" className="btn btn-primary btn-lg">
                Browse internships
              </Link>
              <Link to="/coaching" className="btn btn-secondary btn-lg">
                Book a practice session
              </Link>
            </div>
            <p className="t-meta h-note hx" style={{ '--i': 4 } as React.CSSProperties}>
              Free for students. You apply on the company’s own site.
            </p>
          </div>
          <WeekStack coach={featuredCoach} role={featuredRole} />
        </div>
      </section>

      <Reveal className="section wrap cl" labelledBy="cl-h">
        <ClosingSoon
          items={open}
          total={jobs.data?.meta?.total}
          loading={jobs.isLoading}
          error={jobs.isError}
          onRetry={() => jobs.refetch()}
        />
      </Reveal>

      <Reveal className="section wrap co" labelledBy="co-h">
        <CoachingSection coaches={coachList} loading={coaches.isLoading} />
      </Reveal>

      <Reveal className="section wrap oj" labelledBy="oj-h">
        <div className="sh">
          <h2 className="t-h2" id="oj-h">
            How long is 486 hours, really?
          </h2>
          <p className="t-body">
            Put in your school’s required hours and your schedule. See the weeks, and what the allowance adds up to.
          </p>
        </div>
        <div className="panel">
          <OjtCalculator />
        </div>
      </Reveal>

      <Reveal className="section wrap af" labelledBy="af-h">
        <ApplySection role={featuredRole} />
      </Reveal>

      <Reveal className="section wrap fq" labelledBy="fq-h">
        <div className="sh">
          <h2 className="t-h2" id="fq-h">
            Questions students ask
          </h2>
          <p className="t-body">Short answers. If yours isn’t here, ask us.</p>
          <Link to="/contact" className="link-btn">
            Contact support
          </Link>
        </div>
        <Accordion headingLevel={3} items={FAQ.map((f) => ({ id: f.id, title: f.q, content: <p className="t-body">{f.a}</p> }))} />
      </Reveal>

      <Reveal className="section end lit" labelledBy="end-h">
        <div className="wrap">
          <h2 className="t-h1" id="end-h">
            OJT season na. Start with one role.
          </h2>
          <div className="row">
            <Link to="/internships" className="btn btn-primary btn-lg">
              Browse internships
            </Link>
            <Link to="/signup" className="btn btn-secondary btn-lg">
              Sign up free
            </Link>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
