import React from 'react';
import { ModerationQueueTable } from '../../components/employer/ModerationQueueTable';

interface ModerationQueuePageProps {
  navigate?: (path: string) => void;
}

export const ModerationQueuePage: React.FC<ModerationQueuePageProps> = ({ navigate }) => (
  <div className="lit lit-left" style={{ padding: '32px 0 72px' }}>
    <header style={{ marginBottom: 24 }}>
      <h1 className="t-h1">Listings</h1>
      <p className="t-body" style={{ marginTop: 8 }}>
        Only open listings appear in the public directory.
      </p>
    </header>
    <ModerationQueueTable navigate={navigate} />
  </div>
);
