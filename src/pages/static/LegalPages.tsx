import React from 'react';
import { ShieldCheck, Mail, FileText, ArrowLeft, Phone, MapPin, Building } from 'lucide-react';

interface LegalPageProps {
  page: 'terms' | 'privacy' | 'refunds' | 'contact';
  navigate: (path: string) => void;
}

export const LegalPages: React.FC<LegalPageProps> = ({ page, navigate }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <button
        onClick={() => navigate('/')}
        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#3f58b2] hover:text-[#021F53] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </button>

      {page === 'terms' && (
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#3f58b2]/10 shadow-soft space-y-6">
          <h1 className="text-3xl font-bold text-[#021F53] font-display">Terms of Service (S-014)</h1>
          <p className="text-xs text-slate-500">Effective Date: September 2026</p>

          <div className="space-y-4 text-sm text-[#2c3f77] leading-relaxed">
            <h3 className="font-bold text-base text-[#021F53]">1. Platform Scope & Outbound Application Model</h3>
            <p>
              iSkolar Vocation connects Filipino college students with internship discovery and 1-on-1 career coaching. <strong>In accordance with Rule BR-001, iSkolar Vocation does not store student resumes, cover letters, or job applications.</strong> All applications are completed via outbound redirection to the employer's official recruitment portal.
            </p>

            <h3 className="font-bold text-base text-[#021F53]">2. Coaching Marketplace & Payments</h3>
            <p>
              Paid coaching sessions are processed securely through our payment partner, PayMongo Philippines. The platform retains a 5% commission on paid sessions, with 95% disbursed to the verified coach (BR-008).
            </p>

            <h3 className="font-bold text-base text-[#021F53]">3. Student Conduct</h3>
            <p>
              Students agree to arrive on time for scheduled coaching sessions and treat coaches with professionalism.
            </p>
          </div>
        </div>
      )}

      {page === 'privacy' && (
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#3f58b2]/10 shadow-soft space-y-6">
          <h1 className="text-3xl font-bold text-[#021F53] font-display">Privacy Policy (S-015)</h1>
          <p className="text-xs text-slate-500">Compliant with Philippine Republic Act No. 10173 (Data Privacy Act of 2012)</p>

          <div className="space-y-4 text-sm text-[#2c3f77] leading-relaxed">
            <h3 className="font-bold text-base text-[#021F53]">1. Information We Collect</h3>
            <p>
              We collect user account information (full name, email, school, degree program, year level, target OJT hours) solely to provide platform services, recommend matching roles, and schedule coaching sessions.
            </p>

            <h3 className="font-bold text-base text-[#021F53]">2. Zero Application Storage Principle</h3>
            <p>
              We do not collect or store employment applications or confidential recruitment files submitted to third-party employers.
            </p>

            <h3 className="font-bold text-base text-[#021F53]">3. Review Transparency</h3>
            <p>
              In accordance with BR-011, coaching session ratings and reviews are displayed publicly with the student's first name only to protect student privacy.
            </p>
          </div>
        </div>
      )}

      {page === 'refunds' && (
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#3f58b2]/10 shadow-soft space-y-6">
          <h1 className="text-3xl font-bold text-[#021F53] font-display">Refund & Cancellation Policy (S-016)</h1>
          <p className="text-xs text-slate-500">Required for PayMongo Marketplace Gateway</p>

          <div className="space-y-4 text-sm text-[#2c3f77] leading-relaxed">
            <h3 className="font-bold text-base text-[#021F53]">1. Cancellation Prior to Session</h3>
            <p>
              Students may cancel a paid session up to 24 hours prior to the scheduled call time for a 100% full refund credited back through PayMongo.
            </p>

            <h3 className="font-bold text-base text-[#021F53]">2. Coach No-Show Guarantee</h3>
            <p>
              If a coach fails to attend a confirmed session within 15 minutes of the start time, the student is immediately issued a full refund or a free reschedule.
            </p>
          </div>
        </div>
      )}

      {page === 'contact' && (
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#3f58b2]/10 shadow-soft space-y-6">
          <h1 className="text-3xl font-bold text-[#021F53] font-display">Contact Us (S-017)</h1>
          <p className="text-xs text-slate-500">We are here to support students, coaches, and university partners.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
            <div className="p-5 rounded-2xl bg-[#f0f7ff] border border-[#607ef2]/20 space-y-2">
              <Mail className="w-5 h-5 text-[#3f58b2]" />
              <h4 className="font-bold text-sm text-[#021F53]">Student & Coach Support</h4>
              <p className="text-xs text-[#2c3f77]">support@iskolar.edu.ph</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#f0f7ff] border border-[#607ef2]/20 space-y-2">
              <Building className="w-5 h-5 text-[#ff9b00]" />
              <h4 className="font-bold text-sm text-[#021F53]">Employer & University Partnerships</h4>
              <p className="text-xs text-[#2c3f77]">partnerships@iskolar.io</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
