'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';

function InternalDashboardContent() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/internal/reservations');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <p className="text-gray-500">Redirecionando...</p>
      </div>
    </div>
  );
}

export default function InternalDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['internal', 'staff', 'admin']}>
      <InternalDashboardContent />
    </ProtectedRoute>
  );
}
