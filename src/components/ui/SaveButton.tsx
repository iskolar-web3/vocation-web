import { Bookmark } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '../../lib/utils';

/* M6: the icon pops (.85 -> 1, 200ms) and the fill cross-fades in (150ms) on SAVE only.
   Unsave is instant. Parent owns the state and the network call. */

export interface SaveButtonProps {
  saved: boolean;
  onToggle: () => void;
  /** What is being saved, for the accessible name: "Save <label>" / "Remove saved <label>". */
  label?: string;
  variant?: 'icon' | 'labelled';
  disabled?: boolean;
  className?: string;
}

export function SaveButton({ saved, onToggle, label, variant = 'icon', disabled, className }: SaveButtonProps) {
  const [pop, setPop] = useState(false);
  const prev = useRef(saved);
  useEffect(() => {
    if (!prev.current && saved) setPop(true);
    prev.current = saved;
  }, [saved]);

  const labelled = variant === 'labelled';
  return (
    <button
      type="button"
      className={cn(labelled ? 'btn btn-secondary save-lbl' : 'save', pop && 'is-popping', className)}
      aria-pressed={saved}
      aria-label={labelled ? undefined : `${saved ? 'Remove saved' : 'Save'}${label ? ` ${label}` : ''}`}
      disabled={disabled}
      onClick={onToggle}
      onAnimationEnd={() => setPop(false)}
    >
      <Bookmark aria-hidden="true" />
      {labelled ? <span>{saved ? 'Saved' : 'Save'}</span> : null}
    </button>
  );
}
