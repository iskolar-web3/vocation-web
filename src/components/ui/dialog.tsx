import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import type { CSSProperties, ReactNode } from 'react';
import { cn } from '../../lib/utils';

/* M3: centered glass dialog. Scrim fades 200ms; panel scale(.96)+opacity 200ms; exit 150ms.
   The motion is CSS keyframes on [data-state] (see index.css), so Radix can wait for exit. */

const WIDTH = { sm: 420, md: 520, lg: 640, xl: 760 } as const;

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  /** Keep the title for screen readers only (when the body carries its own heading). */
  hideTitle?: boolean;
  description?: ReactNode;
  children?: ReactNode;
  /** Right-aligned button row. Buttons stack full-width below 720px. */
  actions?: ReactNode;
  size?: keyof typeof WIDTH;
  /** Show a corner close button (Esc and scrim always close). */
  showClose?: boolean;
  className?: string;
}

export function Dialog({
  open,
  onOpenChange,
  title,
  hideTitle,
  description,
  children,
  actions,
  size = 'md',
  showClose,
  className,
}: DialogProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="dialog-scrim" />
        <DialogPrimitive.Content
          className={cn('dialog glass', className)}
          style={{ '--dialog-w': `${WIDTH[size]}px` } as CSSProperties}
          {...(description ? {} : { 'aria-describedby': undefined })}
        >
          <DialogPrimitive.Title className={hideTitle ? 'sr-only' : 'dialog-title'}>
            {title}
          </DialogPrimitive.Title>
          {description ? (
            <DialogPrimitive.Description className="dialog-desc">{description}</DialogPrimitive.Description>
          ) : null}
          {children ? <div className="dialog-body">{children}</div> : null}
          {actions ? <div className="actions">{actions}</div> : null}
          {showClose ? (
            <DialogPrimitive.Close className="icon-btn dialog-close" aria-label="Close">
              <X aria-hidden="true" />
            </DialogPrimitive.Close>
          ) : null}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

/** Close a Dialog/Sheet from inside it (e.g. a "Cancel" button). */
export const DialogClose = DialogPrimitive.Close;
