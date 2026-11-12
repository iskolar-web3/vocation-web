import { type FormEvent, useId, useState } from 'react';
import { formatPesos } from '../../lib/utils';
import { Segmented } from './Segmented';

/* Pure arithmetic estimator (no holidays). Allowed to "compute" because it is the student's
   own what-if, not a platform fee or payout. Port of the prototype's UI.ojtCalc. */

const PRESETS = [240, 300, 486, 600];
const WEEKS_PER_MONTH = 4.345;

export interface OjtCalculatorProps {
  defaultHours?: number;
  defaultAllowance?: number;
  /** Single column (use inside a Dialog). Default lays out inputs | result from 860px. */
  stacked?: boolean;
  /** Adds a "Show roles with N h" button under the result. */
  onFindMatchingRoles?: (hours: number) => void;
  className?: string;
}

export function OjtCalculator({
  defaultHours = 486,
  defaultAllowance = 15000,
  stacked,
  onFindMatchingRoles,
  className,
}: OjtCalculatorProps) {
  const uid = useId();
  const [hoursText, setHoursText] = useState(String(defaultHours));
  const [hpd, setHpd] = useState(8);
  const [dpw, setDpw] = useState(5);
  const [allowText, setAllowText] = useState(String(defaultAllowance));

  const hours = Math.max(0, Number(hoursText) || 0);
  const allow = Math.max(0, Number(allowText) || 0);
  const weeks = Math.ceil(hours / (hpd * dpw));
  const months = weeks / WEEKS_PER_MONTH;
  const days = Math.ceil(hours / hpd);

  return (
    <form
      className={`ojtc${stacked ? ' is-stacked' : ''}${className ? ` ${className}` : ''}`}
      onSubmit={(e: FormEvent) => e.preventDefault()}
      aria-label="OJT hours calculator"
    >
      <div className="ojtc-in">
        <div className="field">
          <span className="label" id={`${uid}-h`}>
            Required OJT hours
          </span>
          <div className="ojtc-presets" role="group" aria-labelledby={`${uid}-h`}>
            {PRESETS.map((n) => (
              <button
                key={n}
                type="button"
                className="chip"
                aria-pressed={n === hours}
                onClick={() => setHoursText(String(n))}
              >
                <span className="num">{n}</span>
              </button>
            ))}
            <input
              className="input num"
              type="number"
              inputMode="numeric"
              enterKeyHint="done"
              min={1}
              max={2000}
              value={hoursText}
              onChange={(e) => setHoursText(e.target.value)}
              aria-label="Custom hours"
              style={{ width: 96, height: 36 }}
            />
          </div>
          <span className="hint">Your school sets this. Ask your OJT coordinator if you’re unsure.</span>
        </div>
        <div className="field">
          <span className="label">Hours a day</span>
          <Segmented
            label="Hours a day"
            value={hpd}
            onValueChange={setHpd}
            options={[8, 6, 4].map((n) => ({ value: n, label: `${n} h` }))}
          />
        </div>
        <div className="field">
          <span className="label">Days a week</span>
          <Segmented
            label="Days a week"
            value={dpw}
            onValueChange={setDpw}
            options={[5, 6].map((n) => ({ value: n, label: `${n} days` }))}
          />
        </div>
        <div className="field">
          <label htmlFor={`${uid}-a`}>
            Monthly allowance <span className="muted" style={{ fontWeight: 500 }}>(optional)</span>
          </label>
          <div style={{ position: 'relative' }}>
            <span
              className="num muted"
              aria-hidden="true"
              style={{ position: 'absolute', left: 14, top: '50%', translate: '0 -50%' }}
            >
              ₱
            </span>
            <input
              id={`${uid}-a`}
              className="input num"
              type="number"
              inputMode="numeric"
              enterKeyHint="done"
              min={0}
              step={500}
              value={allowText}
              onChange={(e) => setAllowText(e.target.value)}
              style={{ paddingLeft: 32 }}
            />
          </div>
        </div>
      </div>

      <output className="ojtc-out" aria-live="polite">
        <div>
          <span className="ojtc-big num">{weeks}</span>
          <span className="ojtc-unit">weeks</span>
          <p className="t-meta">
            {days} working days, about {months.toFixed(1)} months
          </p>
        </div>
        <div>
          <span className="ojtc-big num">{allow ? formatPesos(Math.round((allow * months) / 100) * 100) : '—'}</span>
          <span className="ojtc-unit">{allow ? 'total allowance' : 'unpaid or not stated'}</span>
          <p className="t-meta">
            {allow ? `at ${formatPesos(allow)} a month` : 'Many OJT roles pay. Filter for paid ones.'}
          </p>
        </div>
        {onFindMatchingRoles && hours > 0 ? (
          <button type="button" className="btn btn-primary" onClick={() => onFindMatchingRoles(hours)}>
            Show roles with {hours} h
          </button>
        ) : null}
      </output>
    </form>
  );
}
