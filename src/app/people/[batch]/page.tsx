import BatchPeoplePage from './BatchPeoplePage';

export async function generateStaticParams() {
  return [
    { batch: '2026-27' },
    { batch: '2027-28' },
    { batch: '2028-29' }
  ];
}

export default function BatchPage() {
  return <BatchPeoplePage />;
}
