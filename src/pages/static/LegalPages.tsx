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
              iSkolar Vocation connects Filipino tertiary students with curated internship listings and 1-on-1 industry career coaching. <strong>iSkolar Vocation does not store or process third-party job applications on its servers (BR-001, BR-002).</strong> All internship applications proceed via outbound redirection directly to the employer's official recruitment portal.
            </p>

            <h3 className="font-bold text-base text-[#021F53]">2. Coaching Marketplace &amp; Commission Model</h3>
            <p>
              Paid coaching sessions are collected through our secure payment gateway partner. The platform retains a <strong>10% platform fee</strong> on paid bookings, with <strong>90% disbursed to the coach</strong> in accordance with ADR-0026 and ADR-0007.
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
          <div>
            <h1 className="text-3xl font-bold text-[#021F53] font-display">Privacy Notice &amp; Policy</h1>
            <p className="text-xs text-slate-500 mt-1">
              Compliant with Republic Act No. 10173 (Philippine Data Privacy Act of 2012) and its Implementing Rules and Regulations
            </p>
          </div>

          <div className="space-y-6 text-sm text-[#2c3f77] leading-relaxed">
            <section className="space-y-2">
              <h3 className="font-bold text-base text-[#021F53]">1. Personal Information Controller (PIC)</h3>
              <p>
                <strong>iSkolar Technologies Inc. (&quot;iSkolar Vocation&quot;)</strong> acts as the Personal Information Controller (PIC) under Philippine Republic Act No. 10173. For all privacy inquiries, data subject requests, or regulatory concerns, you may contact our designated Data Protection Officer (DPO) at{' '}
                <a href="mailto:dpo@iskolar.io" className="text-[#3f58b2] font-semibold underline hover:text-[#021F53]">
                  dpo@iskolar.io
                </a>{' '}
                or our support team at{' '}
                <a href="mailto:support@iskolar.io" className="text-[#3f58b2] font-semibold underline hover:text-[#021F53]">
                  support@iskolar.io
                </a>.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="font-bold text-base text-[#021F53]">2. Personal Data We Collect &amp; Specified Purposes</h3>
              <p>
                We collect and process personal data strictly for specified, legitimate purposes:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-xs">
                <li><strong>Account Registration &amp; Authentication:</strong> Full name, email address, password hash, and Google account identifier (when using Google OAuth) to manage user identity and secure authentication.</li>
                <li><strong>Student Profile &amp; Academic Details:</strong> University/college, academic program, year level, bio, and declared skills to personalize internship discovery and match coaching sessions.</li>
                <li><strong>Coach Mentorship Profile:</strong> Professional headline, bio, areas of expertise, session rates, availability schedule, and payout account information (masked) to operate the career coaching marketplace.</li>
                <li><strong>Session &amp; Booking Management:</strong> Booking timestamps, status, session notes, and video meeting URLs to coordinate coaching appointments between students and coaches.</li>
                <li><strong>Technical &amp; Telemetry Data:</strong> Hashed user-agent representations and click timestamps for internship application referral tracking without collecting application dossiers.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h3 className="font-bold text-base text-[#021F53]">3. Outbound Job Applications vs. Student Profile Resumes</h3>
              <p>
                <strong>Zero Job Application Storage:</strong> iSkolar Vocation does not store, review, or collect job applications, cover letters, or employment dossiers submitted to third-party employers. Outbound clicks redirect directly to employer recruitment portals.
              </p>
              <p>
                <strong>Profile Resumes:</strong> Students may optionally upload a resume (PDF only) to their private student profile. Resumes are stored encrypted in private cloud storage (AWS S3) and are accessible solely by the account owner. Resumes are never shared with prospective employers automatically.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="font-bold text-base text-[#021F53]">4. Third-Party Processors &amp; Cross-Border Transfers</h3>
              <p>
                Personal data is processed with vetted cloud processors governed by data processing agreements:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-xs">
                <li><strong>Neon Inc.</strong> — Managed PostgreSQL cloud database infrastructure with encryption at rest and in transit.</li>
                <li><strong>Amazon Web Services (AWS)</strong> — S3 private cloud object storage located in Singapore (ap-southeast-1 region) with AES-256 encryption.</li>
                <li><strong>Xendit Philippines</strong> — Bangko Sentral ng Pilipinas (BSP)-licensed payment gateway for payment checkout and coach disbursements. We never store credit/debit card numbers or CVVs.</li>
                <li><strong>Google LLC</strong> — Google OAuth authentication and Google Analytics 4 (utilizing Google Consent Mode v2, strictly denied by default until user consent is granted).</li>
                <li><strong>Sentry (Functional Software, Inc.)</strong> — Application error logging and performance telemetry, scrubbed to remove PII, passwords, cookies, and authentication tokens.</li>
                <li><strong>Coaching Participants:</strong> Only the student&#39;s first name is shared on public coach reviews (BR-011). Coaches never receive student email addresses.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h3 className="font-bold text-base text-[#021F53]">5. Data Retention &amp; Disposal</h3>
              <p>
                Account profiles are retained while active. Users may request account deletion or data export at any time. Financial and transaction ledgers are retained for a minimum of 5 years to comply with Philippine National Internal Revenue Code (NIRC) and commercial accounting requirements. Inactive session tokens and transient cache entries are purged regularly.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="font-bold text-base text-[#021F53]">6. Your Data Subject Rights (RA 10173)</h3>
              <p>
                Under the Data Privacy Act of 2012 (Sections 16 &amp; 18), you have the right to:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-xs">
                <li><strong>Be Informed:</strong> Know how and why your personal data is collected and processed.</li>
                <li><strong>Access:</strong> Request reasonable access to your personal data held by the platform.</li>
                <li><strong>Rectification:</strong> Correct any inaccuracies or deficiencies in your personal profile.</li>
                <li><strong>Erasure or Blocking:</strong> Request the deletion, blocking, or removal of your personal information.</li>
                <li><strong>Data Portability:</strong> Obtain a portable electronic copy of your account data.</li>
                <li><strong>Damages:</strong> Be indemnified for any damages sustained due to inaccurate, false, or unlawfully obtained personal data.</li>
                <li><strong>Lodge a Complaint:</strong> If you believe your privacy rights have been infringed, you have the right to file a complaint before the <strong>National Privacy Commission (NPC)</strong> at <a href="https://privacy.gov.ph" target="_blank" rel="noopener noreferrer" className="text-[#3f58b2] underline font-semibold">privacy.gov.ph</a>.</li>
              </ul>
            </section>
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
              <Building className="w-5 h-5 text-[#2563eb]" />
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
