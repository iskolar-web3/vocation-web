import { Plus } from 'lucide-react';
import { type ReactNode, useId, useState } from 'react';
import { cn } from '../../lib/utils';

/* M13: grid-template-rows 0fr -> 1fr (220ms) + content fade; plus icon rotates 45deg (200ms).
   Closed panels are inert so their links never take focus. */

export interface AccordionItem {
  id: string;
  title: ReactNode;
  content: ReactNode;
}

export interface AccordionProps {
  items: AccordionItem[];
  /** Allow several open at once (default: one at a time). */
  multiple?: boolean;
  defaultOpen?: string[];
  /** Heading level wrapping each trigger. Default 3. */
  headingLevel?: 2 | 3 | 4;
  className?: string;
}

export function Accordion({ items, multiple, defaultOpen = [], headingLevel = 3, className }: AccordionProps) {
  const uid = useId();
  const [open, setOpen] = useState<string[]>(defaultOpen);
  const H = `h${headingLevel}` as 'h2' | 'h3' | 'h4';

  const toggle = (id: string) =>
    setOpen((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : multiple ? [...cur, id] : [id]));

  return (
    <div className={cn('acc', className)}>
      {items.map((it) => {
        const isOpen = open.includes(it.id);
        const tid = `${uid}-t-${it.id}`;
        const pid = `${uid}-p-${it.id}`;
        return (
          <div className="acc-item" key={it.id}>
            <H style={{ margin: 0 }}>
              <button
                type="button"
                id={tid}
                className="acc-trigger"
                aria-expanded={isOpen}
                aria-controls={pid}
                onClick={() => toggle(it.id)}
              >
                <span>{it.title}</span>
                <Plus className="acc-icon" aria-hidden="true" />
              </button>
            </H>
            <div id={pid} role="region" aria-labelledby={tid} className="acc-panel" data-open={isOpen} inert={!isOpen}>
              <div className="acc-inner">
                <div className="acc-body">{it.content}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
