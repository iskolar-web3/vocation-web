import React, { useState } from 'react';
import { Bookmark, ArrowLeft, Briefcase, Trash2 } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { InternshipCard } from '../../components/internships/InternshipCard';
import { LeavingSiteModal } from '../../components/common/LeavingSiteModal';
import { Internship } from '../../types';

interface SavedInternshipsPageProps {
  navigate: (path: string) => void;
}

export const SavedInternshipsPage: React.FC<SavedInternshipsPageProps> = ({ navigate }) => {
  const { internships, savedInternshipIds } = useData();
  const [selectedInternship, setSelectedInternship] = useState<Internship | null>(null);

  const savedRoles = internships.filter((i) => savedInternshipIds.includes(i.id));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <button
        onClick={() => navigate('/app')}
        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#3f58b2] hover:text-[#021F53] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Student Dashboard</span>
      </button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#021F53] font-display">
            Saved Internships (S-022)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Your bookmarked opportunities and upcoming application deadlines.
          </p>
        </div>
        <span className="text-xs bg-[#f0f7ff] text-[#3f58b2] font-bold px-3 py-1.5 rounded-full border border-[#607ef2]/20">
          {savedRoles.length} Saved
        </span>
      </div>

      {savedRoles.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-[#3f58b2]/10 shadow-soft space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#f0f7ff] text-[#ff9b00] flex items-center justify-center mx-auto">
            <Bookmark className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-[#021F53]">No Saved Internships Yet</h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
            Click the bookmark icon on any internship posting in the directory to save it to this list.
          </p>
          <button
            onClick={() => navigate('/internships')}
            className="px-6 py-2.5 bg-[#3f58b2] text-white font-bold text-xs rounded-full hover:bg-[#021F53]"
          >
            Explore Directory
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedRoles.map((item) => (
            <InternshipCard
              key={item.id}
              internship={item}
              onSelect={() => navigate(`/internships/${item.slug}`)}
              onApply={(int) => setSelectedInternship(int)}
            />
          ))}
        </div>
      )}

      <LeavingSiteModal
        isOpen={!!selectedInternship}
        onClose={() => setSelectedInternship(null)}
        internship={selectedInternship}
      />
    </div>
  );
};
