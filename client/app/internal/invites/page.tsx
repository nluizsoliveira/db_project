'use client';

import { useState, Suspense } from 'react';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import InviteForm from '@/components/internal/InviteForm';
import InvitesList from '@/components/internal/InvitesList';

function InternalInvitesContent() {
  const [refreshInvites, setRefreshInvites] = useState(0);

  const handleInviteCreated = () => {
    setRefreshInvites((prev) => prev + 1);
  };

  return (
    <Layout>
      <section className="space-y-6">
        <header>
          <h1 className="text-2xl font-semibold text-gray-900">Convites</h1>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          <InviteForm onSuccess={handleInviteCreated} />
          <InvitesList refreshTrigger={refreshInvites} />
        </div>
      </section>
    </Layout>
  );
}

export default function InternalInvitesPage() {
  return (
    <ProtectedRoute allowedRoles={['internal', 'staff', 'admin']}>
      <Suspense fallback={<div>Carregando...</div>}>
        <InternalInvitesContent />
      </Suspense>
    </ProtectedRoute>
  );
}
