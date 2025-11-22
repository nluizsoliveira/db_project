'use client';

import { Suspense } from 'react';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import EquipmentReservationsManager from '@/components/staff/EquipmentReservationsManager';

function StaffEquipmentContent() {
  return (
    <Layout>
      <section className="space-y-6">
        <header>
          <h1 className="text-2xl font-semibold text-gray-900">Gerenciar Reservas de Equipamentos</h1>
        </header>

        <EquipmentReservationsManager />
      </section>
    </Layout>
  );
}

export default function StaffEquipmentPage() {
  return (
    <ProtectedRoute allowedRoles={['staff', 'admin']}>
      <Suspense fallback={<div>Carregando...</div>}>
        <StaffEquipmentContent />
      </Suspense>
    </ProtectedRoute>
  );
}
