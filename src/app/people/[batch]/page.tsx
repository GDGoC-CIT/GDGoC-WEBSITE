import { Suspense } from 'react';
import BatchPeoplePage from './BatchPeoplePage';

export async function generateStaticParams() {
  return [
    { batch: '2026-27' },
    { batch: '2027-28' },
    { batch: '2028-29' }
  ];
}

export default function BatchPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#5F6368' }}>Loading...</div>}>
      <BatchPeoplePage />
    </Suspense>
  );
}
