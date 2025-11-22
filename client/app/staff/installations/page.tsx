'use client';

import { Suspense } from 'react';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import InstallationReservationsManager from '@/components/staff/InstallationReservationsManager';

function StaffInstallationsContent() {
  return (
    <Layout>
      <section className="space-y-6">
        <header>
          <h1 className="text-2xl font-semibold text-gray-900">Gerenciar Reservas de Instalações</h1>
        </header>

        <InstallationReservationsManager />
      </section>
    </Layout>
  );
}

export default function StaffInstallationsPage() {
  return (
    <ProtectedRoute allowedRoles={['staff', 'admin']}>
      <Suspense fallback={<div>Carregando...</div>}>
        <StaffInstallationsContent />
      </Suspense>
    </ProtectedRoute>
  );
}
