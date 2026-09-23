import React, { useState, useEffect } from 'react';
import { ExternalLink, AlertCircle, ArrowRight } from 'lucide-react';
import { Modal } from './Modal';
import { InternshipCard, InternshipDetail } from '../../types/api';
import { useRecordApplyClick } from '../../services/queries';

interface LeavingSiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  internship: InternshipCard | InternshipDetail | null;
}

export const LeavingSiteModal: React.FC<LeavingSiteModalProps> = ({
  isOpen,
  onClose,
  internship,
}) => {
  const recordApplyClickMutation = useRecordApplyClick();
  const [countdown, setCountdown] = useState(3);
  const [autoRedirect, setAutoRedirect] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen && autoRedirect && countdown > 0) {
      timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
    } else if (isOpen && autoRedirect && countdown === 0 && internship) {
      handleProceed();
    }
    return () => clearTimeout(timer);
  }, [isOpen, autoRedirect, countdown, internship]);

  if (!internship) return null;

  const destinationUrl =
    (internship as InternshipDetail).external_apply_url ||
    (internship as any).applyUrl ||
    'https://careers.google.com';

  const logoUrl = internship.company.logo_url || (internship.company as any).logo || '';

  const handleProceed = () => {
    recordApplyClickMutation.mutate({
      internshipId: internship.id,
      referrerSurface: 'detail',
    });
    window.open(destinationUrl, '_blank', 'noopener,noreferrer');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 text-[#021F53]">
          <ExternalLink className="w-5 h-5 text-[#607ef2]" />
          <span>Leaving iSkolar Vocation</span>
        </div>
      }
      maxWidth="lg"
    >
      <div className="space-y-6">
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#f0f7ff] border border-[#607ef2]/20">
          <img
            src={logoUrl}
            alt={internship.company.name}
            className="w-14 h-14 rounded-xl object-cover border border-white shadow-sm flex-shrink-0"
          />
          <div>
            <h4 className="text-base font-bold text-[#021F53] font-headline">
              {internship.title}
            </h4>
            <p className="text-sm text-[#2c3f77] flex items-center gap-1.5 mt-0.5">
              <span>{internship.company.name}</span>
            </p>
          </div>
        </div>

        {/* BR-001 & BR-002 Callout */}
        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 text-sm space-y-2">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-[#ff9b00] flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-950">
                You will be redirected to the employer's official careers portal.
              </p>
              <p className="text-xs text-amber-800/90 mt-1 leading-relaxed">
                <strong>iSkolar Vocation does not store or process student applications.</strong> All resumes, personal details, and screening submissions are handled directly on {internship.company.name}'s secure application page.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#2c3f77]">
            Destination Link
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 font-mono break-all select-all">
            {destinationUrl}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#3f58b2]/10">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-[#2c3f77] hover:bg-[#f0f7ff] rounded-full transition-colors order-2 sm:order-1 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleProceed}
            className="w-full sm:w-auto px-6 py-3 text-sm font-bold text-white bg-[#3f58b2] hover:bg-[#021F53] rounded-full shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 order-1 sm:order-2 cursor-pointer"
          >
            <span>Continue to Official Application</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Modal>
  );
};
