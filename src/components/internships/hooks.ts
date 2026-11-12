import { useNavigate } from '@tanstack/react-router';
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSaveInternship, useSavedInternships, useUnsaveInternship } from '../../services/queries';
import { toast } from '../ui';

/** matchMedia as state. False on the server and until the first client read. */
export function useMedia(query: string): boolean {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia(query);
      mq.addEventListener('change', cb);
      return () => mq.removeEventListener('change', cb);
    },
    () => window.matchMedia(query).matches,
    () => false
  );
}

/**
 * Save/unsave for a role, with an optimistic flag so the bookmark flips at once (M6).
 * Students save. Visitors get a sign-in prompt. Coaches and admins get no save button.
 */
export function useRoleSave() {
  const { isAuthenticated, role } = useAuth();
  const navigate = useNavigate();
  const isStudent = isAuthenticated && role === 'student';
  const { data: saved } = useSavedInternships({ enabled: isStudent });
  const save = useSaveInternship();
  const unsave = useUnsaveInternship();
  const ids = useMemo(() => new Set((saved ?? []).map((s) => s.id)), [saved]);
  const [optimistic, setOptimistic] = useState<Record<string, boolean>>({});

  // Server truth arrived: drop the optimistic overrides.
  useEffect(() => setOptimistic({}), [saved]);

  const isSaved = (id: string) => (id in optimistic ? optimistic[id] : ids.has(id));

  const toggle = (id: string) => {
    if (!isStudent) {
      toast('Sign in to save roles', { action: { label: 'Sign in', onClick: () => navigate({ to: '/signin' }) } });
      return;
    }
    const next = !isSaved(id);
    setOptimistic((o) => ({ ...o, [id]: next }));
    const opts = {
      onError: () => {
        setOptimistic((o) => {
          const { [id]: _drop, ...rest } = o;
          return rest;
        });
        toast.error('Couldn’t update your saved roles. Try again.');
      },
    };
    if (next) {
      save.mutate(id, { ...opts, onSuccess: () => toast.success('Saved to your shortlist') });
    } else {
      unsave.mutate(id, opts);
    }
  };

  return { visible: !isAuthenticated || isStudent, isSaved, toggle };
}
