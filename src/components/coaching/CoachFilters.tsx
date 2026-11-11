import { Segmented } from '../ui';

export interface CoachFilterState {
  q: string;
  expertise: string;
  // GET /coaches ?price knows any/free/paid only; peso tiers are not supported server-side.
  price: 'all' | 'free' | 'paid';
}

export type CoachSort = 'rec' | 'rating' | 'reviews';

export const SORTS: { value: CoachSort; label: string }[] = [
  { value: 'rec', label: 'Recommended' },
  { value: 'rating', label: 'Highest rated' },
  { value: 'reviews', label: 'Most reviews' },
];

const PRICES = [
  { value: 'all', label: 'Any' },
  { value: 'free', label: 'Free intro' },
  { value: 'paid', label: 'Paid' },
] as const;

export function SpecialtyChips({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="cd-chips" role="group" aria-label="Specialty">
      {['', ...options].map((o) => (
        <button key={o || 'all'} type="button" className="chip" aria-pressed={value === o} onClick={() => onChange(o)}>
          {o || 'All'}
        </button>
      ))}
    </div>
  );
}

export function PriceSegmented({ value, onChange }: { value: CoachFilterState['price']; onChange: (v: CoachFilterState['price']) => void }) {
  return <Segmented label="Price" value={value} onValueChange={onChange} options={[...PRICES]} />;
}

export function SortSelect({ id, value, onChange }: { id: string; value: CoachSort; onChange: (v: CoachSort) => void }) {
  return (
    <div className="cd-sort">
      <label htmlFor={id}>Sort by</label>
      <select id={id} className="select" value={value} onChange={(e) => onChange(e.target.value as CoachSort)}>
        {SORTS.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
    </div>
  );
}
