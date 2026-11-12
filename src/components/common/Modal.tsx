import type React from 'react';
import { Dialog } from '../ui/dialog';

/* Shim: old Modal API on top of ui/Dialog. New code: use <Dialog> directly. */
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
}

const SIZE = { sm: 'sm', md: 'sm', lg: 'md', xl: 'lg', '2xl': 'lg', '3xl': 'xl' } as const;

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, maxWidth = 'lg' }) => (
  <Dialog
    open={isOpen}
    onOpenChange={(open) => !open && onClose()}
    title={title ?? 'Dialog'}
    hideTitle={!title}
    size={SIZE[maxWidth]}
    showClose
  >
    {children}
  </Dialog>
);
