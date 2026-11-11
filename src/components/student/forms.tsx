import { Check, Eye, EyeOff, Info, Plus, X } from 'lucide-react';
import { type InputHTMLAttributes, type ReactNode, useRef, useState } from 'react';
import type { ZodType } from 'zod';
import { cn } from '../../lib/utils';

/* Shared form atoms for auth + student pages. Labels are direct children of .field (index.css). */

export type Errors = Record<string, string | undefined>;

/** Run a zod schema, return the first message per field. Empty object means valid. */
export function check<T>(schema: ZodType<T>, values: unknown): Errors {
  const res = schema.safeParse(values);
  if (res.success) return {};
  const out: Errors = {};
  for (const issue of res.error.issues) {
    const key = String(issue.path[0] ?? '_');
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

/** After a failed submit: focus the first invalid control once React has painted the errors. */
export function focusFirstInvalid(root: HTMLElement | null) {
  requestAnimationFrame(() => {
    root?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  });
}

const describe = (id: string, hint?: ReactNode, error?: string | null) =>
  [hint ? `${id}-h` : '', error ? `${id}-e` : ''].filter(Boolean).join(' ') || undefined;

export function Field({
  id,
  label,
  hint,
  error,
  children,
  className,
}: {
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: string | null;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('field', className)}>
      <label htmlFor={id}>{label}</label>
      {children}
      {hint ? (
        <span className="hint" id={`${id}-h`}>
          {hint}
        </span>
      ) : null}
      {error ? (
        <span className="error" id={`${id}-e`} role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
}

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> & {
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: string | null;
};

export function TextField({ id, label, hint, error, className, ...rest }: InputProps) {
  return (
    <Field id={id} label={label} hint={hint} error={error}>
      <input
        id={id}
        className={cn('input', className)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describe(id, hint, error)}
        {...rest}
      />
    </Field>
  );
}

export function PasswordField({ id, label, hint, error, className, ...rest }: InputProps) {
  const [show, setShow] = useState(false);
  return (
    <Field id={id} label={label} hint={hint} error={error}>
      <div className="relative">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          className={cn('input pr-14', className)}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          aria-invalid={error ? true : undefined}
          aria-describedby={describe(id, hint, error)}
          {...rest}
        />
        <button
          type="button"
          className="icon-btn absolute top-0.5 right-0.5 border-0"
          aria-label={show ? 'Hide password' : 'Show password'}
          aria-pressed={show}
          onClick={() => setShow((s) => !s)}
        >
          {show ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
        </button>
      </div>
    </Field>
  );
}

/** Live "At least 8 characters" hint: grey until met, then ok. */
export function PasswordRule({ met }: { met: boolean }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5', met ? 'text-ok' : 'text-tx-3')}>
      {met ? <Check className="size-[15px]" aria-hidden="true" /> : <Info className="size-[15px]" aria-hidden="true" />}
      At least 8 characters
    </span>
  );
}

/** Linear progress. Static: no fill animation on load (BUILD §4). */
export function Progress({ value, label, className }: { value: number; label: string; className?: string }) {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={v}
      aria-label={label}
      className={cn('h-2 overflow-hidden rounded-pill bg-field', className)}
    >
      <div className="h-full rounded-pill bg-lightblue" style={{ width: `${v}%` }} />
    </div>
  );
}

/** Tag input: Enter or comma adds, Backspace on empty removes the last, blur keeps pending text. */
export function SkillsInput({
  id,
  label,
  value,
  onChange,
  suggestions,
  hint,
  error,
  max = 20,
}: {
  id: string;
  label: ReactNode;
  value: string[];
  onChange: (next: string[]) => void;
  suggestions?: string[];
  hint?: ReactNode;
  error?: string | null;
  max?: number;
}) {
  const [text, setText] = useState('');
  const input = useRef<HTMLInputElement>(null);
  const has = (v: string) => value.findIndex((s) => s.toLowerCase() === v.toLowerCase());
  const add = (raw: string) => {
    const v = raw.trim().slice(0, 30);
    if (!v || value.length >= max || has(v) >= 0) return;
    onChange([...value, v]);
  };
  const commit = () => {
    add(text);
    setText('');
  };
  const toggle = (s: string) => {
    const i = has(s);
    onChange(i >= 0 ? value.filter((_, k) => k !== i) : [...value, s]);
  };

  return (
    <Field id={id} label={label} hint={hint} error={error}>
      <div
        className={cn(
          'flex min-h-12 flex-wrap items-center gap-2 rounded-[var(--r)] border bg-field px-2 py-1.5 focus-within:border-lightblue focus-within:outline-2 focus-within:outline-[rgba(96,139,255,.35)]',
          error ? 'border-danger' : 'border-line-strong'
        )}
        onClick={() => input.current?.focus()}
      >
        {value.length > 0 && (
          <ul className="contents" aria-label="Added skills">
            {value.map((s) => (
              <li key={s} className="tag !h-[34px] !pr-1 !pl-3 !text-[13.5px]">
                {s}
                <button
                  type="button"
                  className="relative grid size-[26px] place-items-center rounded-full text-tx-2 after:absolute after:-inset-2.5 hover:bg-[rgba(160,180,255,.14)] hover:text-tx"
                  aria-label={`Remove ${s}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(value.filter((x) => x !== s));
                    input.current?.focus();
                  }}
                >
                  <X className="size-3.5" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}
        <input
          ref={input}
          id={id}
          type="text"
          className="h-9 min-w-[140px] flex-1 border-0 bg-transparent px-1.5 outline-none"
          placeholder={value.length ? 'Add another' : 'Type a skill, press Enter'}
          value={text}
          autoComplete="off"
          autoCapitalize="words"
          enterKeyHint="done"
          aria-invalid={error ? true : undefined}
          aria-describedby={describe(id, hint, error)}
          onChange={(e) => setText(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && text.trim()) {
              e.preventDefault();
              commit();
            } else if (e.key === ',') {
              e.preventDefault();
              commit();
            } else if (e.key === 'Backspace' && !text && value.length) {
              onChange(value.slice(0, -1));
            }
          }}
        />
      </div>
      {suggestions?.length ? (
        <div className="mt-1 flex flex-wrap gap-2" role="group" aria-label="Suggested skills">
          {suggestions.map((s) => (
            <button key={s} type="button" className="chip" aria-pressed={has(s) >= 0} onClick={() => toggle(s)}>
              <Plus aria-hidden="true" />
              {s}
            </button>
          ))}
        </div>
      ) : null}
    </Field>
  );
}

/** Page header for the student app screens. */
export function PageHead({ title, sub, action }: { title: string; sub?: ReactNode; action?: ReactNode }) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="t-h1">{title}</h1>
        {sub ? <p className="t-body mt-1.5 muted">{sub}</p> : null}
      </div>
      {action}
    </header>
  );
}
