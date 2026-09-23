import React from 'react';
import { ShieldCheck, ExternalLink } from 'lucide-react';

interface FooterProps {
  navigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ navigate }) => {
  return (
    <footer className="bg-[#021F53] text-white pt-16 pb-12 border-t border-[#3f58b2]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-3 text-left group focus:outline-none"
            >
              <img
                src="/vocation-logo.svg"
                alt="iSkolar Vocation"
                className="w-10 h-10 rounded-2xl shadow-md group-hover:scale-105 transition-transform"
              />
              <div>
                <span className="font-display text-2xl text-white tracking-tight block leading-tight">
                  iSkolar <span className="text-[#607ef2]">Vocation</span>
                </span>
                <span className="text-[10px] font-bold text-[#ff9b00] tracking-wider uppercase block font-accent">
                  Internships &amp; Coaching
                </span>
              </div>
            </button>
            <p className="text-sm text-slate-300 max-w-sm leading-relaxed">
              The dedicated internship &amp; OJT directory paired with 1-on-1 career coaching, mock interviews, and resume reviews for Filipino college students.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-[#ff9b00] font-semibold">
              <ShieldCheck className="w-4 h-4 text-[#ff9b00]" />
              <span>Outbound Direct Apply · No Stored Applications (BR-001)</span>
            </div>
          </div>

          {/* Internships Pillar */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#607ef2] font-headline">
              Internships
            </h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>
                <button
                  onClick={() => navigate('/internships')}
                  className="hover:text-white transition-colors"
                >
                  Explore Directory
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/companies')}
                  className="hover:text-white transition-colors"
                >
                  Company Directory
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/internships?setup=remote')}
                  className="hover:text-white transition-colors"
                >
                  Remote Internships
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/internships?field=Software+Engineering')}
                  className="hover:text-white transition-colors"
                >
                  Tech &amp; OJT Roles
                </button>
              </li>
            </ul>
          </div>

          {/* Coaching Pillar */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#607ef2] font-headline">
              Coaching Marketplace
            </h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>
                <button
                  onClick={() => navigate('/coaching')}
                  className="hover:text-white transition-colors"
                >
                  How Coaching Works
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/coaches')}
                  className="hover:text-white transition-colors"
                >
                  Find a 1-on-1 Coach
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/coaches?price=free')}
                  className="hover:text-white transition-colors"
                >
                  Free Intro Sessions
                </button>
              </li>
            </ul>
          </div>

          {/* Portals & Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#607ef2] font-headline">
              Portals &amp; Legal
            </h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>
                <button
                  onClick={() => navigate('/admin/listings')}
                  className="hover:text-white transition-colors"
                >
                  Admin Moderation
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/terms')}
                  className="hover:text-white transition-colors"
                >
                  Terms of Service (S-014)
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/privacy')}
                  className="hover:text-white transition-colors"
                >
                  Privacy Policy (S-015)
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/refunds')}
                  className="hover:text-white transition-colors"
                >
                  Refund Policy (S-016)
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/contact')}
                  className="hover:text-white transition-colors"
                >
                  Contact Us (S-017)
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Clean Footer Bottom - Clichés removed */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            © 2026 iSkolar Vocation. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate('/terms')}
              className="hover:text-slate-300 transition-colors"
            >
              Terms
            </button>
            <button
              onClick={() => navigate('/privacy')}
              className="hover:text-slate-300 transition-colors"
            >
              Privacy
            </button>
            <button
              onClick={() => navigate('/refunds')}
              className="hover:text-slate-300 transition-colors"
            >
              Refunds
            </button>
            <button
              onClick={() => navigate('/contact')}
              className="hover:text-slate-300 transition-colors"
            >
              Contact
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
