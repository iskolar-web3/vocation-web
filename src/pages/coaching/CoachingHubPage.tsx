import { Link } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { CoachRow, Skeleton, TabPanel, Tabs } from '../../components/ui';
import { useCoaches } from '../../services/queries';
import type { CoachCard } from '../../types/api';
import '../../components/coaching/coaching.css';

interface CoachingHubPageProps {
  navigate: (path: string) => void;
}

// Tracks are matched against each coach's real expertise tags.
const TRACKS = [
  {
    id: 'technical',
    label: 'Software & Tech',
    match: /software|developer|technical|system design|coding|backend|frontend|web|engineering/i,
    points: [
      'Live technical problem solving and algorithm walkthroughs',
      'System design fundamentals and codebase architecture discussions',
      'Follow-up questions matching real tech interview rounds',
    ],
  },
  {
    id: 'product-design',
    label: 'Product & Design',
    match: /product|ui|ux|design|figma|case stud/i,
    points: [
      'Portfolio walkthrough and design critique for junior designers',
      'Product thinking, user problem definition, and prioritization',
      'Actionable advice on presenting design challenges effectively',
    ],
  },
  {
    id: 'data',
    label: 'Data & Analytics',
    match: /data|sql|analytics|python|machine learning|bi\b/i,
    points: [
      'SQL querying and analytical case problem solving',
      'Walk-through of data visualization, insights, and metrics storytelling',
      'Guidance on data internship expectations in Philippine tech',
    ],
  },
  {
    id: 'resume',
    label: 'Resume & portfolio',
    match: /resume|portfolio|case stud|cv/i,
    points: [
      'Line-by-line feedback on your student resume and ATS formatting',
      'What to cut, what to lead with, and quantifying student project impact',
      'A polished, ready-to-send draft you can submit this week',
    ],
  },
  {
    id: 'behavioral',
    label: 'Behavioral (STAR)',
    match: /behavioral|\bstar\b|hr |culture/i,
    points: [
      'Structuring answers with the STAR method (Situation, Task, Action, Result)',
      'Practicing stories for common panel and HR interview questions',
      'Constructive feedback on tone, delivery, and professional presence',
    ],
  },
  {
    id: 'ojt',
    label: 'OJT readiness',
    match: /ojt|practicum|workplace|intern/i,
    points: [
      'What practicum and internship interviews actually look like',
      'Handling course hours, school MOAs, and schedule coordination',
      'Thoughtful reverse questions to ask the employer during the interview',
    ],
  },
] as const;
type TrackId = (typeof TRACKS)[number]['id'];

const STEPS = [
  { t: 'Pick a coach', d: 'Read their bio, current company role, and student reviews.' },
  { t: 'Choose a time', d: 'Open times show conveniently in Manila time (PHT).' },
  { t: 'Confirm your session', d: 'Free intro calls confirm right away. Paid sessions confirm via secure payment.' },
  { t: 'Meet 1-on-1 on video', d: 'Join Google Meet directly from your bookings for personalized guidance.' },
] as const;

export function CoachingHubPage(_props: CoachingHubPageProps) {
  const { data, isLoading, isError } = useCoaches();
  const [track, setTrack] = useState<TrackId>('technical');
  const coaches = data?.items ?? [];

  const byTrack = useMemo(() => {
    const out = {} as Record<TrackId, { coaches: CoachCard[]; tag: string }>;
    for (const t of TRACKS) {
      const list = coaches.filter((c) => c.expertise?.some((e) => t.match.test(e)));
      const tag = list[0]?.expertise?.find((e) => t.match.test(e)) ?? '';
      out[t.id] = { coaches: list, tag };
    }
    return out;
  }, [coaches]);

  const featured = [...coaches].sort((a, b) => (b.rating_avg ?? 0) - (a.rating_avg ?? 0)).slice(0, 3);
  const active = TRACKS.find((t) => t.id === track) ?? TRACKS[0];
  const info = byTrack[track];

  return (
    <div className="hub">
      <header className="hub-head wrap">
        <h1 className="t-hero">1-on-1 Career Coaching & Mentorship</h1>
        <p className="t-lede">
          Mock interviews, resume reviews, and career guidance from working professionals in the Philippines. Free 1-on-1 calls available for students.
        </p>
        <div className="hub-ctas">
          <Link to="/coaches" className="btn btn-primary btn-lg">
            Find a coach
          </Link>
          <Link to="/coaches" search={{ price: 'free', expertise: '', q: '' }} className="btn btn-secondary btn-lg">
            Free intro calls
          </Link>
        </div>

      </header>

      <section className="wrap hub-blk" aria-labelledby="hub-track-h">
        <h2 className="t-h2" id="hub-track-h">
          Which round are you preparing for?
        </h2>
        <Tabs
          label="Track"
          idBase="hub-track"
          value={track}
          onValueChange={setTrack}
          options={TRACKS.map((t) => ({ value: t.id, label: t.label }))}
        />
        {TRACKS.map((t) => (
          <TabPanel key={t.id} idBase="hub-track" value={t.id} active={track === t.id}>
            <div className="panel hub-track">
              <div>
                <h3 className="t-h3">What you work on</h3>
                <ul className="hub-points">
                  {t.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </div>
              <div aria-busy={isLoading}>
                <h3 className="t-h3">Coaches for this track</h3>
                {isLoading ? (
                  <div className="hub-list">
                    <Skeleton variant="block" count={2} height={72} />
                  </div>
                ) : info.coaches.length ? (
                  <>
                    <div className="hub-list">
                      {info.coaches.slice(0, 3).map((c) => (
                        <CoachRow key={c.slug} coach={c} mode="compact" headingLevel={4} />
                      ))}
                    </div>
                    <Link to="/coaches" search={{ expertise: info.tag, price: 'all', q: '' }} className="link-btn hub-more">
                      See all {active.label} coaches
                    </Link>
                  </>
                ) : (
                  <p className="t-body">
                    No coaches are listed for this track yet.{' '}
                    <Link to="/coaches" className="link-btn">
                      Browse all coaches
                    </Link>
                  </p>
                )}
              </div>
            </div>
          </TabPanel>
        ))}
      </section>

      <section className="wrap hub-blk" aria-labelledby="hub-how-h">
        <h2 className="t-h2" id="hub-how-h">
          How booking works
        </h2>
        <ol className="hub-steps">
          {STEPS.map((s, i) => (
            <li key={s.t}>
              <span className="n num">{i + 1}</span>
              <h3>{s.t}</h3>
              <p>{s.d}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="wrap hub-blk" aria-labelledby="hub-feat-h" style={{ paddingBottom: 72 }}>
        <h2 className="t-h2" id="hub-feat-h">
          Featured coaches
        </h2>
        <div className="hub-list" aria-busy={isLoading}>
          {isLoading ? (
            <Skeleton variant="row" count={3} />
          ) : featured.length ? (
            featured.map((c) => <CoachRow key={c.slug} coach={c} mode="compact" />)
          ) : (
            <p className="t-body">{isError ? 'Couldn’t load coaches. Check your connection and refresh.' : 'No coaches are listed yet. Check back soon.'}</p>
          )}
        </div>
        <Link to="/coaches" className="btn btn-secondary" style={{ marginTop: 20 }}>
          Browse all coaches
        </Link>
      </section>
    </div>
  );
}
