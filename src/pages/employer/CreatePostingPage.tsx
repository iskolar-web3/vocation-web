import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { PostingComposer } from '../../components/employer/PostingComposer';
import { useData } from '../../context/DataContext';

interface CreatePostingPageProps {
  navigate: (path: string) => void;
  editId?: string | null;
}

export const CreatePostingPage: React.FC<CreatePostingPageProps> = ({ navigate, editId }) => {
  const { internships } = useData();
  const initialPosting = editId ? internships.find((i) => i.id === editId) : undefined;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <button
        onClick={() => navigate('/employer/postings')}
        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#3f58b2] hover:text-[#021F53] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Employer Hub</span>
      </button>

      <PostingComposer
        initialData={initialPosting}
        onSuccess={() => navigate('/employer/postings')}
        onCancel={() => navigate('/employer/postings')}
      />
    </div>
  );
};
