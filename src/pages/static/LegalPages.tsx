import React from 'react';
import { ShieldCheck, Mail, FileText, ArrowLeft, Building, HelpCircle, CheckCircle2 } from 'lucide-react';

interface LegalPageProps {
  page: 'terms' | 'privacy' | 'refunds' | 'coach-agreement' | 'contact';
  navigate: (path: string) => void;
}

export const LegalPages: React.FC<LegalPageProps> = ({ page, navigate }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <button
        onClick={() => navigate('/')}
        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#3f58b2] hover:text-[#021F53] transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </button>

      {/* Navigation Tabs for Legal Pages */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {[
          { id: 'terms', label: 'Terms of Service', path: '/terms' },
          { id: 'privacy', label: 'Privacy Policy', path: '/privacy' },
          { id: 'coach-agreement', label: 'Coach Agreement', path: '/coach-agreement' },
          { id: 'refunds', label: 'Refund Policy', path: '/refunds' },
          { id: 'contact', label: 'Contact Support', path: '/contact' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => navigate(tab.path)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              page === tab.id
                ? 'bg-[#021F53] text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {page === 'terms' && (
        <div className="bg-white rounded-2xl p-8 sm:p-12 border border-slate-200 shadow-soft space-y-6">
          <h1 className="text-3xl font-bold text-[#021F53] font-display">Terms of Service</h1>
          <p className="text-xs text-slate-500">Effective Date: October 2026</p>

          <div className="space-y-4 text-sm text-[#2c3f77] leading-relaxed">
            <h3 className="font-bold text-base text-[#021F53]">1. Platform Scope &amp; Outbound Application Model</h3>
            <p>
              iSkolar Vocation connects Filipino tertiary students with vetted internship listings and 1-on-1 industry career coaching. <strong>iSkolar Vocation does not store student resumes, cover letters, or job applications on its servers (BR-001, BR-002).</strong> All internship applications proceed via outbound redirection directly to the employer's official recruitment portal.
            </p>

            <h3 className="font-bold text-base text-[#021F53]">2. Coaching Marketplace &amp; Commission Model</h3>
            <p>
              Paid coaching sessions are collected through our secure payment gateway partner. The platform retains a <strong>10% platform fee</strong> on paid bookings, with <strong>90% disbursed to the verified coach</strong> in accordance with ADR-0026 and ADR-0007.
            </p>

            <h3 className="font-bold text-base text-[#021F53]">3. Session Scheduling, Attendance &amp; Conduct</h3>
            <p>
              Students and coaches agree to attend sessions at scheduled times in the Asia/Manila timezone. Both parties must treat one another with mutual respect, integrity, and professionalism.
            </p>

            <h3 className="font-bold text-base text-[#021F53]">4. Support &amp; Inquiries</h3>
            <p>
              For legal questions, disputes, or assistance, contact our dedicated support team at{' '}
              <a href="mailto:support@iskolar.io" className="text-[#3f58b2] font-semibold underline hover:text-[#021F53]">
                support@iskolar.io
              </a>.
            </p>
          </div>
        </div>
      )}

      {page === 'privacy' && (
        <div className="bg-white rounded-2xl p-8 sm:p-12 border border-slate-200 shadow-soft space-y-6">
          <h1 className="text-3xl font-bold text-[#021F53] font-display">Privacy Policy</h1>
          <p className="text-xs text-slate-500">
            Compliant with Philippine Republic Act No. 10173 (Data Privacy Act of 2012)
          </p>

          <div className="space-y-4 text-sm text-[#2c3f77] leading-relaxed">
            <h3 className="font-bold text-base text-[#021F53]">1. Information We Collect</h3>
            <p>
              We collect user account information (full name, email address, school, academic program, year level, and target OJT hours) solely to provide platform discovery services, recommend relevant roles, and schedule coaching sessions.
            </p>

            <h3 className="font-bold text-base text-[#021F53]">2. Zero Application Storage Principle</h3>
            <p>
              We do not collect, process, or store employment applications or confidential recruitment files submitted to third-party employers. Outbound clicks to employers are recorded solely for click telemetry without personal application dossiers.
            </p>

            <h3 className="font-bold text-base text-[#021F53]">3. Google Analytics &amp; Telemetry</h3>
            <p>
              We use <strong>Google Analytics 4</strong> with strict Google Consent Mode to measure aggregated booking funnel steps and website traffic. Analytics cookies are loaded <strong>only after explicit user consent</strong> via our cookie banner. No personal identifiable information (PII)—including names, email addresses, or booking notes—is ever passed to Google Analytics.
            </p>

            <h3 className="font-bold text-base text-[#021F53]">4. Review Transparency &amp; Anonymity</h3>
            <p>
              Coaching session ratings and reviews are displayed publicly with the student's first name only (BR-011) to safeguard student privacy.
            </p>

            <h3 className="font-bold text-base text-[#021F53]">5. Data Privacy Officer Contact</h3>
            <p>
              Questions or requests regarding data subject rights may be addressed to{' '}
              <a href="mailto:support@iskolar.io" className="text-[#3f58b2] font-semibold underline hover:text-[#021F53]">
                support@iskolar.io
              </a>.
            </p>
          </div>
        </div>
      )}

      {page === 'coach-agreement' && (
        <div className="bg-white rounded-2xl p-8 sm:p-12 border border-slate-200 shadow-soft space-y-6">
          <h1 className="text-3xl font-bold text-[#021F53] font-display">Coach Agreement</h1>
          <p className="text-xs text-slate-500">Effective Date: October 2026</p>

          <div className="space-y-4 text-sm text-[#2c3f77] leading-relaxed">
            <h3 className="font-bold text-base text-[#021F53]">1. Independent Contractor Relationship</h3>
            <p>
              Coaches provide mentorship, resume audits, and mock interviews as independent professionals. Coaches set their own availability slots and session pricing in Philippine Pesos (PHP).
            </p>

            <h3 className="font-bold text-base text-[#021F53]">2. 10% Platform Fee &amp; 90% Coach Share</h3>
            <p>
              In accordance with ADR-0026, iSkolar Vocation retains a <strong>10% platform fee</strong> per paid booking. Coaches receive <strong>90% of the session price</strong> (subject to standard centavo rounding). Earnings are tracked in real-time in the Coach Portal ledger.
            </p>

            <h3 className="font-bold text-base text-[#021F53]">3. Session Completion &amp; Auto-Completion Window</h3>
            <p>
              Sessions can be marked completed manually by either the coach or student after the scheduled call ends. If neither party acts, sessions <strong>auto-complete exactly 24 hours after the scheduled end time</strong> (ADR-0012) to ensure prompt coach payment.
            </p>

            <h3 className="font-bold text-base text-[#021F53]">4. Cancellation &amp; Refund Responsibilities</h3>
            <p>
              Coaches must provide at least 24 hours notice for any unavoidable schedule conflict. If a coach cancels a scheduled session, the student receives an immediate 100% full refund.
            </p>

            <h3 className="font-bold text-base text-[#021F53]">5. Inquiries &amp; Payout Support</h3>
            <p>
              For disbursement questions, bank updates, or disputes, reach us directly at{' '}
              <a href="mailto:support@iskolar.io" className="text-[#3f58b2] font-semibold underline hover:text-[#021F53]">
                support@iskolar.io
              </a>.
            </p>
          </div>
        </div>
      )}

      {page === 'refunds' && (
        <div className="bg-white rounded-2xl p-8 sm:p-12 border border-slate-200 shadow-soft space-y-6">
          <h1 className="text-3xl font-bold text-[#021F53] font-display">Refund &amp; Cancellation Policy</h1>
          <p className="text-xs text-slate-500">Rules ratified in ADR-0012 and ADR-0026</p>

          <div className="space-y-4 text-sm text-[#2c3f77] leading-relaxed">
            <h3 className="font-bold text-base text-[#021F53]">1. Student Cancellations (Strict 24-Hour Rule)</h3>
            <p>
              Students may cancel a paid session strictly <strong>more than 24 hours prior</strong> to the scheduled call start time for a <strong>100% full refund</strong> credited back to the original payment method. If a student cancels at 24 hours or less prior to the call, no refund is issued to protect coach scheduling.
            </p>

            <h3 className="font-bold text-base text-[#021F53]">2. Coach Cancellations</h3>
            <p>
              If a coach cancels a confirmed booking at any time, a <strong>100% full refund</strong> is automatically triggered and refunded to the student's original payment method.
            </p>

            <h3 className="font-bold text-base text-[#021F53]">3. Session Completion &amp; Dispute Window</h3>
            <p>
              Following the scheduled end time, sessions enter a <strong>24-hour completion window</strong> before final payout reconciliation. If any technical disruption, failure to connect, or no-show occurs, disputes must be reported within this 24-hour window by contacting{' '}
              <a href="mailto:support@iskolar.io" className="text-[#3f58b2] font-semibold underline hover:text-[#021F53]">
                support@iskolar.io
              </a>.
            </p>

            <h3 className="font-bold text-base text-[#021F53]">4. Refund Processing Time</h3>
            <p>
              Refunds are processed automatically via our payment gateway. Gateway credit card and e-wallet reversals generally reflect in 3 to 7 banking days depending on the customer's financial institution.
            </p>
          </div>
        </div>
      )}

      {page === 'contact' && (
        <div className="bg-white rounded-2xl p-8 sm:p-12 border border-slate-200 shadow-soft space-y-6">
          <h1 className="text-3xl font-bold text-[#021F53] font-display">Contact Us</h1>
          <p className="text-xs text-slate-500">We are here to assist students, coaches, and university partners.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
            <div className="p-6 rounded-2xl bg-[#f0f7ff] border border-[#607ef2]/20 space-y-2">
              <Mail className="w-5 h-5 text-[#3f58b2]" />
              <h4 className="font-bold text-sm text-[#021F53]">Student &amp; Coach Support</h4>
              <p className="text-xs text-[#2c3f77]">
                <a href="mailto:support@iskolar.io" className="underline hover:text-[#021F53]">
                  support@iskolar.io
                </a>
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#f0f7ff] border border-[#607ef2]/20 space-y-2">
              <Building className="w-5 h-5 text-[#ff9b00]" />
              <h4 className="font-bold text-sm text-[#021F53]">Employer &amp; University Partnerships</h4>
              <p className="text-xs text-[#2c3f77]">
                <a href="mailto:support@iskolar.io" className="underline hover:text-[#021F53]">
                  support@iskolar.io
                </a>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
