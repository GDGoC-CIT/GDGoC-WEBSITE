import EventDetail from './EventDetail';

export async function generateStaticParams() {
  return [
    { id: 'evt-1' },
    { id: 'evt-2' },
    { id: 'evt-3' },
    { id: 'evt-4' },
    { id: 'evt-5' },
    { id: 'evt-6' },
    { id: 'evt-7' },
    { id: 'evt-8' },
    { id: 'evt-9' },
    { id: 'evt-10' }
  ];
}

export default function EventPage() {
  return <EventDetail />;
}

