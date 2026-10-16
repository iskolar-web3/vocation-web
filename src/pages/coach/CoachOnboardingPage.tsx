import React, { useState } from 'react';
import {
  Compass,
  ArrowRight,
  ShieldCheck,
  Plus,
  X,
  Loader2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCreateCoachProfile } from '../../services/queries';

interface CoachOnboardingPageProps {
  navigate: (path: string) => void;
}

export const CoachOnboardingPage: React.FC<CoachOnboardingPageProps> = ({ navigate }) => {
  const { user, refetchUser } = useAuth();
  const createCoachMutation = useCreateCoachProfile();

  const [displayName, setDisplayName] = useState(user?.full_name || '');
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [experience, setExperience] = useState('');
  const [slug, setSlug] = useState(() => {
    return user?.full_name
      ? user.full_name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
      : '';
  });
  const [priceType, setPriceType] = useState<'free' | 'paid'>('paid');
  const [skills, setSkills] = useState<string[]>(['Career Guidance', 'Resume Review']);
  const [newSkill, setNewSkill] = useState('');
  const [acceptedAgreement, setAcceptedAgreement] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAddSkill = () => {
    const trimmed = newSkill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleSlugify = (val: string) => {
    const generated = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    setSlug(generated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const finalSlug = (
      slug.trim() ||
      displayName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
    );

    if (!displayName.trim() || !headline.trim() || !bio.trim() || !finalSlug) {
      setErrorMsg('Please fill in all required coach profile fields.');
      return;
    }

    if (!acceptedAgreement) {
      setErrorMsg('You must review and agree to the Coach Agreement before onboarding.');
      return;
    }

    try {
      await createCoachMutation.mutateAsync({
        display_name: displayName.trim(),
        headline: headline.trim(),
        bio: bio.trim(),
        experience: experience.trim() || undefined,
        languages: ['English', 'Filipino'],
        slug: finalSlug.trim().toLowerCase(),
        price_type: priceType,
        skills,
      });

      // Refetch user session so AuthContext immediately reflects is_onboarded: true
      await refetchUser();

      navigate('/coach');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to complete coach onboarding.');
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f7ff]/40 py-12 px-4 sm:px-6 flex items-center justify-center">
      <div className="max-w-xl w-full bg-white rounded-2xl border border-slate-200 p-8 shadow-xs space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-[#021F53] text-[#ff9b00] flex items-center justify-center mx-auto shadow-xs">
            <Compass className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-[#021F53] font-headline">
            Coach Onboarding
          </h1>
          <p className="text-xs text-slate-600 max-w-sm mx-auto">
            Build your public mentor profile and start offering 1-on-1 mentorship to Filipino college students.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#2c3f77] mb-1">
              Public Display Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Maria Santos"
              value={displayName}
              onChange={(e) => {
                setDisplayName(e.target.value);
                if (!slug) handleSlugify(e.target.value);
              }}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-[#021F53] outline-none focus:bg-white focus:border-[#3f58b2] focus:ring-2 focus:ring-[#3f58b2]/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#2c3f77] mb-1">
              Profile URL Slug (unique permanent link)
            </label>
            <div className="flex items-center">
              <span className="px-3 py-2.5 bg-slate-100 border border-r-0 border-slate-200 rounded-l-xl text-xs text-slate-500">
                iskolar.io/coaches/
              </span>
              <input
                type="text"
                required
                placeholder="maria-santos"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-r-xl text-xs font-medium text-[#021F53] outline-none focus:bg-white focus:border-[#3f58b2] focus:ring-2 focus:ring-[#3f58b2]/20 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#2c3f77] mb-1">
              Professional Headline
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Senior Software Engineer at Tech Corp | Tech Career Mentor"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-[#021F53] outline-none focus:bg-white focus:border-[#3f58b2] focus:ring-2 focus:ring-[#3f58b2]/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#2c3f77] mb-1">
              Mentorship Bio
            </label>
            <textarea
              required
              rows={3}
              placeholder="Share your industry experience and what students can learn from your 1-on-1 sessions..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-[#021F53] outline-none focus:bg-white focus:border-[#3f58b2] focus:ring-2 focus:ring-[#3f58b2]/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#2c3f77] mb-1">
              Mentorship Focus / Skills
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Add focus area (e.g. Mock Interview, Resume Audit, System Design)"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
                className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#021F53] outline-none focus:bg-white focus:border-[#3f58b2]"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-3.5 py-2 bg-[#3f58b2] hover:bg-[#021F53] text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 min-h-[32px]">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#f0f7ff] border border-[#3f58b2]/20 text-[#3f58b2] text-xs font-semibold"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="hover:text-rose-600 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Coach Agreement Acceptance (Issue #23) */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={acceptedAgreement}
                onChange={(e) => setAcceptedAgreement(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded text-[#3f58b2] focus:ring-[#3f58b2]"
              />
              <span className="text-xs text-slate-700 leading-relaxed">
                I agree to the{' '}
                <button
                  type="button"
                  onClick={() => navigate('/coach-agreement')}
                  className="text-[#3f58b2] font-semibold underline inline-flex items-center gap-0.5 cursor-pointer"
                >
                  Coach Marketplace Agreement <ExternalLink className="w-3 h-3" />
                </button>
                . I understand the platform takes a 10% fee on paid sessions (I receive 90%), payouts are disbursed via Philippine bank/e-wallet, and dispute/refund claims are subject to a 24-hour window.
              </span>
            </label>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={createCoachMutation.isPending || !acceptedAgreement}
              className="w-full py-3 bg-[#3f58b2] hover:bg-[#021F53] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {createCoachMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Create Coach Profile</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
