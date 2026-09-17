import React, { useState } from 'react';
import {
  Building,
  Save,
  CheckCircle2,
  Globe,
  MapPin,
  Users,
  ShieldCheck,
  ArrowLeft,
} from 'lucide-react';
import { useData } from '../../context/DataContext';

interface EmployerProfilePageProps {
  navigate: (path: string) => void;
}

export const EmployerProfilePage: React.FC<EmployerProfilePageProps> = ({ navigate }) => {
  const { employerProfile, updateEmployerProfile } = useData();

  const [companyName, setCompanyName] = useState(employerProfile.companyName);
  const [industry, setIndustry] = useState(employerProfile.industry);
  const [location, setLocation] = useState(employerProfile.location);
  const [size, setSize] = useState(employerProfile.size);
  const [website, setWebsite] = useState(employerProfile.website);
  const [description, setDescription] = useState(employerProfile.description);
  const [contactEmail, setContactEmail] = useState(employerProfile.contactEmail);
  const [isSavedToast, setIsSavedToast] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateEmployerProfile({
      companyName,
      industry,
      location,
      size,
      website,
      description,
      contactEmail,
    });
    setIsSavedToast(true);
    setTimeout(() => setIsSavedToast(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <button
        onClick={() => navigate('/employer/postings')}
        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#3f58b2] hover:text-[#021F53] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Employer Hub</span>
      </button>

      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#021F53] font-display">
          Organization Profile & Verification (S-032)
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          This information is displayed publicly in the Companies directory to students.
        </p>
      </div>

      {isSavedToast && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-2xl flex items-center gap-2 font-bold animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>Company profile updated successfully!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#3f58b2]/10 shadow-soft space-y-6">
          <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
            <img
              src={employerProfile.logo}
              alt={employerProfile.companyName}
              className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-sm"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-[#021F53]">{employerProfile.companyName}</h3>
                {employerProfile.isVerified && (
                  <span className="inline-flex items-center text-xs font-bold text-[#3f58b2] bg-[#f0f7ff] px-2 py-0.5 rounded-full border border-[#3f58b2]/20">
                    <ShieldCheck className="w-3.5 h-3.5 mr-0.5" /> Verified
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">Public Employer Profile</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2c3f77] mb-1.5">
                Company / Organization Name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-[#f0f7ff] border border-[#607ef2]/20 rounded-2xl font-semibold text-[#021F53]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2c3f77] mb-1.5">
                Primary Industry
              </label>
              <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-[#f0f7ff] border border-[#607ef2]/20 rounded-2xl font-semibold text-[#021F53]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2c3f77] mb-1.5">
                Headquarters Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-[#f0f7ff] border border-[#607ef2]/20 rounded-2xl font-semibold text-[#021F53]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2c3f77] mb-1.5">
                Company Size
              </label>
              <input
                type="text"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-[#f0f7ff] border border-[#607ef2]/20 rounded-2xl font-semibold text-[#021F53]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2c3f77] mb-1.5">
                Official Careers Website
              </label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-[#f0f7ff] border border-[#607ef2]/20 rounded-2xl font-semibold text-[#021F53]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2c3f77] mb-1.5">
                Talent / Recruiter Contact Email
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-[#f0f7ff] border border-[#607ef2]/20 rounded-2xl font-semibold text-[#021F53]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#2c3f77] mb-1.5">
              About the Company & Student Culture
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full p-4 text-xs sm:text-sm bg-[#f0f7ff] border border-[#607ef2]/20 rounded-2xl text-[#021F53]"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-8 py-3.5 bg-[#3f58b2] hover:bg-[#021F53] text-white font-bold text-sm rounded-full shadow-md hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Company Profile</span>
          </button>
        </div>
      </form>
    </div>
  );
};
