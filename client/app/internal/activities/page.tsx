'use client';

import { Suspense } from 'react';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import ActivitiesList from '@/components/internal/ActivitiesList';

function InternalActivitiesContent() {
  return (
    <Layout>
      <section className="space-y-6">
        <header>
          <h1 className="text-2xl font-semibold text-gray-900">Atividades Disponíveis</h1>
        </header>

        <ActivitiesList />
      </section>
    </Layout>
  );
}

export default function InternalActivitiesPage() {
  return (
    <ProtectedRoute allowedRoles={['internal', 'staff', 'admin']}>
      <Suspense fallback={<div>Carregando...</div>}>
        <InternalActivitiesContent />
      </Suspense>
    </ProtectedRoute>
  );
}
