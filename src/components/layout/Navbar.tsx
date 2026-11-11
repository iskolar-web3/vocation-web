import { Bookmark, ChevronDown, ListChecks, LogOut, Menu as MenuIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSavedInternships } from '../../services/queries';
import { Disc, Menu, MenuHeader, MenuItem, MenuSeparator, Sheet } from '../ui';
import { COACH_LINKS, STUDENT_LINKS, type ZoneLink, linkCurrent } from './AppSidebar';
import { SiteLink, currentFor, pathOf, useShell } from './shell';

const LINKS = [
  { label: 'Internships', to: '/internships', bases: ['/internships'] },
  { label: 'Companies', to: '/companies', bases: ['/companies'] },
  { label: 'Coaching', to: '/coaching', bases: ['/coaching', '/coaches'] },
];

const ADMIN_LINKS: ZoneLink[] = [{ label: 'Listings', to: '/admin/listings', icon: ListChecks }];

function Brand() {
  return (
    <SiteLink to="/" className="sh-brand" aria-label="Vocation by iSkolar, home">
      <img src="/vocation-logo.svg" alt="" width={28} height={28} />
      <b>Vocation</b>
      <small>by iSkolar</small>
    </SiteLink>
  );
}

/** Logo-only top bar for auth, onboarding and checkout. */
export function BareBar() {
  const { path } = useShell();
  const p = pathOf(path);
  const end =
    p === '/signin'
      ? { hint: 'New here?', label: 'Create an account', to: '/signup' }
      : p === '/signup'
        ? { hint: 'Have an account?', label: 'Sign in', to: '/signin' }
        : p === '/reset' || p === '/reset-password'
          ? { hint: '', label: 'Back to sign in', to: '/signin' }
          : null;
  return (
    <header className="sh-bare">
      <Brand />
      {end ? (
        <div className="sh-bare-end">
          {end.hint ? <span className="hidden sm:inline">{end.hint}</span> : null}
          <SiteLink to={end.to} className="btn btn-ghost btn-sm">
            {end.label}
          </SiteLink>
        </div>
      ) : null}
    </header>
  );
}

export function Navbar() {
  const { role, isAuthenticated, isLoading, userName, userEmail, logout } = useAuth();
  const { path, navigate } = useShell();
  const p = pathOf(path);
  const [sheet, setSheet] = useState(false);
  const isStudent = isAuthenticated && role === 'student';
  const { data: saved } = useSavedInternships({ enabled: isStudent });
  const savedCount = saved?.length ?? 0;

  // The sheet is a phone affordance: close it if the viewport grows past 768.
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const close = () => mq.matches && setSheet(false);
    mq.addEventListener('change', close);
    return () => mq.removeEventListener('change', close);
  }, []);

  const signOut = async () => {
    setSheet(false);
    await logout();
    navigate('/');
  };

  const zoneLinks: ZoneLink[] = role === 'student' ? STUDENT_LINKS : role === 'coach' ? COACH_LINKS : ADMIN_LINKS;
  const roleLabel = role === 'student' ? 'Student' : role === 'coach' ? 'Coach' : 'iSkolar team';
  const closeSheet = () => setSheet(false);

  const avatarFace = <Disc name={userName} size="sm" />;

  return (
    <header className="sh-nav-wrap">
      <nav className="sh-nav glass" aria-label="Main">
        <Brand />
        <div className="sh-links">
          {LINKS.map((l) => (
            <SiteLink key={l.to} to={l.to} aria-current={currentFor(p, l.to, l.bases)}>
              {l.label}
            </SiteLink>
          ))}
        </div>

        <div className="sh-end">
          {isLoading ? (
            <span style={{ width: 44, height: 44 }} aria-hidden="true" />
          ) : !isAuthenticated ? (
            <>
              <SiteLink to="/signin" className="btn btn-ghost btn-sm sh-md-only">
                Sign in
              </SiteLink>
              <SiteLink to="/signup" className="btn btn-primary btn-sm sh-md-only">
                Create free account
              </SiteLink>
              <button type="button" className="icon-btn sh-sm-only" aria-label="Menu" onClick={() => setSheet(true)}>
                <MenuIcon />
              </button>
            </>
          ) : (
            <>
              {role === 'student' ? (
                <SiteLink
                  to="/app/saved"
                  className="icon-btn sh-md-only"
                  aria-label={`Saved roles, ${savedCount}`}
                >
                  <Bookmark />
                  {savedCount > 0 ? <span className="count-dot">{savedCount}</span> : null}
                </SiteLink>
              ) : (
                <SiteLink
                  to={role === 'coach' ? '/coach' : '/admin/listings'}
                  className="btn btn-ghost btn-sm sh-md-only"
                >
                  {role === 'coach' ? 'Coach portal' : 'Listings'}
                </SiteLink>
              )}
              <Menu
                label="Account"
                trigger={
                  <button type="button" className="sh-avatar sh-md-only" aria-label="Account menu">
                    {avatarFace}
                    <ChevronDown aria-hidden="true" />
                  </button>
                }
              >
                <MenuHeader>
                  <p className="font-display">{userName}</p>
                  <p className="t-meta">{userEmail || roleLabel}</p>
                </MenuHeader>
                <MenuSeparator />
                {zoneLinks.map((l) => (
                  <MenuItem key={l.to} icon={<l.icon aria-hidden="true" />} render={<SiteLink to={l.to} />}>
                    {l.label}
                  </MenuItem>
                ))}
                <MenuSeparator />
                <MenuItem icon={<LogOut aria-hidden="true" />} danger onSelect={signOut}>
                  Sign out
                </MenuItem>
              </Menu>
              <button
                type="button"
                className="sh-avatar sh-sm-only"
                aria-label="Menu"
                onClick={() => setSheet(true)}
              >
                {avatarFace}
                <MenuIcon aria-hidden="true" />
              </button>
            </>
          )}
        </div>
      </nav>

      <Sheet
        open={sheet}
        onOpenChange={setSheet}
        title="Menu"
        footer={
          !isAuthenticated ? (
            <div className="sh-sheet-actions">
              <SiteLink to="/signup" className="btn btn-primary btn-block" onClick={closeSheet}>
                Create free account
              </SiteLink>
              <SiteLink to="/signin" className="btn btn-secondary btn-block" onClick={closeSheet}>
                Sign in
              </SiteLink>
            </div>
          ) : undefined
        }
      >
        {isAuthenticated ? (
          <div className="sh-sheet-who">
            {avatarFace}
            <div>
              <p className="font-display">{userName}</p>
              <p className="t-meta">{userEmail || roleLabel}</p>
            </div>
          </div>
        ) : null}
        {LINKS.map((l) => (
          <SiteLink
            key={l.to}
            to={l.to}
            className="sh-sheet-link"
            aria-current={currentFor(p, l.to, l.bases)}
            onClick={closeSheet}
          >
            {l.label}
          </SiteLink>
        ))}
        {isAuthenticated ? (
          <>
            <hr className="menu-sep" />
            {zoneLinks.map((l) => (
              <SiteLink
                key={l.to}
                to={l.to}
                className="sh-sheet-link"
                aria-current={linkCurrent(path, l)}
                onClick={closeSheet}
              >
                <l.icon aria-hidden="true" />
                {l.label}
                {l.saved && savedCount > 0 ? <span className="count-dot">{savedCount}</span> : null}
              </SiteLink>
            ))}
            <hr className="menu-sep" />
            <button type="button" className="sh-sheet-link" data-danger="" onClick={signOut}>
              <LogOut aria-hidden="true" />
              Sign out
            </button>
          </>
        ) : null}
      </Sheet>
    </header>
  );
}
