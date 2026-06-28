import { db } from '@/lib/db';
import PersonDetail from './PersonDetail';

const batchNameToSlug = (name: string) => name.replace('–', '-');

export async function generateStaticParams() {
  const people = await db.getPeople();
  return people.map(p => ({
    batch: batchNameToSlug(p.batch),
    memberId: p.id
  }));
}

export default function MemberProfilePage() {
  return <PersonDetail />;
}
