import { ArrowUp } from 'lucide-react';
import type { ReactNode } from 'react';
import { scrollToTop } from '../../lib/smoothScroll';
import { SiteLink } from './shell';

/* The shared iSkolar footer (same columns and links on every iSkolar product). Vocation is marked "You're here". */

const ISK = 'https://iskolar.io';

const Svg = ({ children }: { children: ReactNode }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);

const SOCIALS = [
  {
    label: 'iSkolar on Facebook',
    href: 'https://www.facebook.com/profile.php?id=61575967087555',
    icon: <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />,
  },
  {
    label: 'iSkolar on LinkedIn',
    href: 'https://www.linkedin.com/company/107364901',
    icon: (
      <>
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect width="4" height="12" x="2" y="9" />
        <circle cx="4" cy="4" r="2" />
      </>
    ),
  },
  {
    label: 'iSkolar on Instagram',
    href: 'https://www.instagram.com/iskolar_web3',
    icon: (
      <>
        <rect width="20" height="20" x="2" y="2" rx="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37zM17.5 6.5h.01" />
      </>
    ),
  },
  {
    label: 'iSkolar on X',
    href: 'https://x.com/iSkolarWeb3',
    icon: <path d="M4 4l11.7 16H20L8.3 4H4zM4 20l6.8-6.8M13.2 10.8 20 4" />,
  },
];

const HOME: [string, string][] = [
  ['Home', '#home'],
  ['Products', '#products'],
  ['Ecosystem', '#ecosystem'],
  ['In the News', '#in-the-news'],
  ['FAQs', '#faqs'],
];
const PRODUCTS = ['PathFinder', 'Review', 'iSkolar', 'Academy', 'Vocation', 'Verity'];
const ABOUT: [string, string][] = [
  ['Company Overview', 'company-overview'],
  ['Mission & Vision', 'mission-vision'],
  ['Partnerships', 'partnerships'],
  ['Our Team', 'team'],
];
const LEGAL: [string, string][] = [
  ['Privacy Policy', '/privacy'],
  ['Terms & Conditions', '/terms'],
  ['Refund Policy', '/refunds'],
  ['Coach Agreement', '/coach-agreement'],
];

export function Footer() {
  return (
    <footer className="sh-foot">
      <div className="wrap sh-foot-in">
        <div className="sh-foot-brand">
          <a href={`${ISK}/`} aria-label="iSkolar home">
            <img src="/iskolar-logo.png" alt="iSkolar" width={121} height={68} />
          </a>
          <p>Tools for every step of a Filipino student’s journey, from choosing a course to proving a diploma.</p>
          <div className="sh-foot-social">
            {SOCIALS.map((s) => (
              <a key={s.label} href={s.href} aria-label={s.label} target="_blank" rel="noopener noreferrer">
                <Svg>{s.icon}</Svg>
              </a>
            ))}
          </div>
        </div>

        <nav aria-label="iSkolar home">
          <h4>Home</h4>
          <ul>
            {HOME.map(([l, h]) => (
              <li key={l}>
                <a href={`${ISK}/${h}`}>{l}</a>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="iSkolar products">
          <h4>Products</h4>
          <ul>
            {PRODUCTS.map((l) => (
              <li key={l}>
                {l === 'Vocation' ? (
                  <SiteLink to="/" aria-current="true">
                    Vocation
                  </SiteLink>
                ) : l === 'Academy' ? (
                  <a href="https://academy.iskolar.io">Academy</a>
                ) : (
                  <a href={`${ISK}/#${l.toLowerCase()}`}>{l}</a>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="About iSkolar">
          <h4>About</h4>
          <ul>
            {ABOUT.map(([l, h]) => (
              <li key={l}>
                <a href={`${ISK}/about#${h}`}>{l}</a>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Legal">
          <h4>Legal</h4>
          <ul>
            {LEGAL.map(([l, to]) => (
              <li key={to}>
                <SiteLink to={to}>{l}</SiteLink>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h4>Contact us</h4>
          <ul>
            <li>
              <a href="mailto:hello@iskolar.io">hello@iskolar.io
              </a>
            </li>
            <li>
              <SiteLink to="/contact">Help &amp; support</SiteLink>
            </li>
          </ul>
        </div>
      </div>

      <div className="wrap sh-foot-bar">
        <span>© 2026 iSkolar Technologies Inc. All rights reserved.</span>
        <span>Built For Students, Built By Students.</span>
        <button type="button" onClick={() => window.dispatchEvent(new CustomEvent('app:open_feedback'))}>
          Send feedback
        </button>
      </div>

      <div className="sh-foot-mark" aria-hidden="true">
        <span>iSkolar</span>
      </div>
      <button
        type="button"
        className="icon-btn glass sh-foot-top"
        aria-label="Back to top"
        onClick={scrollToTop}
      >
        <ArrowUp />
      </button>
    </footer>
  );
}
