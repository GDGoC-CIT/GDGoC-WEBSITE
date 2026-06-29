'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/db';

export default function PeoplePageRedirect() {
  const router = useRouter();

  useEffect(() => {
    async function redirectToFirstBatch() {
      try {
        const batches = await db.getBatches();
        if (batches.length > 0) {
          // Convert em-dash batch name to URL slug (e.g. "2026–27" → "2026-27")
          const slug = batches[0].name.replace('–', '-');
          router.replace(`/people/${slug}`);
        } else {
          router.replace('/people/2026-27');
        }
      } catch {
        router.replace('/people/2026-27');
      }
    }
    redirectToFirstBatch();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-gdg-blue border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
