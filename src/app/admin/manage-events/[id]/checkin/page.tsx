import CheckinDetail from './CheckinDetail';

export async function generateStaticParams() {
  return [
    { id: 'evt-1' },
    { id: 'evt-2' },
    { id: 'evt-3' },
    { id: 'evt-4' }
  ];
}

export default function CheckinPage() {
  return <CheckinDetail />;
}
