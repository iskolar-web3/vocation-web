import type React from 'react';
import { useRecordApplyClick, useInternship } from '../../services/queries';
import type { InternshipCard, InternshipDetail } from '../../types/api';
import { LeavingSiteNotice } from '../ui/LeavingSiteNotice';

/* Shim: old LeavingSiteModal API on top of ui/LeavingSiteNotice. It keeps the data work
   (fetch the apply URL if the card lacks it, record the apply click). */
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
  const recordApplyClick = useRecordApplyClick();
  const needsDetail = Boolean(internship && !(internship as InternshipDetail).external_apply_url);
  const { data: detail, isLoading } = useInternship(needsDetail && internship ? internship.slug : '');

  if (!internship) return null;
  const url = (internship as InternshipDetail).external_apply_url || detail?.external_apply_url || '';

  const onContinue = () => {
    if (!url) {
      if (onNavigateDetail) onNavigateDetail(internship.slug);
      else window.location.href = `/internships/${internship.slug}`;
      return;
    }
    recordApplyClick.mutate({ internshipId: internship.id, referrerSurface });
  };

  return (
    <LeavingSiteNotice
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      postingTitle={internship.title}
      companyName={internship.company.name}
      url={url}
      loading={isLoading}
      onContinue={onContinue}
    />
  );
};
