import React, { useState } from 'react';
import {
  GraduationCap,
  BookOpen,
  School,
  ArrowRight,
  Plus,
  X,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCreateStudentProfile } from '../../services/queries';

interface StudentOnboardingPageProps {
  navigate: (path: string) => void;
}

export const StudentOnboardingPage: React.FC<StudentOnboardingPageProps> = ({ navigate }) => {
  const { user, refetchUser } = useAuth();
  const createProfileMutation = useCreateStudentProfile();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [school, setSchool] = useState('');
  const [course, setCourse] = useState('');
  const [yearLevel, setYearLevel] = useState<number>(3);
  const [targetOjtHours, setTargetOjtHours] = useState('300');
  const [skills, setSkills] = useState<string[]>(['Communication', 'Problem Solving']);
  const [newSkill, setNewSkill] = useState('');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!fullName.trim() || !school.trim() || !course.trim()) {
      setErrorMsg('Please fill in your full name, university/college, and degree program.');
      return;
    }

    try {
      if (typeof window !== 'undefined' && targetOjtHours) {
        localStorage.setItem('vocation_target_ojt_hours', targetOjtHours);
      }

      await createProfileMutation.mutateAsync({
        full_name: fullName.trim(),
        school: school.trim(),
        course: course.trim(),
        year_level: Number(yearLevel),
        skills,
      });

      // Refetch user session so AuthContext immediately reflects is_onboarded: true
      await refetchUser();

      // Once onboarded, navigate to the student dashboard
      navigate('/app');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to complete student onboarding.');
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f7ff]/40 py-12 px-4 sm:px-6 flex items-center justify-center">
      <div className="max-w-xl w-full bg-white rounded-2xl border border-slate-200 p-8 shadow-xs space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-[#021F53] text-[#607ef2] flex items-center justify-center mx-auto shadow-xs">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-[#021F53] font-headline">
            Welcome to iSkolar Vocation!
          </h1>
          <p className="text-xs text-slate-600 max-w-sm mx-auto">
            Set up your student profile to unlock verified internship opportunities and 1-on-1 career coaching.
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
              Full Legal Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Juan Dela Cruz"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-[#021F53] outline-none focus:bg-white focus:border-[#3f58b2] focus:ring-2 focus:ring-[#3f58b2]/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#2c3f77] mb-1">
              University / College
            </label>
            <div className="relative">
              <School className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                placeholder="e.g. Polytechnic University of the Philippines"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-[#021F53] outline-none focus:bg-white focus:border-[#3f58b2] focus:ring-2 focus:ring-[#3f58b2]/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2c3f77] mb-1">
                Degree Program / Course
              </label>
              <div className="relative">
                <BookOpen className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. BS Information Tech"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-[#021F53] outline-none focus:bg-white focus:border-[#3f58b2] focus:ring-2 focus:ring-[#3f58b2]/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2c3f77] mb-1">
                Year Level
              </label>
              <select
                value={yearLevel}
                onChange={(e) => setYearLevel(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-[#021F53] outline-none focus:bg-white focus:border-[#3f58b2] focus:ring-2 focus:ring-[#3f58b2]/20"
              >
                <option value={1}>1st Year (Freshman)</option>
                <option value={2}>2nd Year (Sophomore)</option>
                <option value={3}>3rd Year (Junior)</option>
                <option value={4}>4th Year (Senior)</option>
                <option value={5}>5th Year (Graduating / Capstone)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#2c3f77] mb-1">
              Target OJT Practicum Hours
            </label>
            <input
              type="number"
              placeholder="e.g. 300"
              value={targetOjtHours}
              onChange={(e) => setTargetOjtHours(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-[#021F53] outline-none focus:bg-white focus:border-[#3f58b2] focus:ring-2 focus:ring-[#3f58b2]/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#2c3f77] mb-1">
              Top Skills / Interests
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Add a skill (e.g. React, Figma, SEO, Python)"
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

          <div className="pt-4">
            <button
              type="submit"
              disabled={createProfileMutation.isPending}
              className="tactile-btn-primary w-full py-3.5 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {createProfileMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Complete Profile &amp; Continue</span>
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
