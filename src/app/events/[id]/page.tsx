import EventDetail from './EventDetail';

export async function generateStaticParams() {
  return [
    { id: 'evt-1' },
    { id: 'evt-2' },
    { id: 'evt-3' },
    { id: 'evt-4' }
  ];
}

export default function EventPage() {
  return <EventDetail />;
}
