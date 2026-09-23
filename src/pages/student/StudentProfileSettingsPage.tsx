import React, { useState, useEffect } from 'react';
import {
  User,
  Settings,
  GraduationCap,
  Save,
  CheckCircle2,
  Lock,
  ArrowLeft,
  Plus,
  Trash2,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useCurrentUser, useUpdateStudentProfile, useUpdateSettings } from '../../services/queries';
import { useAuth } from '../../context/AuthContext';

interface StudentProfileSettingsPageProps {
  navigate: (path: string) => void;
}

export const StudentProfileSettingsPage: React.FC<StudentProfileSettingsPageProps> = ({
  navigate,
}) => {
  const { user } = useAuth();
  const updateProfileMutation = useUpdateStudentProfile();
  const updateSettingsMutation = useUpdateSettings();

  const [activeTab, setActiveTab] = useState<'profile' | 'settings'>('profile');

  // Form states
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [school, setSchool] = useState('University of the Philippines Diliman');
  const [course, setCourse] = useState('BS Computer Science');
  const [yearLevel, setYearLevel] = useState('3rd Year');
  const [targetOjtHours, setTargetOjtHours] = useState('300');
  const [completedOjtHours, setCompletedOjtHours] = useState('120');
  const [bio, setBio] = useState('Passionate student developer exploring frontend architectures and UI design.');
  const [skills, setSkills] = useState<string[]>(['React', 'TypeScript', 'TailwindCSS', 'Node.js']);
  const [newSkill, setNewSkill] = useState('');

  const [isSavedToast, setIsSavedToast] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Settings states
  const [newPassword, setNewPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      await updateProfileMutation.mutateAsync({
        full_name: fullName.trim(),
        school,
        course,
        year_level: yearLevel,
        target_ojt_hours: parseInt(targetOjtHours, 10) || 300,
        completed_ojt_hours: parseInt(completedOjtHours, 10) || 0,
        bio,
        skills,
      });
      setIsSavedToast(true);
      setTimeout(() => setIsSavedToast(false), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save profile changes.');
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      await updateSettingsMutation.mutateAsync({
        password: newPassword || undefined,
      });
      setPasswordSuccess(true);
      setNewPassword('');
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update account settings.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <button
        onClick={() => navigate('/app')}
        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#3f58b2] hover:text-[#021F53] transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Student Dashboard</span>
      </button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#021F53] font-display">
            Student Profile &amp; Settings (S-024, S-025)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Update your academic details, target OJT hours, and notification preferences.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex bg-[#f0f7ff] p-1 rounded-full border border-[#607ef2]/20 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'profile'
                ? 'bg-[#3f58b2] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile (S-024)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'settings'
                ? 'bg-[#3f58b2] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Settings (S-025)</span>
          </button>
        </div>
      </div>

      {isSavedToast && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-scaleUp">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Profile changes saved successfully!</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2 animate-scaleUp">
          <AlertCircle className="w-4 h-4 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {activeTab === 'profile' ? (
        <form onSubmit={handleSaveProfile} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-bold text-[#021F53] font-headline flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-[#3f58b2]" />
              <span>Academic &amp; Practicum Information</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2c3f77] mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#f0f7ff] border border-[#607ef2]/20 rounded-xl text-xs font-semibold text-[#021F53] outline-none focus:ring-2 focus:ring-[#3f58b2]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2c3f77] mb-1">
                Registered University / College
              </label>
              <input
                type="text"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#f0f7ff] border border-[#607ef2]/20 rounded-xl text-xs font-semibold text-[#021F53] outline-none focus:ring-2 focus:ring-[#3f58b2]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2c3f77] mb-1">
                Degree / Course Program
              </label>
              <input
                type="text"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#f0f7ff] border border-[#607ef2]/20 rounded-xl text-xs font-semibold text-[#021F53] outline-none focus:ring-2 focus:ring-[#3f58b2]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2c3f77] mb-1">
                Year Level
              </label>
              <select
                value={yearLevel}
                onChange={(e) => setYearLevel(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#f0f7ff] border border-[#607ef2]/20 rounded-xl text-xs font-semibold text-[#021F53] outline-none focus:ring-2 focus:ring-[#3f58b2]"
              >
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
                <option value="5th Year">5th Year / Graduating</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2c3f77] mb-1">
                Target OJT Practicum Hours
              </label>
              <input
                type="number"
                value={targetOjtHours}
                onChange={(e) => setTargetOjtHours(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#f0f7ff] border border-[#607ef2]/20 rounded-xl text-xs font-semibold text-[#021F53] outline-none focus:ring-2 focus:ring-[#3f58b2]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2c3f77] mb-1">
                Completed Hours So Far
              </label>
              <input
                type="number"
                value={completedOjtHours}
                onChange={(e) => setCompletedOjtHours(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#f0f7ff] border border-[#607ef2]/20 rounded-xl text-xs font-semibold text-[#021F53] outline-none focus:ring-2 focus:ring-[#3f58b2]"
              />
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#2c3f77] mb-1">
              Short Bio &amp; Career Aspirations
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full px-3.5 py-2.5 bg-[#f0f7ff] border border-[#607ef2]/20 rounded-xl text-xs font-semibold text-[#021F53] outline-none focus:ring-2 focus:ring-[#3f58b2]"
            />
          </div>

          {/* Skills Management */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#2c3f77]">
              Technical &amp; Professional Skills
            </label>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="stamp-badge bg-[#f0f7ff] text-[#3f58b2] border border-[#607ef2]/20 px-3 py-1 flex items-center gap-1.5 text-xs font-bold"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="hover:text-rose-600 cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2 max-w-sm">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="e.g. Next.js, Figma, SQL..."
                className="flex-1 px-3 py-2 bg-[#f0f7ff] border border-[#607ef2]/20 rounded-xl text-xs font-semibold text-[#021F53] outline-none"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-3.5 py-2 bg-[#021F53] hover:bg-[#3f58b2] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Add Skill
              </button>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={updateProfileMutation.isPending}
              className="px-6 py-3 bg-[#3f58b2] hover:bg-[#021F53] text-white font-bold text-xs rounded-full shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {updateProfileMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>Save Profile (API-031)</span>
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleSaveSettings} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-bold text-[#021F53] font-headline flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#3f58b2]" />
              <span>Account Security &amp; Credentials</span>
            </h3>
          </div>

          {passwordSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Security settings updated successfully!</span>
            </div>
          )}

          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2c3f77] mb-1">
                Account Email (Read-only)
              </label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2c3f77] mb-1">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Leave blank to keep current password"
                className="w-full px-3.5 py-2.5 bg-[#f0f7ff] border border-[#607ef2]/20 rounded-xl text-xs font-semibold text-[#021F53] outline-none focus:ring-2 focus:ring-[#3f58b2]"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={updateSettingsMutation.isPending}
              className="px-6 py-3 bg-[#3f58b2] hover:bg-[#021F53] text-white font-bold text-xs rounded-full shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {updateSettingsMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>Update Settings (API-038)</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
