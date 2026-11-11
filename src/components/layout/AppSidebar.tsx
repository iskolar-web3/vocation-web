import {
  CalendarDays,
  Clock,
  LayoutDashboard,
  type LucideIcon,
  Bookmark,
  Settings,
  User,
  Wallet,
} from 'lucide-react';
import { type ReactNode, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSavedInternships } from '../../services/queries';
import { Disc } from '../ui';
import { SiteLink, currentFor, isBare, isUnder, pathOf, queryOf, useShell } from './shell';

export type Zone = 'student' | 'coach' | 'admin';

export const zoneOf = (path: string): Zone | null =>
  isUnder(path, '/app') ? 'student' : isUnder(path, '/coach') ? 'coach' : isUnder(path, '/admin') ? 'admin' : null;

export interface ZoneLink {
  label: string;
  to: string;
  icon: LucideIcon;
  /** Marks the saved-roles item so a count can ride on it. */
  saved?: boolean;
}

export const STUDENT_LINKS: ZoneLink[] = [
  { label: 'Overview', to: '/app', icon: LayoutDashboard },
  { label: 'Bookings', to: '/app/bookings', icon: CalendarDays },
  { label: 'Saved roles', to: '/app/saved', icon: Bookmark, saved: true },
  { label: 'Profile', to: '/app/profile', icon: User },
  { label: 'Settings', to: '/app/settings', icon: Settings },
];

/* The coach dashboard is one page with three tabs (sessions, availability, earnings), selected by ?tab=. */
export const COACH_LINKS: ZoneLink[] = [
  { label: 'Sessions', to: '/coach?tab=sessions', icon: CalendarDays },
  { label: 'Availability', to: '/coach?tab=availability', icon: Clock },
  { label: 'Earnings', to: '/coach?tab=earnings', icon: Wallet },
];

export const linkCurrent = (path: string, link: ZoneLink): 'page' | undefined => {
  const [base, qs] = link.to.split('?');
  const p = pathOf(path);
  if (!qs) return currentFor(p, base) === 'page' ? 'page' : undefined;
  const want = new URLSearchParams(qs).get('tab');
  const have = queryOf(path).get('tab') ?? 'sessions';
  return p === base && have === want ? 'page' : undefined;
};

export function AppSidebar({ zone }: { zone: 'student' | 'coach' }) {
  const { userName } = useAuth();
  const { path } = useShell();
  const rowRef = useRef<HTMLElement>(null);
  const { data: saved } = useSavedInternships({ enabled: zone === 'student' });
  const links = zone === 'student' ? STUDENT_LINKS : COACH_LINKS;
  const first = userName.replace(/^(engr|dr|atty|arch|prof|mr|ms|mrs)\.?\s+/i, '').split(' ')[0] || (zone === 'student' ? 'Student' : 'Coach');

  // Horizontal pill row (<1024): keep the current item in view.
  useEffect(() => {
    const row = rowRef.current;
    const a = row?.querySelector<HTMLElement>('[aria-current]');
    if (row && a) row.scrollLeft = a.offsetLeft - (row.clientWidth - a.offsetWidth) / 2;
  }, [path]);

  return (
    <nav ref={rowRef} className="sh-side" aria-label={zone === 'student' ? 'Student pages' : 'Coach pages'}>
      <div className="sh-who">
        <Disc name={userName} size="sm" />
        <div>
          <p className="font-display">{first}</p>
          <p className="t-meta">{zone === 'student' ? 'Student' : 'Coach'}</p>
        </div>
      </div>
      {links.map((l) => (
        <SiteLink key={l.to} to={l.to} aria-current={linkCurrent(path, l)}>
          <l.icon aria-hidden="true" />
          {l.label}
          {l.saved && saved && saved.length > 0 ? <span className="count-dot">{saved.length}</span> : null}
        </SiteLink>
      ))}
    </nav>
  );
}

/** Student and coach pages get the sidebar frame; admin gets a full-width wrap. Anyone else passes through. */
export function AppFrame({ zone, children }: { zone: Zone | null; children: ReactNode }) {
  const { role, isAuthenticated } = useAuth();
  const { path } = useShell();
  if (!zone || isBare(pathOf(path)) || !isAuthenticated || role !== zone) return <>{children}</>;
  if (zone === 'admin') return <div className="wrap sh-solo">{children}</div>;
  return (
    <div className="wrap sh-app">
      <AppSidebar zone={zone} />
      <div className="sh-app-main">{children}</div>
    </div>
  );
}
