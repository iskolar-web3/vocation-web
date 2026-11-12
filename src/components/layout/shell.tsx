import {
  type AnchorHTMLAttributes,
  type MouseEvent,
  type ReactNode,
  createContext,
  useContext,
} from 'react';

/* Router-agnostic shell. The live entry (App.tsx) and the TanStack root both render <SiteShell>
   and hand it the current path (with query) plus a navigate function, so nothing in the shell
   needs TanStack router context. */

export interface ShellNav {
  /** Pathname plus query string, e.g. "/coach?tab=earnings". */
  path: string;
  navigate: (to: string) => void;
}

const fallbackNav = (): ShellNav => ({
  path: typeof window === 'undefined' ? '/' : window.location.pathname + window.location.search,
  navigate: (to) => {
    window.history.pushState({}, '', to);
    window.dispatchEvent(new PopStateEvent('popstate'));
  },
});

export const ShellContext = createContext<ShellNav | null>(null);
export const useShell = (): ShellNav => useContext(ShellContext) ?? fallbackNav();

export const pathOf = (p: string) => p.split('?')[0] || '/';
export const queryOf = (p: string) => new URLSearchParams(p.split('?')[1] ?? '');
export const isUnder = (path: string, base: string) => path === base || path.startsWith(`${base}/`);

const BARE = ['/signin', '/signup', '/reset', '/reset-password', '/verify-email', '/onboarding', '/app/onboarding', '/coach/onboarding', '/onboarding/coach'];
export const isBare = (path: string) => BARE.includes(path) || isUnder(path, '/checkout');

/** aria-current value for a nav item: exact page, or the section it sits in. */
export const currentFor = (path: string, to: string, bases: string[] = [to]): 'page' | 'true' | undefined => {
  if (path === to) return 'page';
  return bases.some((b) => isUnder(path, b)) ? 'true' : undefined;
};

interface SiteLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  to: string;
}

export function SiteLink({ to, onClick, children, ...rest }: SiteLinkProps) {
  const { navigate } = useShell();
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || rest.target) return;
    e.preventDefault();
    navigate(to);
  };
  return (
    <a href={to} onClick={handle} {...rest}>
      {children}
    </a>
  );
}
