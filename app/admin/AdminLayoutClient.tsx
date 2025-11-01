'use client';

import { Suspense } from 'react';
import AdminLayoutContent from './AdminLayoutContent';
import { Loader2 } from 'lucide-react';

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </Suspense>
  );
}
