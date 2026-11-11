import React from 'react';

interface NotFoundPageProps {
  navigate?: (path: string) => void;
}

const go = (navigate: NotFoundPageProps['navigate'], path: string) => (e: React.MouseEvent) => {
  if (!navigate || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
  e.preventDefault();
  navigate(path);
};

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ navigate }) => (
  <div className="wrap lit lit-left py-14 sm:py-24">
    <div className="grid justify-items-start gap-4">
      <h1 className="t-h1">This page isn't here</h1>
      <p className="t-lede max-w-[44ch]">The link may be old, or the role was taken down.</p>
      <div className="mt-3 flex w-full flex-wrap gap-3">
        <a href="/" onClick={go(navigate, '/')} className="btn btn-primary btn-lg max-sm:flex-[1_1_100%]">
          Go home
        </a>
        <a
          href="/internships"
          onClick={go(navigate, '/internships')}
          className="btn btn-secondary btn-lg max-sm:flex-[1_1_100%]"
        >
          Browse internships
        </a>
      </div>
    </div>
  </div>
);
