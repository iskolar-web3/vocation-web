import React from 'react';
import { Compass, ArrowLeft } from 'lucide-react';

interface NotFoundPageProps {
  navigate: (path: string) => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ navigate }) => {
  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center space-y-5">
      <div className="w-16 h-16 rounded-full bg-[#f0f7ff] text-[#3f58b2] flex items-center justify-center mx-auto">
        <Compass className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-bold text-[#021F53] font-display">404 — Page Not Found</h1>
      <p className="text-xs sm:text-sm text-[#2c3f77] leading-relaxed">
        The page you are looking for does not exist, or the listing has been withdrawn.
      </p>
      <button
        onClick={() => navigate('/')}
        className="px-6 py-3 bg-[#3f58b2] text-white font-bold text-xs rounded-xl shadow-xs hover:bg-[#021F53] transition-all inline-flex items-center gap-1.5 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Homepage</span>
      </button>
    </div>
  );
};
