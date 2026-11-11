import { X } from 'lucide-react';
import { Segmented } from '../ui';

export interface Filters {
  field: string;
  setup: string;
  pay: string;
  ojt: number;
}

export const NO_FILTERS: Filters = { field: '', setup: 'all', pay: 'all', ojt: 0 };

const SETUPS = [
  ['remote', 'Remote'],
  ['hybrid', 'Hybrid'],
  ['onsite', 'On-site'],
] as const;
const PAY = [
  { value: 'all', label: 'Any' },
  { value: 'paid', label: 'Paid' },
  { value: 'unpaid', label: 'Unpaid' },
];
const OJT = [
  { value: 0, label: 'Any' },
  { value: 200, label: '200+' },
  { value: 300, label: '300+' },
  { value: 400, label: '400+' },
];

export const activeCount = (f: Filters) =>
  (f.field ? 1 : 0) + (f.setup !== 'all' ? 1 : 0) + (f.pay !== 'all' ? 1 : 0) + (f.ojt ? 1 : 0);

export function FilterBody({
  filters,
  fields,
  onChange,
  onReset,
  idBase,
  heading,
}: {
  filters: Filters;
  fields: string[];
  onChange: (patch: Partial<Filters>) => void;
  onReset: () => void;
  /** Distinct ids when the body is mounted twice (rail + sheet). */
  idBase: string;
  heading?: boolean;
}) {
  return (
    <>
      <div className="pg-fhead">
        {heading ? <h2 className="t-title">Filters</h2> : <span />}
        <button type="button" className="link-btn" onClick={onReset} disabled={!activeCount(filters)}>
          Reset
        </button>
      </div>

      {fields.length > 0 && (
        <fieldset className="pg-fg">
          <legend className="pg-lg">Field</legend>
          {[['', 'All fields'], ...fields.map((f) => [f, f])].map(([value, label]) => (
            <label className="check" key={value || 'all'}>
              <input
                type="radio"
                name={`${idBase}-field`}
                checked={filters.field === value}
                onChange={() => onChange({ field: value })}
              />
              <span className="pg-lbl">{label}</span>
            </label>
          ))}
        </fieldset>
      )}

      <div className="pg-fg" role="group" aria-label="Setup">
        <p className="pg-lg" aria-hidden="true">
          Setup
        </p>
        <div className="pg-chipset">
          {SETUPS.map(([value, label]) => (
            <button
              key={value}
              type="button"
              className="chip"
              aria-pressed={filters.setup === value}
              onClick={() => onChange({ setup: filters.setup === value ? 'all' : value })}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="pg-fg">
        <p className="pg-lg" aria-hidden="true">
          Pay
        </p>
        <Segmented label="Pay" value={filters.pay} onValueChange={(pay) => onChange({ pay })} options={PAY} />
      </div>

      <div className="pg-fg">
        <p className="pg-lg" aria-hidden="true">
          OJT hours
        </p>
        <Segmented label="Minimum OJT hours" value={filters.ojt} onValueChange={(ojt) => onChange({ ojt })} options={OJT} />
      </div>
    </>
  );
}

/** Removable chips for every active filter, plus Clear all. */
export function ActiveChips({
  filters,
  onChange,
  onClear,
}: {
  filters: Filters;
  onChange: (patch: Partial<Filters>) => void;
  onClear: () => void;
}) {
  const chips: Array<[string, string, Partial<Filters>]> = [];
  if (filters.field) chips.push(['field', filters.field, { field: '' }]);
  if (filters.setup !== 'all') chips.push(['setup', SETUPS.find(([v]) => v === filters.setup)?.[1] ?? filters.setup, { setup: 'all' }]);
  if (filters.pay !== 'all') chips.push(['pay', filters.pay === 'paid' ? 'Paid only' : 'Unpaid', { pay: 'all' }]);
  if (filters.ojt) chips.push(['ojt', `OJT ${filters.ojt}+ h`, { ojt: 0 }]);
  if (!chips.length) return null;
  return (
    <>
      {chips.map(([key, label, patch]) => (
        <button key={key} type="button" className="chip" aria-label={`Remove filter: ${label}`} onClick={() => onChange(patch)}>
          {label}
          <X aria-hidden="true" />
        </button>
      ))}
      <button type="button" className="link-btn" onClick={onClear}>
        Clear all
      </button>
    </>
  );
}
