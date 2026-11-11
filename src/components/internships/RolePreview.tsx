import { Link } from '@tanstack/react-router';
import { ArrowRight } from 'lucide-react';
import { useInternship } from '../../services/queries';
import type { InternshipCard } from '../../types/api';
import { Mono, SaveButton, Skeleton } from '../ui';
import { ApplyNotice, CloseLine, RoleFacts } from './shared';
import { useState } from 'react';

/** Sticky preview of the selected row (>=1280). Reads the detail for the body and the apply URL. */
export function RolePreview({
  role,
  saved,
  canSave,
  onToggleSave,
}: {
  role: InternshipCard | null;
  saved: boolean;
  canSave: boolean;
  onToggleSave: () => void;
}) {
  const detail = useInternship(role?.slug ?? '');
  const [leaving, setLeaving] = useState(false);

  if (!role) return <p className="pg-prev-empty t-body">Pick a role to preview it here.</p>;
  const full = detail.data;
  const shown = full ?? role;

  return (
    <div className="pg-pbody">
      <div className="pg-pt">
        <Mono name={role.company.name} />
        <div>
          <h2 className="t-h3">{role.title}</h2>
          <p className="t-small">
            {role.company.name} · {role.location}
          </p>
        </div>
      </div>
      <RoleFacts role={shown} />
      <CloseLine date={role.deadline} />
      {full?.description ? (
        <p className="t-body">{full.description}</p>
      ) : detail.isLoading ? (
        <div className="pg-ph" aria-hidden="true">
          <Skeleton variant="line" count={3} />
        </div>
      ) : null}
      <div className="pg-pcta">
        <button type="button" className="btn btn-primary btn-block" onClick={() => setLeaving(true)}>
          Apply on company site
        </button>
        {canSave ? <SaveButton variant="labelled" saved={saved} onToggle={onToggleSave} className="btn-block" /> : null}
        <Link to="/internships/$slug" params={{ slug: role.slug }} className="pg-link">
          Open full page
          <ArrowRight aria-hidden="true" />
        </Link>
      </div>
      <ApplyNotice role={full} loading={detail.isLoading} open={leaving} onOpenChange={setLeaving} surface="directory" />
    </div>
  );
}
