'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/home');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-gdg-blue border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-gray-550 font-semibold text-xs uppercase tracking-wider">Redirecting to home page...</p>
      </div>
    </div>
  );
}
