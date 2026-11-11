import { SiteLink } from '../../components/layout/shell';
import { AlertCircle, Bookmark } from 'lucide-react';
import React from 'react';
import { PageHead } from '../../components/student/forms';
import { Empty, PostingRow, SaveButton, Skeleton, toast, daysUntil } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { useSavedInternships, useUnsaveInternship } from '../../services/queries';
import type { InternshipCard } from '../../types/api';

interface SavedInternshipsPageProps {
  navigate: (path: string) => void;
}

const byDeadline = (a: InternshipCard, b: InternshipCard) =>
  (a.deadline ?? '9999-12-31').localeCompare(b.deadline ?? '9999-12-31');

export const SavedInternshipsPage: React.FC<SavedInternshipsPageProps> = () => {
  const { role } = useAuth();
  const { data = [], isLoading, error, refetch } = useSavedInternships({ enabled: role === 'student' });
  const unsave = useUnsaveInternship();

  const list = [...data].sort(byDeadline);
  const soon = list.filter((i) => i.deadline && daysUntil(i.deadline) <= 7);
  const later = list.filter((i) => !(i.deadline && daysUntil(i.deadline) <= 7));

  const remove = (i: InternshipCard) =>
    unsave.mutate(i.id, {
      onSuccess: () => toast.success('Removed from saved'),
      onError: () => toast.error('We couldn’t remove that role. Try again.'),
    });

  const group = (title: string, id: string, items: InternshipCard[]) =>
    items.length ? (
      <section aria-labelledby={id}>
        <h2 className="t-h3 mb-3.5" id={id}>
          {title}
        </h2>
        <div className="grid gap-2.5">
          {items.map((i) => (
            <PostingRow
              key={i.id}
              internship={i}
              headingLevel={3}
              save={<SaveButton saved onToggle={() => remove(i)} label={i.title} />}
            />
          ))}
        </div>
      </section>
    ) : null;

  return (
    <div className="wrap py-6 min-[721px]:py-10">
      <PageHead title="Saved roles" sub="Sorted by closing date." />

      {isLoading ? (
        <div className="grid gap-2.5" aria-busy="true">
          <Skeleton variant="row" count={3} />
        </div>
      ) : error ? (
        <div className="grid justify-items-start gap-3.5">
          <div className="note is-bad" role="alert">
            <AlertCircle aria-hidden="true" />
            <span>We couldn’t load your saved roles. Check your connection and try again.</span>
          </div>
          <button type="button" className="btn btn-secondary" onClick={() => refetch()}>
            Try again
          </button>
        </div>
      ) : list.length === 0 ? (
        <Empty
          icon={Bookmark}
          title="Nothing saved yet"
          body="Tap the bookmark on any role to keep it here, with its deadline."
          action={
            <SiteLink to="/internships" className="btn btn-brand">
              Browse internships
            </SiteLink>
          }
        />
      ) : (
        <div className="grid gap-9">
          {group('Closing this week', 'sv-wk', soon)}
          {group(soon.length ? 'Later' : 'Saved', 'sv-lt', later)}
        </div>
      )}
    </div>
  );
};
