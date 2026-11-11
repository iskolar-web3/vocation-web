import React, { useEffect, useRef, useState } from 'react';
import { Check, ExternalLink } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCreateCoachProfile, useFeatures } from '../../services/queries';
import { ComingSoonBadge } from '../../components/common/ComingSoonBadge';
import { Segmented } from '../../components/ui';
import './coach.css';

interface CoachOnboardingPageProps {
  navigate: (path: string) => void;
}

const SUGGESTED = [
  'Career Guidance',
  'Resume Review',
  'Mock Interview',
  'Portfolio Review',
  'System Design',
  'Behavioral (STAR)',
  'OJT Readiness',
];

const STEPS = [
  { h: 'Your profile', l: 'This is what students see first.' },
  { h: 'What you coach', l: 'Help students find the right coach.' },
  { h: 'Pricing and agreement', l: 'Last step. Choose how you charge, then agree to the terms.' },
];

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

type Errors = Partial<Record<'name' | 'slug' | 'headline' | 'bio' | 'skills' | 'agree', string>>;

function Err({ id, msg }: { id: string; msg?: string }) {
  return msg ? (
    <p className="error" id={`${id}-e`} role="alert">
      {msg}
    </p>
  ) : null;
}

export const CoachOnboardingPage: React.FC<CoachOnboardingPageProps> = ({ navigate }) => {
  const { user, refetchUser } = useAuth();
  const features = useFeatures();
  const createCoachMutation = useCreateCoachProfile();

  const [step, setStep] = useState(1);
  const [displayName, setDisplayName] = useState(user?.full_name || '');
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [slug, setSlug] = useState(() => (user?.full_name ? slugify(user.full_name) : ''));
  const [priceType, setPriceType] = useState<'free' | 'paid'>('paid');
  const [skills, setSkills] = useState<string[]>(['Career Guidance', 'Resume Review']);
  const [newSkill, setNewSkill] = useState('');
  const [acceptedAgreement, setAcceptedAgreement] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    window.scrollTo(0, 0);
    headingRef.current?.focus();
  }, [step]);

  const toggleSkill = (s: string) =>
    setSkills((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]));

  const handleAddSkill = () => {
    const trimmed = newSkill.trim();
    if (trimmed.length < 2) return;
    if (!skills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) setSkills([...skills, trimmed]);
    setNewSkill('');
    setErrors((e) => ({ ...e, skills: undefined }));
  };

  const finalSlug = () => (slug.trim() || slugify(displayName)).toLowerCase();

  const validate = (s: number): Errors => {
    const e: Errors = {};
    if (s === 1) {
      if (!displayName.trim()) e.name = 'Add the name students will see, like Maria Santos.';
      if (!finalSlug()) e.slug = 'Add a profile link, like maria-santos.';
      if (!headline.trim()) e.headline = 'Add a headline, like "Senior Software Engineer".';
      if (!bio.trim()) e.bio = 'Tell students what to expect from your sessions.';
    }
    if (s === 2 && skills.length === 0) e.skills = 'Pick at least one focus area.';
    if (s === 3 && !acceptedAgreement) e.agree = 'You must review and agree to the Coach Agreement before onboarding.';
    return e;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setServerError(null);
    const e = validate(step);
    setErrors(e);
    const firstBad = Object.keys(e)[0];
    if (firstBad) {
      document.getElementById(`ob-${firstBad}`)?.focus();
      return;
    }
    if (step < STEPS.length) {
      setStep(step + 1);
      return;
    }
    try {
      await createCoachMutation.mutateAsync({
        display_name: displayName.trim(),
        headline: headline.trim(),
        bio: bio.trim(),
        languages: ['English', 'Filipino'],
        slug: finalSlug(),
        price_type: priceType,
        skills,
      });
      // Refetch so AuthContext immediately reflects is_onboarded: true
      await refetchUser();
      navigate('/coach');
    } catch (err: unknown) {
      setServerError(err instanceof Error && err.message ? err.message : 'Failed to complete coach onboarding.');
    }
  };

  const { h, l } = STEPS[step - 1];
  const pending = createCoachMutation.isPending;
  const aria = (k: keyof Errors) => ({
    'aria-invalid': errors[k] ? (true as const) : undefined,
    'aria-describedby': errors[k] ? `ob-${k}-e` : undefined,
  });

  return (
    <div className="lit lit-left pcp-ob">
      <header className="pcp-ob-w pcp-ob-head">
        <div className="pcp-ob-prog">
          <div
            className="pcp-ob-bar"
            role="progressbar"
            aria-label="Setup progress"
            aria-valuemin={1}
            aria-valuemax={STEPS.length}
            aria-valuenow={step}
            aria-valuetext={`Step ${step} of ${STEPS.length}`}
          >
            <i style={{ width: `${(step / STEPS.length) * 100}%` }} />
          </div>
          <p className="t-label num">
            Step {step} of {STEPS.length}
          </p>
        </div>
        <h1 className="t-h1" ref={headingRef} tabIndex={-1}>
          {h}
        </h1>
        <p className="t-lede">{l}</p>
      </header>

      <form
        className="pcp-ob-w pcp-ob-form"
        noValidate
        onSubmit={handleSubmit}
        aria-label={`Step ${step} of ${STEPS.length}: ${h}`}
      >
        {step === 1 && (
          <>
            <div className="field">
              <label htmlFor="ob-name">Display name</label>
              <input
                id="ob-name"
                className="input"
                type="text"
                autoComplete="name"
                placeholder="Maria Santos"
                value={displayName}
                onChange={(e) => {
                  setDisplayName(e.target.value);
                  if (!slug) setSlug(slugify(e.target.value));
                  setErrors((x) => ({ ...x, name: undefined }));
                }}
                {...aria('name')}
              />
              <Err id="ob-name" msg={errors.name} />
            </div>

            <div className="field">
              <label htmlFor="ob-slug">Your profile link</label>
              <div className="pcp-ob-url">
                <span aria-hidden="true">iskolar.io/coaches/</span>
                <input
                  id="ob-slug"
                  className="input"
                  type="text"
                  autoComplete="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  placeholder="maria-santos"
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''));
                    setErrors((x) => ({ ...x, slug: undefined }));
                  }}
                  {...aria('slug')}
                />
              </div>
              <span className="hint">A permanent link to your profile. It stays the same once you finish.</span>
              <Err id="ob-slug" msg={errors.slug} />
            </div>

            <div className="field">
              <label htmlFor="ob-headline">Headline</label>
              <input
                id="ob-headline"
                className="input"
                type="text"
                maxLength={90}
                placeholder="Senior Software Engineer"
                value={headline}
                onChange={(e) => {
                  setHeadline(e.target.value);
                  setErrors((x) => ({ ...x, headline: undefined }));
                }}
                {...aria('headline')}
              />
              <Err id="ob-headline" msg={errors.headline} />
            </div>

            <div className="field">
              <label htmlFor="ob-bio">Bio</label>
              <textarea
                id="ob-bio"
                className="textarea"
                rows={5}
                placeholder="What happens in your sessions, and who you help most."
                value={bio}
                onChange={(e) => {
                  setBio(e.target.value);
                  setErrors((x) => ({ ...x, bio: undefined }));
                }}
                {...aria('bio')}
              />
              <Err id="ob-bio" msg={errors.bio} />
            </div>

            {!features.uploads && (
              <div className="pcp-ob-photo" aria-disabled="true">
                <span>Profile photo</span>
                <ComingSoonBadge />
              </div>
            )}
          </>
        )}

        {step === 2 && (
          <div className="field">
            <span className="label" id="ob-skills-l">
              Focus areas
            </span>
            <div className="pcp-chips" role="group" aria-labelledby="ob-skills-l">
              {[...new Set([...SUGGESTED, ...skills])].map((s) => {
                const on = skills.includes(s);
                return (
                  <button
                    key={s}
                    type="button"
                    className="chip"
                    aria-pressed={on}
                    onClick={() => {
                      toggleSkill(s);
                      setErrors((x) => ({ ...x, skills: undefined }));
                    }}
                  >
                    {on ? <Check aria-hidden="true" /> : null}
                    {s}
                  </button>
                );
              })}
            </div>
            <div className="pcp-add">
              <label className="sr-only" htmlFor="ob-skills">
                Add your own focus area
              </label>
              <input
                id="ob-skills"
                className="input"
                type="text"
                autoComplete="off"
                maxLength={30}
                enterKeyHint="done"
                placeholder="Add your own, then press Enter"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
                {...aria('skills')}
              />
              <button type="button" className="btn btn-secondary" onClick={handleAddSkill}>
                Add
              </button>
            </div>
            <Err id="ob-skills" msg={errors.skills} />
          </div>
        )}

        {step === 3 && (
          <>
            <div className="field">
              <span className="label" id="ob-price-l">
                How do you charge?
              </span>
              <Segmented
                label="How do you charge?"
                value={priceType}
                onValueChange={setPriceType}
                options={[
                  { value: 'paid', label: 'Paid sessions' },
                  { value: 'free', label: 'Free sessions' },
                ]}
              />
              <span className="hint">
                {priceType === 'paid'
                  ? 'Students pay before a session is confirmed.'
                  : 'Free sessions are confirmed right away.'}
              </span>
            </div>

            <div className="note">
              <p>
                <b>You keep 90% of each paid session; iSkolar's fee is 10%.</b> Earnings clear 24 hours after a session
                ends. Payouts go to your Philippine bank account or e-wallet.
              </p>
            </div>

            <div className="pcp-agree">
              <label className="check" htmlFor="ob-agree">
                <input
                  id="ob-agree"
                  type="checkbox"
                  checked={acceptedAgreement}
                  onChange={(e) => {
                    setAcceptedAgreement(e.target.checked);
                    setErrors((x) => ({ ...x, agree: undefined }));
                  }}
                  {...aria('agree')}
                />
                <span className="t-small">
                  I agree to the{' '}
                  <a href="/coach-agreement" target="_blank" rel="noopener noreferrer">
                    Coach Agreement
                    <ExternalLink aria-hidden="true" className="ml-1 inline h-3.5 w-3.5 align-[-2px]" />
                  </a>
                  . I understand the platform takes a 10% fee on paid sessions (I receive 90%), payouts are disbursed
                  via Philippine bank or e-wallet, and dispute and refund claims are subject to a 24-hour window.
                </span>
              </label>
              <Err id="ob-agree" msg={errors.agree} />
            </div>
          </>
        )}

        {serverError && (
          <p className="note is-bad" role="alert">
            {serverError}
          </p>
        )}

        <div className="pcp-ob-actions">
          {step > 1 && (
            <button type="button" className="btn btn-ghost" onClick={() => setStep(step - 1)} disabled={pending}>
              Back
            </button>
          )}
          <button type="submit" className="btn btn-brand" disabled={pending}>
            {step < STEPS.length ? 'Continue' : pending ? 'Creating profile…' : 'Create coach profile'}
          </button>
        </div>
      </form>
    </div>
  );
};
