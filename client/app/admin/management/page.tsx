'use client';

import { useState } from 'react';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import ActivitiesManager from '@/components/admin/ActivitiesManager';
import InstallationsManager from '@/components/admin/InstallationsManager';
import EquipmentManager from '@/components/admin/EquipmentManager';
import EventsManager from '@/components/admin/EventsManager';
import UsersManager from '@/components/admin/UsersManager';

type TabType = 'activities' | 'installations' | 'equipment' | 'events' | 'users';

export default function AdminManagementPage() {
  const [activeTab, setActiveTab] = useState<TabType>('activities');

  const tabs = [
    { id: 'activities' as TabType, label: 'Atividades' },
    { id: 'installations' as TabType, label: 'Instalações' },
    { id: 'equipment' as TabType, label: 'Equipamentos' },
    { id: 'events' as TabType, label: 'Eventos' },
    { id: 'users' as TabType, label: 'Usuários' },
  ];

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <Layout>
        <section className="space-y-6">
          <header>
            <h1 className="text-2xl font-semibold text-gray-900">Gerenciamento Administrativo</h1>
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
            {activeTab === 'activities' && <ActivitiesManager />}
            {activeTab === 'installations' && <InstallationsManager />}
            {activeTab === 'equipment' && <EquipmentManager />}
            {activeTab === 'events' && <EventsManager />}
            {activeTab === 'users' && <UsersManager />}
          </div>
        </section>
      </Layout>
    </ProtectedRoute>
  );
}
