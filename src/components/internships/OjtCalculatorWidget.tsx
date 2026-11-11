import type React from 'react';
import { OjtCalculator } from '../ui/OjtCalculator';

/* Shim: old widget API on top of ui/OjtCalculator. New code: use <OjtCalculator>. */
interface OjtCalculatorWidgetProps {
  onFindMatchingRoles?: (hours: number) => void;
  isModal?: boolean;
}

export const OjtCalculatorWidget: React.FC<OjtCalculatorWidgetProps> = ({ onFindMatchingRoles, isModal = false }) => (
  <OjtCalculator stacked={isModal} onFindMatchingRoles={onFindMatchingRoles} />
);
