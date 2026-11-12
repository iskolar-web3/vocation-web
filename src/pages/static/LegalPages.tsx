import React, { type ReactNode, useEffect, useRef } from 'react';
import { Building, Mail } from 'lucide-react';

interface LegalPageProps {
  page: 'terms' | 'privacy' | 'refunds' | 'coach-agreement' | 'contact';
  navigate?: (path: string) => void;
}

const Mail_ = ({ to = 'support@iskolar.io' }: { to?: string }) => (
  <a href={`mailto:${to}`} className="text-link underline underline-offset-[3px]">
    {to}
  </a>
);

const B = ({ children }: { children: ReactNode }) => <strong className="font-semibold text-tx">{children}</strong>;

const List = ({ children }: { children: ReactNode }) => (
  <ul className="grid list-disc gap-2 pl-5 text-base leading-[1.65] text-tx-2">{children}</ul>
);

interface Section {
  id: string;
  h: string;
  body: ReactNode;
}
interface Doc {
  title: string;
  updated: string;
  lede?: string;
  short: ReactNode[];
  sections: Section[];
}

/* Policy text keeps its substance; internal rule/ADR codes are dropped from the reader-facing copy. */
const DOCS: Record<'terms' | 'privacy' | 'refunds' | 'coach-agreement', Doc> = {
  terms: {
    title: 'Terms of Service',
    updated: 'October 2026',
    short: [
      <>iSkolar Vocation does not store or process job applications. Apply sends you to the employer's own recruitment portal.</>,
      <>Coaches are independent. iSkolar keeps a 10% platform fee on paid bookings and 90% goes to the coach.</>,
      <>Show up on time (Asia/Manila timezone) and treat each other with respect.</>,
      <>
        Questions go to <Mail_ />.
      </>,
    ],
    sections: [
      {
        id: 'scope',
        h: 'Platform scope and the outbound application model',
        body: (
          <p className="t-body">
            iSkolar Vocation connects Filipino tertiary students with curated internship listings and 1-on-1 industry
            career coaching. <B>iSkolar Vocation does not store or process third-party job applications on its servers.</B>{' '}
            All internship applications proceed via outbound redirection directly to the employer's official recruitment
            portal.
          </p>
        ),
      },
      {
        id: 'coaching',
        h: 'Coaching marketplace and commission model',
        body: (
          <p className="t-body">
            Paid coaching sessions are collected through our secure payment gateway partner. The platform retains a{' '}
            <B>10% platform fee</B> on paid bookings, with <B>90% disbursed to the coach</B>.
          </p>
        ),
      },
      {
        id: 'sessions',
        h: 'Session scheduling, attendance and conduct',
        body: (
          <p className="t-body">
            Students and coaches agree to attend sessions at scheduled times in the Asia/Manila timezone. Both parties
            must treat one another with mutual respect, integrity, and professionalism.
          </p>
        ),
      },
      {
        id: 'support',
        h: 'Support and inquiries',
        body: (
          <p className="t-body">
            For legal questions, disputes, or assistance, contact our dedicated support team at <Mail_ />.
          </p>
        ),
      },
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    updated: 'October 2026',
    lede: 'Compliant with Republic Act No. 10173 (Philippine Data Privacy Act of 2012) and its Implementing Rules and Regulations.',
    short: [
      <>We collect personal data only for specified, legitimate purposes.</>,
      <>We never store job applications. Outbound clicks go straight to the employer's portal.</>,
      <>Xendit handles payments. We never store card numbers or CVVs.</>,
      <>
        You can ask to access, correct, export or delete your data, or complain to the National Privacy Commission.
        Write to <Mail_ to="dpo@iskolar.io" />.
      </>,
    ],
    sections: [
      {
        id: 'controller',
        h: 'Personal Information Controller',
        body: (
          <p className="t-body">
            <B>iSkolar Technologies Inc. ("iSkolar Vocation")</B> acts as the Personal Information Controller (PIC) under
            Philippine Republic Act No. 10173. For all privacy inquiries, data subject requests, or regulatory concerns,
            you may contact our designated Data Protection Officer (DPO) at <Mail_ to="dpo@iskolar.io" /> or our support
            team at <Mail_ />.
          </p>
        ),
      },
      {
        id: 'collect',
        h: 'Personal data we collect and why',
        body: (
          <div className="grid gap-3.5">
            <p className="t-body">We collect and process personal data strictly for specified, legitimate purposes:</p>
            <List>
              <li>
                <B>Account registration and authentication:</B> Full name, email address, password hash, and Google
                account identifier (when using Google OAuth) to manage user identity and secure authentication.
              </li>
              <li>
                <B>Student profile and academic details:</B> University/college, academic program, year level, bio, and
                declared skills to personalize internship discovery and match coaching sessions.
              </li>
              <li>
                <B>Coach mentorship profile:</B> Professional headline, bio, areas of expertise, session rates,
                availability schedule, and payout account information (masked) to operate the career coaching
                marketplace.
              </li>
              <li>
                <B>Session and booking management:</B> Booking timestamps, status, session notes, and video meeting URLs
                to coordinate coaching appointments between students and coaches.
              </li>
              <li>
                <B>Technical and telemetry data:</B> Hashed user-agent representations and click timestamps for
                internship application referral tracking without collecting application dossiers.
              </li>
            </List>
          </div>
        ),
      },
      {
        id: 'applications',
        h: 'Outbound job applications and profile resumes',
        body: (
          <div className="grid gap-3.5">
            <p className="t-body">
              <B>Zero job application storage:</B> iSkolar Vocation does not store, review, or collect job applications,
              cover letters, or employment dossiers submitted to third-party employers. Outbound clicks redirect directly
              to employer recruitment portals.
            </p>
            <p className="t-body">
              <B>Profile resumes:</B> Students may optionally upload a resume (PDF only) to their private student
              profile. Resumes are stored encrypted in private cloud storage (AWS S3) and are accessible solely by the
              account owner. Resumes are never shared with prospective employers automatically.
            </p>
          </div>
        ),
      },
      {
        id: 'processors',
        h: 'Third-party processors and cross-border transfers',
        body: (
          <div className="grid gap-3.5">
            <p className="t-body">
              Personal data is processed with vetted cloud processors governed by data processing agreements:
            </p>
            <List>
              <li>
                <B>Neon Inc.:</B> Managed PostgreSQL cloud database infrastructure with encryption at rest and in
                transit.
              </li>
              <li>
                <B>Amazon Web Services (AWS):</B> S3 private cloud object storage located in Singapore (ap-southeast-1
                region) with AES-256 encryption.
              </li>
              <li>
                <B>Xendit Philippines:</B> Bangko Sentral ng Pilipinas (BSP)-licensed payment gateway for payment
                checkout and coach disbursements. We never store credit/debit card numbers or CVVs.
              </li>
              <li>
                <B>Google LLC:</B> Google OAuth authentication and Google Analytics 4 (utilizing Google Consent Mode v2,
                strictly denied by default until user consent is granted).
              </li>
              <li>
                <B>Sentry (Functional Software, Inc.):</B> Application error logging and performance telemetry, scrubbed
                to remove PII, passwords, cookies, and authentication tokens.
              </li>
              <li>
                <B>Coaching participants:</B> Only the student's first name is shared on public coach reviews. Coaches
                never receive student email addresses.
              </li>
            </List>
          </div>
        ),
      },
      {
        id: 'retention',
        h: 'Data retention and disposal',
        body: (
          <p className="t-body">
            Account profiles are retained while active. Users may request account deletion or data export at any time.
            Financial and transaction ledgers are retained for a minimum of 5 years to comply with Philippine National
            Internal Revenue Code (NIRC) and commercial accounting requirements. Inactive session tokens and transient
            cache entries are purged regularly.
          </p>
        ),
      },
      {
        id: 'rights',
        h: 'Your data subject rights (RA 10173)',
        body: (
          <div className="grid gap-3.5">
            <p className="t-body">Under the Data Privacy Act of 2012 (Sections 16 and 18), you have the right to:</p>
            <List>
              <li>
                <B>Be informed:</B> Know how and why your personal data is collected and processed.
              </li>
              <li>
                <B>Access:</B> Request reasonable access to your personal data held by the platform.
              </li>
              <li>
                <B>Rectification:</B> Correct any inaccuracies or deficiencies in your personal profile.
              </li>
              <li>
                <B>Erasure or blocking:</B> Request the deletion, blocking, or removal of your personal information.
              </li>
              <li>
                <B>Data portability:</B> Obtain a portable electronic copy of your account data.
              </li>
              <li>
                <B>Damages:</B> Be indemnified for any damages sustained due to inaccurate, false, or unlawfully
                obtained personal data.
              </li>
              <li>
                <B>Lodge a complaint:</B> If you believe your privacy rights have been infringed, you have the right to
                file a complaint before the <B>National Privacy Commission (NPC)</B> at{' '}
                <a
                  href="https://privacy.gov.ph"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-link underline underline-offset-[3px]"
                >
                  privacy.gov.ph
                </a>
                .
              </li>
            </List>
          </div>
        ),
      },
    ],
  },
  'coach-agreement': {
    title: 'Coach Agreement',
    updated: 'October 2026',
    short: [
      <>You are an independent professional, not an iSkolar employee.</>,
      <>iSkolar keeps a 10% platform fee on each paid booking. You receive 90% of the session price.</>,
      <>Sessions auto-complete 24 hours after the scheduled end if nobody marks them completed.</>,
      <>Give at least 24 hours notice for a conflict. If you cancel, the student gets a full refund.</>,
    ],
    sections: [
      {
        id: 'contractor',
        h: 'Independent contractor relationship',
        body: (
          <p className="t-body">
            Coaches provide mentorship, resume audits, and mock interviews as independent professionals. Coaches set
            their own availability slots and session pricing in Philippine Pesos (PHP).
          </p>
        ),
      },
      {
        id: 'fee',
        h: '10% platform fee and 90% coach share',
        body: (
          <p className="t-body">
            iSkolar Vocation retains a <B>10% platform fee</B> per paid booking. Coaches receive{' '}
            <B>90% of the session price</B> (subject to standard centavo rounding). Earnings are tracked in real-time in
            the Coach Portal ledger.
          </p>
        ),
      },
      {
        id: 'completion',
        h: 'Session completion and the auto-completion window',
        body: (
          <p className="t-body">
            Sessions can be marked completed manually by either the coach or student after the scheduled call ends. If
            neither party acts, sessions <B>auto-complete exactly 24 hours after the scheduled end time</B> to ensure
            prompt coach payment.
          </p>
        ),
      },
      {
        id: 'cancellations',
        h: 'Cancellation and refund responsibilities',
        body: (
          <p className="t-body">
            Coaches must provide at least 24 hours notice for any unavoidable schedule conflict. If a coach cancels a
            scheduled session, the student receives an immediate 100% full refund.
          </p>
        ),
      },
      {
        id: 'inquiries',
        h: 'Inquiries and payout support',
        body: (
          <p className="t-body">
            For disbursement questions, bank updates, or disputes, reach us directly at <Mail_ />.
          </p>
        ),
      },
    ],
  },
  refunds: {
    title: 'Refund and Cancellation Policy',
    updated: 'October 2026',
    short: [
      <>Cancel a paid session more than 24 hours before it starts and you get a full refund.</>,
      <>Cancel at 24 hours or less and there is no refund.</>,
      <>If the coach cancels, you always get a full refund.</>,
      <>Refunds usually reach you in 3 to 7 banking days.</>,
    ],
    sections: [
      {
        id: 'student',
        h: 'Student cancellations: the 24-hour rule',
        body: (
          <p className="t-body">
            Students may cancel a paid session strictly <B>more than 24 hours prior</B> to the scheduled call start time
            for a <B>100% full refund</B> credited back to the original payment method. If a student cancels at 24 hours
            or less prior to the call, no refund is issued to protect coach scheduling.
          </p>
        ),
      },
      {
        id: 'coach',
        h: 'Coach cancellations',
        body: (
          <p className="t-body">
            If a coach cancels a confirmed booking at any time, a <B>100% full refund</B> is automatically triggered and
            refunded to the student's original payment method.
          </p>
        ),
      },
      {
        id: 'dispute',
        h: 'Session completion and the dispute window',
        body: (
          <p className="t-body">
            Following the scheduled end time, sessions enter a <B>24-hour completion window</B> before final payout
            reconciliation. If any technical disruption, failure to connect, or no-show occurs, disputes must be
            reported within this 24-hour window by contacting <Mail_ />.
          </p>
        ),
      },
      {
        id: 'timing',
        h: 'Refund processing time',
        body: (
          <p className="t-body">
            Refunds are processed automatically via our payment gateway. Gateway credit card and e-wallet reversals
            generally reflect in 3 to 7 banking days depending on the customer's financial institution.
          </p>
        ),
      },
    ],
  },
};

function Header({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <header className="py-8 sm:py-14">
      <h1 className="t-h1">{title}</h1>
      {children}
    </header>
  );
}

function LegalDoc({ page }: { page: keyof typeof DOCS }) {
  const doc = DOCS[page];
  const rootRef = useRef<HTMLDivElement>(null);
  const lock = useRef(0);

  const setCurrent = (id: string) => {
    for (const a of rootRef.current?.querySelectorAll<HTMLAnchorElement>('[data-toc]') ?? []) {
      if (a.dataset.toc === id) a.setAttribute('aria-current', 'location');
      else a.removeAttribute('aria-current');
    }
  };

  useEffect(() => {
    if (!('IntersectionObserver' in window)) return;
    const secs = [...(rootRef.current?.querySelectorAll<HTMLElement>('[data-sec]') ?? [])];
    const seen = new Set<string>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const x of entries) {
          if (x.isIntersecting) seen.add(x.target.id);
          else seen.delete(x.target.id);
        }
        const first = secs.find((s) => seen.has(s.id));
        if (first && Date.now() > lock.current) setCurrent(first.id);
      },
      { rootMargin: '-96px 0px -55% 0px' }
    );
    for (const s of secs) io.observe(s);
    return () => io.disconnect();
  }, []);

  const toc = (
    <ol className="grid gap-0.5">
      {doc.sections.map((s, i) => (
        <li key={s.id}>
          <a
            href={`#${page}-${s.id}`}
            data-toc={`${page}-${s.id}`}
            className="block rounded-sm px-2 py-2.5 text-sm leading-snug text-tx-2 hover:text-tx aria-[current=location]:bg-surface-2 aria-[current=location]:text-tx max-lg:min-h-11"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById(`${page}-${s.id}`)?.scrollIntoView({ block: 'start' });
              setCurrent(`${page}-${s.id}`);
              lock.current = Date.now() + 600;
            }}
          >
            {i + 1}. {s.h}
          </a>
        </li>
      ))}
    </ol>
  );

  return (
    <div ref={rootRef} className="wrap lit lit-left pb-20">
      <Header title={doc.title}>
        <p className="t-meta mt-3 text-sm">Last updated {doc.updated}</p>
        {doc.lede && <p className="t-small mt-3 max-w-[68ch]">{doc.lede}</p>}
      </Header>

      <div className="grid gap-8 lg:grid-cols-[240px_minmax(0,68ch)] lg:gap-14">
        <details className="rounded-lg border border-line bg-surface px-2 lg:hidden">
          <summary className="flex min-h-11 cursor-pointer items-center justify-between px-2 font-data text-sm font-semibold text-tx">
            On this page
          </summary>
          <nav aria-label="On this page" className="pb-2">
            {toc}
          </nav>
        </details>
        <aside className="hidden lg:block">
          <nav aria-label="On this page" className="sticky top-24">
            <p className="t-label mb-2 px-2">On this page</p>
            {toc}
          </nav>
        </aside>

        <div className="min-w-0 lg:col-start-2 lg:row-start-1">
          <section className="panel p-5 sm:p-6" aria-labelledby="lg-short">
            <h2 id="lg-short" className="mb-3.5 font-display text-[22px] leading-tight text-tx">
              The short version
            </h2>
            <ul className="grid list-disc gap-2 pl-5 text-tx-2">
              {doc.short.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          </section>
          {doc.sections.map((s) => (
            <section
              key={s.id}
              id={`${page}-${s.id}`}
              data-sec=""
              aria-labelledby={`${page}-${s.id}-h`}
              className="mt-12 scroll-mt-24"
            >
              <h2 id={`${page}-${s.id}-h`} className="mb-3.5 font-display text-[26px] leading-tight text-tx">
                {s.h}
              </h2>
              {s.body}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

function Contact() {
  const rows = [
    { icon: Mail, h: 'Students and coaches', p: 'Bookings, payments, payouts, your account or a listing.' },
    { icon: Building, h: 'Employers and university partnerships', p: 'Partnerships, listing a role, or working with your OJT office.' },
  ];
  return (
    <div className="wrap lit lit-left pb-20">
      <Header title="Contact us">
        <p className="t-lede mt-3.5 max-w-[52ch]">We are here to assist students, coaches, and university partners.</p>
      </Header>
      <div className="panel max-w-[560px] divide-y divide-line">
        {rows.map(({ icon: Icon, h, p }) => (
          <div key={h} className="p-5 sm:p-6">
            <h2 className="mb-1.5 font-display text-[22px] leading-tight text-tx">{h}</h2>
            <p className="t-small">{p}</p>
            <a
              href="mailto:support@iskolar.io"
              className="mt-2 inline-flex min-h-11 items-center gap-2.5 font-data text-[15.5px] font-semibold text-link"
            >
              <Icon aria-hidden="true" className="h-[18px] w-[18px]" />
              support@iskolar.io
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

export const LegalPages: React.FC<LegalPageProps> = ({ page }) =>
  page === 'contact' ? <Contact /> : <LegalDoc page={page} />;
