'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';

function StaffDashboardContent() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/staff/activities');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <p className="text-gray-500">Redirecionando...</p>
      </div>
    </div>
  );
}

export default function StaffDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['staff', 'admin']}>
      <StaffDashboardContent />
    </ProtectedRoute>
  );
}
