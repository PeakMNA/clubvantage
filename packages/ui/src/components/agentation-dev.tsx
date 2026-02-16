'use client';

import { lazy, Suspense } from 'react';

const AgentationLazy = lazy(() =>
  import('agentation').then((m) => ({ default: m.Agentation }))
);

export function AgentationDev() {
  if (process.env.NODE_ENV !== 'development') return null;
  return (
    <Suspense fallback={null}>
      <AgentationLazy webhookUrl="http://localhost:4747" />
    </Suspense>
  );
}
