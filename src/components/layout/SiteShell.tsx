import type { ReactNode } from 'react';
import { CookieConsentBanner } from '../common/CookieConsentBanner';
import { Toaster } from '../ui';
import { AppFrame, zoneOf } from './AppSidebar';
import { Footer } from './Footer';
import { MobileTabBar } from './MobileTabBar';
import { BareBar, Navbar } from './Navbar';
import { ShellContext, isBare, pathOf } from './shell';
import './shell.css';

/* The one place the chrome is composed. App.tsx (live entry) and routes/__root.tsx both render it. */

export function SiteShell({
  children,
  currentPath,
  navigate,
  autoFrame = true,
}: {
  children: ReactNode;
  currentPath: string;
  navigate: (to: string) => void;
  /** Frame /app and /coach pages with the sidebar. The TanStack zone routes do it themselves (autoFrame=false). */
  autoFrame?: boolean;
}) {
  const path = pathOf(currentPath);
  const bare = isBare(path);

  return (
    <ShellContext.Provider value={{ path: currentPath, navigate }}>
      <a className="sh-skip" href="#main">
        Skip to content
      </a>
      {bare ? <BareBar /> : <Navbar />}
      <CookieConsentBanner />
      <main id="main" className="min-h-[60svh]">
        {autoFrame && !bare ? <AppFrame zone={zoneOf(path)}>{children}</AppFrame> : children}
      </main>
      {bare ? null : <Footer />}
      {bare ? null : <MobileTabBar />}
      <Toaster />
    </ShellContext.Provider>
  );
}
