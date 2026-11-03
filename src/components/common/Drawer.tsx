import React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { DialogPortal, DialogOverlay } from '../ui/dialog';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogPortal>
        <DialogOverlay className="md:hidden" />
        <DialogPrimitive.Content className="fixed inset-x-0 bottom-0 z-50 md:hidden max-h-[85vh] overflow-y-auto bg-white rounded-t-2xl shadow-soft p-6 animate-slideUp border-t border-slate-200 focus:outline-none">
          <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mb-4" />
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
            <DialogPrimitive.Title className="text-lg font-bold text-[#021F53] font-headline">
              {title}
            </DialogPrimitive.Title>
            <DialogPrimitive.Close className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors">
              <X className="w-5 h-5" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          </div>
          {children}
        </DialogPrimitive.Content>
      </DialogPortal>
    </DialogPrimitive.Root>
  );
};
