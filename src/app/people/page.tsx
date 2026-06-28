'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PeoplePageRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/people/2026-27');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-gdg-blue border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
