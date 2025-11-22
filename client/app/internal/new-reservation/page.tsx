'use client';

import { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import ReservationForm from '@/components/internal/ReservationForm';

function InternalNewReservationContent() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/internal/reservations');
  };

  return (
    <Layout>
      <section className="space-y-6">
        <header>
          <h1 className="text-2xl font-semibold text-gray-900">Nova Reserva</h1>
        </header>

        <ReservationForm onSuccess={handleSuccess} />
      </section>
    </Layout>
  );
}

export default function InternalNewReservationPage() {
  return (
    <ProtectedRoute allowedRoles={['internal', 'staff', 'admin']}>
      <Suspense fallback={<div>Carregando...</div>}>
        <InternalNewReservationContent />
      </Suspense>
    </ProtectedRoute>
  );
}
