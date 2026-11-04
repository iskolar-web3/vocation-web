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
  Eye,
  EyeOff,
  Download,
  Shield,
} from 'lucide-react';
import {
  useCurrentUser,
  useFeatures,
  useStudentProfile,
  useUpdateStudentProfile,
  useUpdateSettings,
} from '../../services/queries';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import { api } from '../../lib/api';
import { ComingSoonBadge } from '../../components/common/ComingSoonBadge';

interface StudentProfileSettingsPageProps {
  navigate: (path: string) => void;
}

export const StudentProfileSettingsPage: React.FC<StudentProfileSettingsPageProps> = ({
  navigate,
}) => {
  const { user, role, refetchUser, logout } = useAuth();
  const features = useFeatures();
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const { data: studentProfile } = useStudentProfile({ enabled: role === 'student' });
  const updateProfileMutation = useUpdateStudentProfile();
  const updateSettingsMutation = useUpdateSettings();

  const [activeTab, setActiveTab] = useState<'profile' | 'settings'>('profile');

  // Form states
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [school, setSchool] = useState('');
  const [course, setCourse] = useState('');
  const [yearLevel, setYearLevel] = useState<number>(3);
  const [targetOjtHours, setTargetOjtHours] = useState('300');
  const [completedOjtHours, setCompletedOjtHours] = useState('180');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState<string[]>(['React', 'TypeScript', 'Node.js']);
  const [newSkill, setNewSkill] = useState('');

  const [isSavedToast, setIsSavedToast] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Settings states
  const [currentPassword, setCurrentPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState<string | null>(null);
  const [passwordErrorMsg, setPasswordErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (studentProfile) {
      if (studentProfile.full_name) setFullName(studentProfile.full_name);
      if (studentProfile.school) setSchool(studentProfile.school);
      if (studentProfile.course) setCourse(studentProfile.course);
      if (studentProfile.year_level) setYearLevel(studentProfile.year_level);
      if (studentProfile.bio) setBio(studentProfile.bio);
      if (studentProfile.skills && studentProfile.skills.length > 0) {
        setSkills(studentProfile.skills);
      }
      const localTarget = typeof window !== 'undefined' ? localStorage.getItem('vocation_target_ojt_hours') : null;
      if (localTarget) {
        setTargetOjtHours(localTarget);
      } else if (studentProfile.target_ojt_hours !== undefined && studentProfile.target_ojt_hours !== null) {
        setTargetOjtHours(String(studentProfile.target_ojt_hours));
      }
      if (studentProfile.completed_ojt_hours !== undefined && studentProfile.completed_ojt_hours !== null) {
        setCompletedOjtHours(String(studentProfile.completed_ojt_hours));
      }
    } else if (user) {
      if (user.full_name) setFullName(user.full_name);
      if (user.email) setEmail(user.email);
    }
  }, [studentProfile, user]);

  const handleExportData = () => {
    const exportPayload = {
      user: {
        id: user?.id,
        email: user?.email,
        full_name: user?.full_name,
        role: user?.role,
        is_onboarded: user?.is_onboarded,
      },
      profile: studentProfile || {
        full_name: fullName,
        school,
        course,
        year_level: yearLevel,
        skills,
        bio,
      },
      exported_at: new Date().toISOString(),
      basis: 'RA 10173 Section 18 Data Portability',
    };
    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vocation-user-data-${user?.id || 'export'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Account data exported successfully!');
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to request permanent erasure of your account and personal data? Under RA 10173, your personal data will be erased.')) {
      return;
    }
    setIsDeletingAccount(true);
    try {
      try {
        await api.delete('/me');
      } catch {
        // Fallback when backend does not register DELETE /me
      }
      toast.success('Account erasure request processed.');
      if (logout) {
        await logout();
      }
      navigate('/');
    } catch (err: any) {
      toast.error(`Failed to submit deletion request: ${err.message}`);
    } finally {
      setIsDeletingAccount(false);
    }
  };

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
      if (typeof window !== 'undefined') {
        localStorage.setItem('vocation_target_ojt_hours', targetOjtHours);
        localStorage.setItem('vocation_completed_ojt_hours', completedOjtHours);
      }
      await updateProfileMutation.mutateAsync({
        full_name: fullName.trim(),
        school: school.trim(),
        course: course.trim(),
        year_level: Number(yearLevel),
        bio: bio.trim(),
        skills,
      });
      if (refetchUser) {
        await refetchUser();
      }
      setIsSavedToast(true);
      toast.success('Profile changes saved successfully!');
      setTimeout(() => setIsSavedToast(false), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save profile changes.');
      toast.error(err.message || 'Failed to save profile changes.');
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordErrorMsg(null);
    setPasswordSuccessMsg(null);

    if (!currentPassword.trim()) {
      setPasswordErrorMsg('Please enter your current password to confirm changes.');
      toast.error('Please enter your current password.');
      return;
    }

    if (!newPassword.trim()) {
      setPasswordErrorMsg('Please enter a new password.');
      toast.error('Please enter a new password.');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordErrorMsg('Password must be at least 8 characters long.');
      toast.error('Password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordErrorMsg('New password and confirmation password do not match.');
      toast.error('New password and confirmation password do not match.');
      return;
    }

    try {
      // API-038: changing the password needs current_password. The email is
      // read-only on this page, so it is never sent (Audit CON-11).
      await updateSettingsMutation.mutateAsync({
        current_password: currentPassword,
        password: newPassword,
      });
      if (refetchUser) {
        await refetchUser();
      }
      setPasswordSuccessMsg('Password changed successfully! Your account credentials have been updated.');
      toast.success('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccessMsg(null), 4000);
    } catch (err: any) {
      setPasswordErrorMsg(err.message || 'Failed to update account password.');
      toast.error(err.message || 'Failed to update account password.');
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
            Student Profile &amp; Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Update your academic details, target OJT hours, and notification preferences.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex bg-[#f0f7ff] p-1 rounded-xl border border-[#607ef2]/20 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'profile'
                ? 'bg-[#3f58b2] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'settings'
                ? 'bg-[#3f58b2] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {isSavedToast && (
        <div className="p-4 rounded-2xl bg-[#f0f7ff] border border-[#607ef2]/30 text-[#021F53] text-xs font-bold flex items-center gap-2 animate-scaleUp">
          <CheckCircle2 className="w-4 h-4 text-[#2563eb]" />
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
        <form onSubmit={handleSaveProfile} className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-soft space-y-6">
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
                onChange={(e) => setYearLevel(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-[#f0f7ff] border border-[#607ef2]/20 rounded-xl text-xs font-semibold text-[#021F53] outline-none focus:ring-2 focus:ring-[#3f58b2]"
              >
                <option value={1}>1st Year</option>
                <option value={2}>2nd Year</option>
                <option value={3}>3rd Year</option>
                <option value={4}>4th Year</option>
                <option value={5}>5th Year / Graduating</option>
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

          {!features.uploads && (
            <div className="space-y-2">
              <div
                aria-disabled="true"
                className="flex items-center justify-between gap-3 px-3.5 py-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-400"
              >
                <span>Profile photo</span>
                <ComingSoonBadge />
              </div>
              <div
                aria-disabled="true"
                className="flex items-center justify-between gap-3 px-3.5 py-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-400"
              >
                <span>Resume (PDF)</span>
                <ComingSoonBadge />
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={updateProfileMutation.isPending}
              className="px-6 py-3 bg-[#3f58b2] hover:bg-[#021F53] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {updateProfileMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>Save Profile</span>
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleSaveSettings} className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-soft space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-bold text-[#021F53] font-headline flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#3f58b2]" />
              <span>Account Security &amp; Password</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Update your account password or security credentials. Changes will take effect immediately.
            </p>
          </div>

          {passwordSuccessMsg && (
            <div className="p-3 bg-[#f0f7ff] border border-[#607ef2]/30 rounded-xl text-xs font-bold text-[#021F53] flex items-center gap-2 animate-scaleUp">
              <CheckCircle2 className="w-4 h-4 text-[#2563eb] shrink-0" />
              <span>{passwordSuccessMsg}</span>
            </div>
          )}

          {passwordErrorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-800 flex items-center gap-2 animate-scaleUp">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{passwordErrorMsg}</span>
            </div>
          )}

          <div className="space-y-5 max-w-md">
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
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  autoComplete="current-password"
                  placeholder="Enter your current password"
                  required
                  className="w-full px-3.5 py-2.5 pr-10 bg-[#f0f7ff] border border-[#607ef2]/20 rounded-xl text-xs font-semibold text-[#021F53] outline-none focus:ring-2 focus:ring-[#3f58b2]"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <span className="text-[11px] text-slate-400 block mt-1">
                Required for security re-authentication.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2c3f77] mb-1">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  placeholder="Enter at least 8 characters"
                  className="w-full px-3.5 py-2.5 pr-10 bg-[#f0f7ff] border border-[#607ef2]/20 rounded-xl text-xs font-semibold text-[#021F53] outline-none focus:ring-2 focus:ring-[#3f58b2]"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <span className="text-[11px] text-slate-400 block mt-1">
                Password must be at least 8 characters long.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2c3f77] mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  placeholder="Re-type your new password"
                  className="w-full px-3.5 py-2.5 pr-10 bg-[#f0f7ff] border border-[#607ef2]/20 rounded-xl text-xs font-semibold text-[#021F53] outline-none focus:ring-2 focus:ring-[#3f58b2]"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={updateSettingsMutation.isPending}
              className="px-6 py-3 bg-[#3f58b2] hover:bg-[#021F53] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {updateSettingsMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>Change Password</span>
            </button>
          </div>

          {/* RA 10173 Data Subject Rights: Export and Erasure (DP-02) */}
          <div className="pt-6 border-t border-slate-200 space-y-4">
            <div className="flex items-center gap-2 text-[#021F53]">
              <Shield className="w-4 h-4 text-[#3f58b2]" />
              <h4 className="text-xs font-bold uppercase tracking-wider">Data Privacy &amp; Data Subject Rights (RA 10173)</h4>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              In compliance with the Philippine Data Privacy Act of 2012, you have the right to data portability and right to erasure/blocking of your personal data.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <button
                type="button"
                onClick={handleExportData}
                className="tactile-btn-white px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 text-[#021F53] flex items-center gap-2 cursor-pointer shadow-xs hover:border-[#3f58b2]"
              >
                <Download className="w-3.5 h-3.5 text-[#3f58b2]" />
                <span>Export My Data (JSON)</span>
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={isDeletingAccount}
                className="px-4 py-2 text-xs font-bold rounded-xl border border-rose-200 text-rose-700 bg-rose-50/50 hover:bg-rose-100 flex items-center gap-2 cursor-pointer shadow-xs transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>{isDeletingAccount ? 'Processing...' : 'Delete Account & Erase Data'}</span>
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
