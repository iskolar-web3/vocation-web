import React, { useEffect, useState } from 'react';
import { Type, Sparkles } from 'lucide-react';

export type FontDirection = 'iskolar' | 'fintech' | 'editorial';

interface FontOption {
  id: FontDirection;
  label: string;
  tag: string;
  description: string;
  displayFont: string;
}

export const FONT_OPTIONS: FontOption[] = [
  {
    id: 'iskolar',
    label: 'iSkolar Heritage',
    tag: 'Brand Kit Direct',
    description: 'Bree Serif + Amaranth + Montserrat (Official Brand Kit Aligned)',
    displayFont: 'Bree Serif',
  },
  {
    id: 'fintech',
    label: 'Neo-Fintech Pro',
    tag: 'Modern Tech',
    description: 'Plus Jakarta Sans + Inter (Stripe & Linear clean tech aesthetic)',
    displayFont: 'Plus Jakarta Sans',
  },
  {
    id: 'editorial',
    label: 'Executive Editorial',
    tag: 'Prestige Academic',
    description: 'Outfit + DM Sans (Refined modern practicum directory)',
    displayFont: 'Outfit',
  },
];

export const FontDirectionSwitcher: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const [current, setCurrent] = useState<FontDirection>('iskolar');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const saved = (localStorage.getItem('vocation_font_direction') as FontDirection) || 'iskolar';
    setCurrent(saved);
    document.documentElement.setAttribute('data-font-direction', saved);
  }, []);

  const handleSelect = (id: FontDirection) => {
    setCurrent(id);
    localStorage.setItem('vocation_font_direction', id);
    document.documentElement.setAttribute('data-font-direction', id);
    setIsOpen(false);
  };

  const activeOption = FONT_OPTIONS.find((o) => o.id === current) || FONT_OPTIONS[0];

  if (compact) {
    return (
      <div className="relative inline-block text-left">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all cursor-pointer"
          title="Switch Typography Direction"
        >
          <Type className="w-3 h-3 text-[#607ef2]" />
          <span>Font: {activeOption.label.split(' ')[0]}</span>
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-1 w-64 bg-white rounded-xl shadow-stripe-float border border-slate-200 p-2 z-50 text-slate-800 space-y-1">
            <div className="px-2 py-1 border-b border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-accent">
                Typographic Direction
              </span>
              <span className="text-[9px] font-bold text-[#2563eb] bg-[#f0f7ff] px-1.5 py-0.5 rounded">
                3 Styles
              </span>
            </div>
            {FONT_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleSelect(opt.id)}
                className={`w-full text-left p-2 rounded-lg transition-all cursor-pointer flex flex-col gap-0.5 ${
                  current === opt.id
                    ? 'bg-[#f0f7ff] text-[#021F53] border border-[#607ef2]/30 font-bold'
                    : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold leading-tight">{opt.label}</span>
                  <span className="text-[9px] font-semibold text-slate-500">{opt.tag}</span>
                </div>
                <span className="text-[10px] text-slate-500 font-normal leading-snug">
                  {opt.description}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="inline-flex items-center p-1 bg-white/90 backdrop-blur-md rounded-xl border border-slate-200/90 shadow-2xs gap-1">
      <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 font-accent">
        <Type className="w-3 h-3 text-[#3f58b2]" />
        <span className="hidden sm:inline">Typography:</span>
      </span>
      {FONT_OPTIONS.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => handleSelect(opt.id)}
          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            current === opt.id
              ? 'bg-[#021F53] text-white shadow-2xs font-bold'
              : 'text-slate-600 hover:text-[#021F53] hover:bg-slate-100'
          }`}
        >
          <span>{opt.label}</span>
        </button>
      ))}
    </div>
  );
};
