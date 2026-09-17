import React, { useState } from 'react';
import {
  Briefcase,
  Building,
  MapPin,
  Banknote,
  Clock,
  ExternalLink,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { Internship, WorkSetup } from '../../types';
import { useData } from '../../context/DataContext';

interface PostingComposerProps {
  initialData?: Internship;
  onSuccess: (internship: Internship) => void;
  onCancel: () => void;
}

export const PostingComposer: React.FC<PostingComposerProps> = ({
  initialData,
  onSuccess,
  onCancel,
}) => {
  const { createInternshipPosting, updateInternshipPosting, employerProfile } = useData();

  const [title, setTitle] = useState(initialData?.title || '');
  const [field, setField] = useState(initialData?.field || 'Software Engineering');
  const [workSetup, setWorkSetup] = useState<WorkSetup>(initialData?.workSetup || 'hybrid');
  const [isPaid, setIsPaid] = useState(initialData ? initialData.isPaid : true);
  const [stipendAmount, setStipendAmount] = useState(initialData?.stipendAmount?.toString() || '15000');
  const [durationWeeks, setDurationWeeks] = useState(initialData?.durationWeeks?.toString() || '12');
  const [ojtHours, setOjtHours] = useState(initialData?.ojtHours?.toString() || '300');
  const [deadline, setDeadline] = useState(
    initialData?.deadline
      ? initialData.deadline.split('T')[0]
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [applyUrl, setApplyUrl] = useState(initialData?.applyUrl || 'https://www.maya.ph/careers');
  const [description, setDescription] = useState(
    initialData?.description ||
      'Join our high-impact team to work on production features, collaborate with senior mentors, and gain credited OJT experience.'
  );

  const [responsibilities, setResponsibilities] = useState<string[]>(
    initialData?.responsibilities || [
      'Build and test user-facing features using modern tech stacks',
      'Collaborate in agile sprint ceremonies with engineering and design squads',
      'Write clean, maintainable, and well-documented code',
    ]
  );
  const [requirements, setRequirements] = useState<string[]>(
    initialData?.requirements || [
      'Currently enrolled in BS Computer Science, IT, or related degree (3rd to 5th year)',
      'Foundational understanding of core concepts in the chosen discipline',
      'Available for 300+ hours of accredited OJT / internship',
    ]
  );
  const [perks, setPerks] = useState<string[]>(
    initialData?.perks || [
      'Competitive monthly stipend',
      'Work laptop provided',
      'Official Certificate of Completion & conversion pathway',
    ]
  );

  const [newResp, setNewResp] = useState('');
  const [newReq, setNewReq] = useState('');
  const [newPerk, setNewPerk] = useState('');

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddResp = () => {
    if (newResp.trim()) {
      setResponsibilities([...responsibilities, newResp.trim()]);
      setNewResp('');
    }
  };

  const handleAddReq = () => {
    if (newReq.trim()) {
      setRequirements([...requirements, newReq.trim()]);
      setNewReq('');
    }
  };

  const handleAddPerk = () => {
    if (newPerk.trim()) {
      setPerks([...perks, newPerk.trim()]);
      setNewPerk('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Job title is required');
      return;
    }
    if (!applyUrl.trim() || !applyUrl.startsWith('http')) {
      setError('A valid external Application URL (https://...) is required for outbound redirects (BR-001).');
      return;
    }

    setIsSubmitting(true);
    setError('');

    const postingPayload = {
      title: title.trim(),
      company: {
        name: employerProfile.companyName,
        slug: employerProfile.companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        logo: employerProfile.logo,
        isVerified: employerProfile.isVerified,
        location: employerProfile.location,
        industry: employerProfile.industry,
      },
      field,
      workSetup,
      isPaid,
      stipendAmount: isPaid ? parseInt(stipendAmount, 10) || 0 : undefined,
      stipendPeriod: 'month' as const,
      durationWeeks: parseInt(durationWeeks, 10) || 12,
      ojtHours: parseInt(ojtHours, 10) || 300,
      deadline: `${deadline}T23:59:59Z`,
      description: description.trim(),
      responsibilities,
      requirements,
      perks,
      applyUrl: applyUrl.trim(),
    };

    if (initialData) {
      updateInternshipPosting(initialData.id, {
        ...postingPayload,
        status: 'pending', // re-enters moderation queue
      });
      setIsSubmitting(false);
      onSuccess({ ...initialData, ...postingPayload, status: 'pending' });
    } else {
      const created = createInternshipPosting(postingPayload);
      setIsSubmitting(false);
      onSuccess(created);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
      {/* Header banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#021F53] to-[#3f58b2] text-white space-y-2 shadow-soft">
        <span className="text-xs font-bold text-[#ff9b00] uppercase tracking-wider font-accent">
          {initialData ? 'Edit Internship Listing' : 'New Internship / OJT Posting'}
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold font-headline">
          {initialData ? 'Update & Resubmit Posting' : 'Publish Opportunity for Students'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-200">
          Postings enter the moderation queue before going live in the public directory (BR-003, BR-004).
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Section 1: Basic Information */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#3f58b2]/10 shadow-soft space-y-6">
        <h3 className="text-lg font-bold text-[#021F53] pb-3 border-b border-slate-100 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-[#3f58b2]" />
          <span>1. Role & Discipline</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#2c3f77] mb-1.5">
              Internship Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Frontend Developer Intern (React & TypeScript)"
              className="w-full px-4 py-3 bg-[#f0f7ff] border border-[#607ef2]/20 rounded-2xl text-sm font-semibold text-[#021F53] focus:outline-none focus:ring-2 focus:ring-[#3f58b2]/30"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#2c3f77] mb-1.5">
              Field of Study
            </label>
            <select
              value={field}
              onChange={(e) => setField(e.target.value)}
              className="w-full px-4 py-3 bg-[#f0f7ff] border border-[#607ef2]/20 rounded-2xl text-sm font-semibold text-[#021F53] focus:outline-none focus:ring-2 focus:ring-[#3f58b2]/30"
            >
              <option value="Software Engineering">Software Engineering</option>
              <option value="UI/UX Design">UI/UX Design</option>
              <option value="Data Science & AI">Data Science & AI</option>
              <option value="Cybersecurity">Cybersecurity</option>
              <option value="Business & Operations">Business & Operations</option>
              <option value="Marketing">Marketing</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Finance">Finance</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#2c3f77] mb-1.5">
              Work Setup
            </label>
            <select
              value={workSetup}
              onChange={(e) => setWorkSetup(e.target.value as WorkSetup)}
              className="w-full px-4 py-3 bg-[#f0f7ff] border border-[#607ef2]/20 rounded-2xl text-sm font-semibold text-[#021F53] focus:outline-none focus:ring-2 focus:ring-[#3f58b2]/30"
            >
              <option value="remote">100% Remote</option>
              <option value="hybrid">Hybrid (Office + Remote)</option>
              <option value="onsite">On-site in Office</option>
            </select>
          </div>
        </div>
      </div>

      {/* Section 2: Compensation & Hours */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#3f58b2]/10 shadow-soft space-y-6">
        <h3 className="text-lg font-bold text-[#021F53] pb-3 border-b border-slate-100 flex items-center gap-2">
          <Banknote className="w-5 h-5 text-[#ff9b00]" />
          <span>2. Compensation & OJT Credits</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#2c3f77] mb-1.5">
              Paid Allowance?
            </label>
            <div className="flex items-center gap-4 pt-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-[#021F53] cursor-pointer">
                <input
                  type="radio"
                  name="compensation"
                  checked={isPaid}
                  onChange={() => setIsPaid(true)}
                  className="w-4 h-4 text-[#3f58b2]"
                />
                <span>Paid Stipend</span>
              </label>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-600 cursor-pointer">
                <input
                  type="radio"
                  name="compensation"
                  checked={!isPaid}
                  onChange={() => setIsPaid(false)}
                  className="w-4 h-4 text-[#3f58b2]"
                />
                <span>Unpaid</span>
              </label>
            </div>
          </div>

          {isPaid && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2c3f77] mb-1.5">
                Monthly Stipend (PHP)
              </label>
              <input
                type="number"
                value={stipendAmount}
                onChange={(e) => setStipendAmount(e.target.value)}
                placeholder="15000"
                className="w-full px-4 py-3 bg-[#f0f7ff] border border-[#607ef2]/20 rounded-2xl text-sm font-semibold text-[#021F53]"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#2c3f77] mb-1.5">
              Accredited OJT Hours
            </label>
            <input
              type="number"
              value={ojtHours}
              onChange={(e) => setOjtHours(e.target.value)}
              placeholder="300"
              className="w-full px-4 py-3 bg-[#f0f7ff] border border-[#607ef2]/20 rounded-2xl text-sm font-semibold text-[#021F53]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#2c3f77] mb-1.5">
              Duration (Weeks)
            </label>
            <input
              type="number"
              value={durationWeeks}
              onChange={(e) => setDurationWeeks(e.target.value)}
              placeholder="12"
              className="w-full px-4 py-3 bg-[#f0f7ff] border border-[#607ef2]/20 rounded-2xl text-sm font-semibold text-[#021F53]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#2c3f77] mb-1.5">
              Application Deadline
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-4 py-3 bg-[#f0f7ff] border border-[#607ef2]/20 rounded-2xl text-sm font-semibold text-[#021F53]"
              required
            />
          </div>
        </div>
      </div>

      {/* Section 3: Official Apply Link & Outbound Compliance (BR-001) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#3f58b2]/10 shadow-soft space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-lg font-bold text-[#021F53] flex items-center gap-2">
            <ExternalLink className="w-5 h-5 text-[#607ef2]" />
            <span>3. Outbound Application Link</span>
          </h3>
          <span className="text-[11px] font-bold text-[#ff9b00] bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
            BR-001 Outbound Apply Rule
          </span>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#2c3f77] mb-1.5">
            Employer's Official Application URL *
          </label>
          <input
            type="url"
            value={applyUrl}
            onChange={(e) => setApplyUrl(e.target.value)}
            placeholder="https://company.com/careers/internship-apply"
            className="w-full px-4 py-3 bg-[#f0f7ff] border border-[#607ef2]/20 rounded-2xl text-sm font-semibold text-[#021F53]"
            required
          />
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
            Students will be directed to this link to submit their application directly on your website. iSkolar Vocation does not store applications.
          </p>
        </div>
      </div>

      {/* Section 4: Details, Responsibilities & Requirements */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#3f58b2]/10 shadow-soft space-y-6">
        <h3 className="text-lg font-bold text-[#021F53] pb-3 border-b border-slate-100 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#3f58b2]" />
          <span>4. Role Description & Requirements</span>
        </h3>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#2c3f77] mb-1.5">
            Role Overview
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full p-4 bg-[#f0f7ff] border border-[#607ef2]/20 rounded-2xl text-sm text-[#021F53]"
          />
        </div>

        {/* Responsibilities */}
        <div className="space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#2c3f77]">
            Key Responsibilities
          </label>
          <div className="space-y-2">
            {responsibilities.map((resp, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs bg-slate-50 p-2.5 rounded-xl">
                <span className="flex-1 font-medium text-slate-700">• {resp}</span>
                <button
                  type="button"
                  onClick={() => setResponsibilities(responsibilities.filter((_, i) => i !== idx))}
                  className="p-1 text-slate-400 hover:text-rose-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newResp}
              onChange={(e) => setNewResp(e.target.value)}
              placeholder="Add another responsibility..."
              className="flex-1 px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl"
            />
            <button
              type="button"
              onClick={handleAddResp}
              className="px-4 py-2 bg-[#f0f7ff] text-[#3f58b2] text-xs font-bold rounded-xl border border-[#3f58b2]/20"
            >
              Add
            </button>
          </div>
        </div>

        {/* Requirements */}
        <div className="space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#2c3f77]">
            Candidate Requirements
          </label>
          <div className="space-y-2">
            {requirements.map((req, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs bg-slate-50 p-2.5 rounded-xl">
                <span className="flex-1 font-medium text-slate-700">• {req}</span>
                <button
                  type="button"
                  onClick={() => setRequirements(requirements.filter((_, i) => i !== idx))}
                  className="p-1 text-slate-400 hover:text-rose-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newReq}
              onChange={(e) => setNewReq(e.target.value)}
              placeholder="Add a requirement..."
              className="flex-1 px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl"
            />
            <button
              type="button"
              onClick={handleAddReq}
              className="px-4 py-2 bg-[#f0f7ff] text-[#3f58b2] text-xs font-bold rounded-xl border border-[#3f58b2]/20"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-4 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 text-sm font-semibold text-[#2c3f77] hover:bg-slate-100 rounded-full"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-8 py-3.5 bg-[#3f58b2] hover:bg-[#021F53] text-white font-bold text-sm rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{initialData ? 'Save & Submit to Moderation' : 'Submit Posting to Queue'}</span>
        </button>
      </div>
    </form>
  );
};
