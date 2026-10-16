import React from 'react';
import { Hammer, RefreshCw, Mail, ArrowLeft } from 'lucide-react';

interface MaintenanceScreenProps {
  onRetry?: () => void;
  navigate?: (path: string) => void;
}

export const MaintenanceScreen: React.FC<MaintenanceScreenProps> = ({ onRetry, navigate }) => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-[#f0f7ff]">
      <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-slate-200 shadow-soft text-center space-y-6">
        <div className="w-16 h-16 bg-[#f0f7ff] border border-[#607ef2]/20 rounded-2xl flex items-center justify-center mx-auto text-[#3f58b2] shadow-2xs">
          <Hammer className="w-8 h-8 text-[#ff9b00]" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#3f58b2]">
            Screen S-094 · Planned Downtime
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#021F53] font-display">
            Under Maintenance
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            iSkolar Vocation is undergoing planned scheduled maintenance or upgrades. All databases and bookings remain intact. Please check back shortly.
          </p>
        </div>

        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#2c3f77] flex items-center justify-center gap-2">
          <Mail className="w-4 h-4 text-[#3f58b2] shrink-0" />
          <span>
            Need urgent assistance?{' '}
            <a href="mailto:support@iskolar.io" className="font-bold underline text-[#021F53]">
              support@iskolar.io
            </a>
          </span>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="flex-1 py-3 bg-[#021F53] hover:bg-[#002774] text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry Connection</span>
            </button>
          )}

          {navigate && (
            <button
              type="button"
              onClick={() => navigate('/')}
              className="py-3 px-5 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back Home</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
