import { Bookmark, CalendarDays, GraduationCap, House, type LucideIcon, Search, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSavedInternships } from '../../services/queries';
import { SiteLink, isBare, isUnder, pathOf, useShell } from './shell';

interface Tab {
  label: string;
  to: string;
  icon: LucideIcon;
  active: (p: string) => boolean;
  count?: boolean;
}

const coaching = (p: string) => isUnder(p, '/coaching') || isUnder(p, '/coaches');
const browse = (p: string) => isUnder(p, '/internships') || isUnder(p, '/companies');

const ANON: Tab[] = [
  { label: 'Home', to: '/', icon: House, active: (p) => p === '/' },
  { label: 'Internships', to: '/internships', icon: Search, active: browse },
  { label: 'Coaching', to: '/coaching', icon: GraduationCap, active: coaching },
  { label: 'Sign in', to: '/signin', icon: User, active: (p) => p === '/signin' },
];

const STUDENT: Tab[] = [
  { label: 'Discover', to: '/internships', icon: Search, active: browse },
  { label: 'Coaching', to: '/coaching', icon: GraduationCap, active: coaching },
  { label: 'Saved', to: '/app/saved', icon: Bookmark, active: (p) => p === '/app/saved', count: true },
  { label: 'Bookings', to: '/app/bookings', icon: CalendarDays, active: (p) => p === '/app/bookings' },
  {
    label: 'Me',
    to: '/app',
    icon: User,
    active: (p) => p === '/app' || p === '/app/profile' || p === '/app/settings',
  },
];

/* Below 768px only (CSS). `data-tabbar` is the contract with index.css: it sets --tabbar-total on :root,
   which pads the body and lifts toasts. Coach and admin use the menu sheet instead. */
export function MobileTabBar() {
  const { role, isLoading } = useAuth();
  const { path } = useShell();
  const p = pathOf(path);
  const { data: saved } = useSavedInternships({ enabled: role === 'student' });
  if (isBare(p) || role === 'coach' || role === 'admin') return null;
  const tabs = role === 'student' ? STUDENT : ANON;

  return (
    <nav
      data-tabbar
      className="sh-tabbar glass"
      aria-label="Primary"
      // Keeps the bar (and the body padding) in place while the session loads, without flashing the wrong tabs.
      style={isLoading ? { visibility: 'hidden' } : undefined}
    >
      {tabs.map((t) => (
        <SiteLink key={t.to} to={t.to} aria-current={t.active(p) ? 'page' : undefined}>
          <t.icon aria-hidden="true" />
          {t.label}
          {t.count && saved && saved.length > 0 ? (
            <span className="count-dot" aria-label={`${saved.length} saved`}>
              {saved.length}
            </span>
          ) : null}
        </SiteLink>
      ))}
    </nav>
  );
}
