import React, { useState } from 'react';
import {
  User,
  Settings,
  GraduationCap,
  FileText,
  Save,
  CheckCircle2,
  Lock,
  Bell,
  ArrowLeft,
  Upload,
  Plus,
  Trash2,
} from 'lucide-react';
import { useData } from '../../context/DataContext';

interface StudentProfileSettingsPageProps {
  navigate: (path: string) => void;
}

export const StudentProfileSettingsPage: React.FC<StudentProfileSettingsPageProps> = ({
  navigate,
}) => {
  const { studentProfile, updateStudentProfile } = useData();

  const [activeTab, setActiveTab] = useState<'profile' | 'settings'>('profile');

  // Form states
  const [fullName, setFullName] = useState(studentProfile.fullName);
  const [email, setEmail] = useState(studentProfile.email);
  const [school, setSchool] = useState(studentProfile.school);
  const [course, setCourse] = useState(studentProfile.course);
  const [yearLevel, setYearLevel] = useState(studentProfile.yearLevel);
  const [targetOjtHours, setTargetOjtHours] = useState(studentProfile.targetOjtHours.toString());
  const [completedOjtHours, setCompletedOjtHours] = useState(studentProfile.completedOjtHours.toString());
  const [bio, setBio] = useState(studentProfile.bio);
  const [resumeUrl, setResumeUrl] = useState(studentProfile.resumeUrl || '');
  const [skills, setSkills] = useState<string[]>(studentProfile.skills);
  const [newSkill, setNewSkill] = useState('');

  const [isSavedToast, setIsSavedToast] = useState(false);

  // Settings states
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [bookingReminders, setBookingReminders] = useState(true);
  const [passwordSent, setPasswordSent] = useState(false);

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateStudentProfile({
      fullName,
      email,
      school,
      course,
      yearLevel,
      targetOjtHours: parseInt(targetOjtHours, 10) || 300,
      completedOjtHours: parseInt(completedOjtHours, 10) || 0,
      bio,
      resumeUrl: resumeUrl.trim() || undefined,
      skills,
    });
    setIsSavedToast(true);
    setTimeout(() => setIsSavedToast(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <button
        onClick={() => navigate('/app')}
        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#3f58b2] hover:text-[#021F53] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Student Dashboard</span>
      </button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#021F53] font-display">
            Student Profile & Settings (S-024, S-025)
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
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'profile'
                ? 'bg-[#3f58b2] text-white shadow-xs'
                : 'text-[#2c3f77] hover:text-[#021F53]'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile Details</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'settings'
                ? 'bg-[#3f58b2] text-white shadow-xs'
                : 'text-[#2c3f77] hover:text-[#021F53]'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Settings & Security</span>
          </button>
        </div>
      </div>

      {isSavedToast && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-2xl flex items-center gap-2 font-bold animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>Profile changes saved successfully! Completeness meter updated.</span>
        </div>
      )}

      {activeTab === 'profile' ? (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          {/* Personal & School */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#3f58b2]/10 shadow-soft space-y-6">
            <h3 className="text-lg font-bold text-[#021F53] pb-3 border-b border-slate-100 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-[#3f58b2]" />
              <span>Academic Background</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2c3f77] mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm bg-[#f0f7ff] border border-[#607ef2]/20 rounded-2xl font-semibold text-[#021F53]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2c3f77] mb-1.5">
                  Student Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl font-medium text-slate-600"
                  disabled
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2c3f77] mb-1.5">
                  University / College
                </label>
                <input
                  type="text"
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  placeholder="e.g. University of the Philippines Diliman"
                  className="w-full px-4 py-2.5 text-sm bg-[#f0f7ff] border border-[#607ef2]/20 rounded-2xl font-semibold text-[#021F53]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2c3f77] mb-1.5">
                  Degree Program / Course
                </label>
                <input
                  type="text"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  placeholder="e.g. BS Computer Science"
                  className="w-full px-4 py-2.5 text-sm bg-[#f0f7ff] border border-[#607ef2]/20 rounded-2xl font-semibold text-[#021F53]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2c3f77] mb-1.5">
                  Year Level
                </label>
                <select
                  value={yearLevel}
                  onChange={(e) => setYearLevel(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm bg-[#f0f7ff] border border-[#607ef2]/20 rounded-2xl font-semibold text-[#021F53]"
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                  <option value="5th Year">5th Year</option>
                  <option value="Recent Graduate">Recent Graduate</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#2c3f77] mb-1.5">
                    Target OJT Hrs
                  </label>
                  <input
                    type="number"
                    value={targetOjtHours}
                    onChange={(e) => setTargetOjtHours(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm bg-[#f0f7ff] border border-[#607ef2]/20 rounded-2xl font-semibold text-[#021F53]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#2c3f77] mb-1.5">
                    Completed Hrs
                  </label>
                  <input
                    type="number"
                    value={completedOjtHours}
                    onChange={(e) => setCompletedOjtHours(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm bg-[#f0f7ff] border border-[#607ef2]/20 rounded-2xl font-semibold text-[#021F53]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Skills & Resume */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#3f58b2]/10 shadow-soft space-y-6">
            <h3 className="text-lg font-bold text-[#021F53] pb-3 border-b border-slate-100 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#3f58b2]" />
              <span>Skills & Resume Link</span>
            </h3>

            {/* Skills */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2c3f77]">
                Technical & Soft Skills ({skills.length})
              </label>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 bg-[#f0f7ff] text-[#3f58b2] text-xs font-bold rounded-full border border-[#607ef2]/20 flex items-center gap-1.5"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-slate-400 hover:text-rose-600"
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
                  placeholder="Add skill (e.g. Next.js, Figma)..."
                  className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="px-4 py-2 bg-[#3f58b2] text-white text-xs font-bold rounded-xl"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Resume Link */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2c3f77]">
                Public Resume / Portfolio URL
              </label>
              <input
                type="url"
                value={resumeUrl}
                onChange={(e) => setResumeUrl(e.target.value)}
                placeholder="https://drive.google.com/file/d/... or portfolio link"
                className="w-full px-4 py-2.5 text-sm bg-[#f0f7ff] border border-[#607ef2]/20 rounded-2xl font-semibold text-[#021F53]"
              />
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2c3f77]">
                Short Bio / Career Goal
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full p-4 text-xs sm:text-sm bg-[#f0f7ff] border border-[#607ef2]/20 rounded-2xl text-[#021F53]"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-8 py-3.5 bg-[#3f58b2] hover:bg-[#021F53] text-white font-bold text-sm rounded-full shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Profile Updates</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          {/* Notifications */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#3f58b2]/10 shadow-soft space-y-4">
            <h3 className="text-lg font-bold text-[#021F53] pb-3 border-b border-slate-100 flex items-center gap-2">
              <Bell className="w-5 h-5 text-[#3f58b2]" />
              <span>Notification Preferences</span>
            </h3>

            <div className="space-y-4">
              <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 cursor-pointer">
                <div>
                  <div className="text-sm font-bold text-[#021F53]">New Matching Internship Alerts</div>
                  <div className="text-xs text-slate-500">Receive weekly emails when new roles match your major</div>
                </div>
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="w-5 h-5 text-[#3f58b2] rounded-md"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 cursor-pointer">
                <div>
                  <div className="text-sm font-bold text-[#021F53]">Session Reminders & Calendar Invites</div>
                  <div className="text-xs text-slate-500">Get Google Calendar invites and 1-hour reminders before coaching calls</div>
                </div>
                <input
                  type="checkbox"
                  checked={bookingReminders}
                  onChange={(e) => setBookingReminders(e.target.checked)}
                  className="w-5 h-5 text-[#3f58b2] rounded-md"
                />
              </label>
            </div>
          </div>

          {/* Password Security */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#3f58b2]/10 shadow-soft space-y-4">
            <h3 className="text-lg font-bold text-[#021F53] pb-3 border-b border-slate-100 flex items-center gap-2">
              <Lock className="w-5 h-5 text-[#3f58b2]" />
              <span>Account Security & Password</span>
            </h3>

            <p className="text-xs text-slate-500">
              Request a secure password reset link sent to <strong>{studentProfile.email}</strong>.
            </p>

            {passwordSent ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-bold">
                ✓ Password reset email sent! Please check your inbox.
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setPasswordSent(true)}
                className="px-5 py-2.5 bg-[#f0f7ff] text-[#3f58b2] font-bold text-xs rounded-full border border-[#3f58b2]/20 hover:bg-[#e0efff]"
              >
                Send Password Reset Email (API-024)
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
