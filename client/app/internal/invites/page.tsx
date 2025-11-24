'use client';

import { useState, Suspense } from 'react';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import InviteForm from '@/components/internal/InviteForm';
import InvitesList from '@/components/internal/InvitesList';

type TabType = 'create' | 'list';

function InternalInvitesContent() {
  const [activeTab, setActiveTab] = useState<TabType>('create');
  const [refreshInvites, setRefreshInvites] = useState(0);

  const handleInviteCreated = () => {
    setRefreshInvites((prev) => prev + 1);
  };

  const tabs = [
    { id: 'create' as TabType, label: 'Convidar Usuário Externo' },
    { id: 'list' as TabType, label: 'Convites Criados' },
  ];

  return (
    <Layout>
      <section className="space-y-6">
        <header>
          <h1 className="text-2xl font-semibold text-gray-900">Convites</h1>
        </header>

        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${
                  activeTab === tab.id
                    ? 'border-[#1094ab] text-[#1094ab]'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-6">
          {activeTab === 'create' && <InviteForm onSuccess={handleInviteCreated} />}
          {activeTab === 'list' && <InvitesList refreshTrigger={refreshInvites} />}
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
