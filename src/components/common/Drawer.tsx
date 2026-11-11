import type React from 'react';
import { Sheet } from '../ui/Sheet';

/* Shim: old Drawer API on top of ui/Sheet. New code: use <Sheet> directly. */
interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Drawer: React.FC<DrawerProps> = ({ isOpen, onClose, title, children }) => (
  <Sheet
    open={isOpen}
    onOpenChange={(open) => !open && onClose()}
    title={title}
    className="md:hidden"
    overlayClassName="md:hidden"
  >
    {children}
  </Sheet>
);
