'use client';

import { useState, Suspense } from 'react';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import ActivitiesList from '@/components/internal/ActivitiesList';
import EnrolledActivitiesList from '@/components/internal/EnrolledActivitiesList';

type TabType = 'available' | 'enrolled';

function InternalActivitiesContent() {
  const [activeTab, setActiveTab] = useState<TabType>('available');

  const tabs = [
    { id: 'available' as TabType, label: 'Atividades Disponíveis' },
    { id: 'enrolled' as TabType, label: 'Atividades que estou inscrito' },
  ];

  return (
    <Layout>
      <section className="space-y-6">
        <header>
          <h1 className="text-2xl font-semibold text-gray-900">Atividades</h1>
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
          {activeTab === 'available' && <ActivitiesList />}
          {activeTab === 'enrolled' && <EnrolledActivitiesList />}
        </div>
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
