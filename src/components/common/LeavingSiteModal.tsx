import React, { useState, useEffect } from 'react';
import { ExternalLink, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { Modal } from './Modal';
import { InternshipCard, InternshipDetail } from '../../types/api';
import { useRecordApplyClick, useInternship } from '../../services/queries';

interface LeavingSiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  internship: InternshipCard | InternshipDetail | null;
  referrerSurface?: 'directory' | 'detail' | 'share' | 'cross_sell';
  onNavigateDetail?: (slug: string) => void;
}

export const LeavingSiteModal: React.FC<LeavingSiteModalProps> = ({
  isOpen,
  onClose,
  internship,
  referrerSurface = 'detail',
  onNavigateDetail,
}) => {
  const recordApplyClickMutation = useRecordApplyClick();
  const [countdown, setCountdown] = useState(3);
  const [autoRedirect, setAutoRedirect] = useState(false);

  // If internship doesn't carry external_apply_url, fetch its detail
  const needsDetail = Boolean(internship && !(internship as InternshipDetail).external_apply_url);
  const { data: detailData, isLoading: isLoadingDetail } = useInternship(
    needsDetail && internship ? internship.slug : ''
  );

  const destinationUrl =
    (internship as InternshipDetail)?.external_apply_url ||
    detailData?.external_apply_url ||
    '';

  const logoUrl = internship?.company?.logo_url || '';

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen && autoRedirect && countdown > 0 && destinationUrl) {
      timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
    } else if (isOpen && autoRedirect && countdown === 0 && destinationUrl) {
      handleProceed();
    }
    return () => clearTimeout(timer);
  }, [isOpen, autoRedirect, countdown, destinationUrl]);

  if (!internship) return null;

  const handleProceed = () => {
    if (!destinationUrl) {
      if (onNavigateDetail) {
        onNavigateDetail(internship.slug);
      } else {
        window.location.href = `/internships/${internship.slug}`;
      }
      onClose();
      return;
    }

    if (!/^https?:\/\//i.test(destinationUrl)) {
      console.error('Invalid destination URL protocol');
      return;
    }

    recordApplyClickMutation.mutate({
      internshipId: internship.id,
      referrerSurface: referrerSurface,
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
          <ExternalLink className="w-5 h-5 text-[#3f58b2]" />
          <span>Leaving iSkolar Vocation</span>
        </div>
      }
      maxWidth="lg"
    >
      <div className="space-y-6">
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#f0f7ff] border border-[#607ef2]/20">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={internship.company.name}
              className="w-12 h-12 rounded-xl object-cover bg-white border border-slate-200"
            />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-xs font-bold text-[#021F53]">
              {internship.company.name.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div>
            <h4 className="font-bold text-sm text-[#021F53]">{internship.title}</h4>
            <p className="text-xs text-slate-600">Company: {internship.company.name}</p>
          </div>
        </div>

        <div className="space-y-3 text-xs text-[#2c3f77] leading-relaxed">
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#f0f7ff] border border-[#607ef2]/20 text-[#021F53]">
            <AlertCircle className="w-4 h-4 text-[#2563eb] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Important Notice (Direct Employer Redirection):</span>
              iSkolar Vocation does not store or process job applications for this role. You are being redirected to the employer's official recruitment portal to submit your application directly.
            </div>
          </div>

          <p>
            Please make sure you have your updated resume and scholastic documents prepared before proceeding.
          </p>
        </div>

        <div className="pt-2 flex items-center justify-between border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleProceed}
            disabled={isLoadingDetail && !destinationUrl}
            className="tactile-btn-primary px-6 py-2.5 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoadingDetail && !destinationUrl ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Loading Link...</span>
              </>
            ) : (
              <>
                <span>Continue to {internship.company.name}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};
