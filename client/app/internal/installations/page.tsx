'use client';

import { useState, useEffect, useCallback, FormEvent, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { apiGet } from '@/lib/api';
import AvailableInstallationsTable from '@/components/internal/AvailableInstallationsTable';
import AvailableEquipmentTable from '@/components/internal/AvailableEquipmentTable';

interface AvailableInstallation {
  nome: string;
  tipo: string;
  capacidade: number;
}

interface AvailableEquipment {
  id_patrimonio: string;
  nome: string;
  local: string;
}

type TabType = 'installations' | 'equipment';

function InstallationsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabType>('installations');

  const [availableInstalls, setAvailableInstalls] = useState<AvailableInstallation[]>([]);
  const [availableEquipment, setAvailableEquipment] = useState<AvailableEquipment[]>([]);

  const [installationFilters, setInstallationFilters] = useState({
    date: searchParams.get('date') || '',
    start: searchParams.get('start') || '',
    end: searchParams.get('end') || '',
  });

  const [equipmentFilters, setEquipmentFilters] = useState({
    date: '',
    start: '',
    end: '',
  });

  const [loadingInstalls, setLoadingInstalls] = useState(false);
  const [loadingEquipment, setLoadingEquipment] = useState(false);

  const loadAvailableInstallations = useCallback(async () => {
    if (!installationFilters.date || !installationFilters.start || !installationFilters.end) {
      setAvailableInstalls([]);
      return;
    }

    setLoadingInstalls(true);
    try {
      const params = new URLSearchParams();
      params.append('date', installationFilters.date);
      params.append('start', installationFilters.start);
      params.append('end', installationFilters.end);

      const data = await apiGet<{
        success: boolean;
        available_installs: AvailableInstallation[];
      }>(`/internal/?${params.toString()}`);

      if (data.success) {
        setAvailableInstalls(data.available_installs || []);
      }
    } catch (err) {
      console.error('Erro ao carregar instalações disponíveis:', err);
      setAvailableInstalls([]);
    } finally {
      setLoadingInstalls(false);
    }
  }, [installationFilters]);

  const loadAvailableEquipment = useCallback(async () => {
    if (!equipmentFilters.date || !equipmentFilters.start || !equipmentFilters.end) {
      setAvailableEquipment([]);
      return;
    }

    setLoadingEquipment(true);
    try {
      const params = new URLSearchParams();
      params.append('date', equipmentFilters.date);
      params.append('start', equipmentFilters.start);
      params.append('end', equipmentFilters.end);

      const data = await apiGet<{
        success: boolean;
        available_equipment: AvailableEquipment[];
      }>(`/internal/?${params.toString()}`);

      if (data.success) {
        setAvailableEquipment(data.available_equipment || []);
      }
    } catch (err) {
      console.error('Erro ao carregar equipamentos disponíveis:', err);
      setAvailableEquipment([]);
    } finally {
      setLoadingEquipment(false);
    }
  }, [equipmentFilters]);

  useEffect(() => {
    if (activeTab === 'installations') {
      loadAvailableInstallations();
    }
  }, [searchParams, activeTab, loadAvailableInstallations]);

  useEffect(() => {
    if (activeTab === 'equipment' && equipmentFilters.date && equipmentFilters.start && equipmentFilters.end) {
      loadAvailableEquipment();
    }
  }, [equipmentFilters, activeTab, loadAvailableEquipment]);

  const handleInstallationSubmit = (e: FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (installationFilters.date) params.append('date', installationFilters.date);
    if (installationFilters.start) params.append('start', installationFilters.start);
    if (installationFilters.end) params.append('end', installationFilters.end);
    router.push(`/internal/installations?${params.toString()}`);
  };

  const handleEquipmentSubmit = (e: FormEvent) => {
    e.preventDefault();
    loadAvailableEquipment();
  };

  return (
    <Layout>
      <section className="space-y-6">
        <header>
          <h1 className="text-2xl font-semibold text-gray-900">Recursos Disponíveis</h1>
        </header>

        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('installations')}
              className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${
                activeTab === 'installations'
                  ? 'border-[#1094ab] text-[#1094ab]'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              Instalações
            </button>
            <button
              onClick={() => setActiveTab('equipment')}
              className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${
                activeTab === 'equipment'
                  ? 'border-[#1094ab] text-[#1094ab]'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              Equipamentos
            </button>
          </nav>
        </div>

        <div className="rounded-lg bg-white shadow p-4">
            {activeTab === 'installations' ? (
              <>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Consultar Disponibilidade de Instalações</h2>
                <form onSubmit={handleInstallationSubmit}>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <label className="text-sm text-gray-600">
                      <span className="mb-1 block font-medium">Data</span>
                      <input
                        type="date"
                        name="date"
                        value={installationFilters.date}
                        onChange={(e) => setInstallationFilters({ ...installationFilters, date: e.target.value })}
                        className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#1094ab] focus:outline-none focus:ring-1 focus:ring-[#1094ab]"
                      />
                    </label>
                    <label className="text-sm text-gray-600">
                      <span className="mb-1 block font-medium">Início</span>
                      <input
                        type="time"
                        name="start"
                        value={installationFilters.start}
                        onChange={(e) => setInstallationFilters({ ...installationFilters, start: e.target.value })}
                        className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#1094ab] focus:outline-none focus:ring-1 focus:ring-[#1094ab]"
                      />
                    </label>
                    <label className="text-sm text-gray-600">
                      <span className="mb-1 block font-medium">Fim</span>
                      <input
                        type="time"
                        name="end"
                        value={installationFilters.end}
                        onChange={(e) => setInstallationFilters({ ...installationFilters, end: e.target.value })}
                        className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#1094ab] focus:outline-none focus:ring-1 focus:ring-[#1094ab]"
                      />
                    </label>
                  </div>
                  <div className="mt-4 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setInstallationFilters({ date: '', start: '', end: '' });
                        router.push('/internal/installations');
                      }}
                      className="rounded border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                    >
                      Limpar
                    </button>
                    <button
                      type="submit"
                      className="rounded bg-[#1094ab] px-4 py-2 text-sm font-semibold text-white hover:bg-[#64c4d2] hover:text-[#1094ab]"
                    >
                      Verificar disponibilidade
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Consultar Disponibilidade de Equipamentos</h2>
                <form onSubmit={handleEquipmentSubmit}>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <label className="text-sm text-gray-600">
                      <span className="mb-1 block font-medium">Data</span>
                      <input
                        type="date"
                        name="date"
                        value={equipmentFilters.date}
                        onChange={(e) => setEquipmentFilters({ ...equipmentFilters, date: e.target.value })}
                        className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#1094ab] focus:outline-none focus:ring-1 focus:ring-[#1094ab]"
                      />
                    </label>
                    <label className="text-sm text-gray-600">
                      <span className="mb-1 block font-medium">Início</span>
                      <input
                        type="time"
                        name="start"
                        value={equipmentFilters.start}
                        onChange={(e) => setEquipmentFilters({ ...equipmentFilters, start: e.target.value })}
                        className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#1094ab] focus:outline-none focus:ring-1 focus:ring-[#1094ab]"
                      />
                    </label>
                    <label className="text-sm text-gray-600">
                      <span className="mb-1 block font-medium">Fim</span>
                      <input
                        type="time"
                        name="end"
                        value={equipmentFilters.end}
                        onChange={(e) => setEquipmentFilters({ ...equipmentFilters, end: e.target.value })}
                        className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#1094ab] focus:outline-none focus:ring-1 focus:ring-[#1094ab]"
                      />
                    </label>
                  </div>
                  <div className="mt-4 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEquipmentFilters({ date: '', start: '', end: '' });
                        setAvailableEquipment([]);
                      }}
                      className="rounded border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                    >
                      Limpar
                    </button>
                    <button
                      type="submit"
                      className="rounded bg-[#1094ab] px-4 py-2 text-sm font-semibold text-white hover:bg-[#64c4d2] hover:text-[#1094ab]"
                    >
                      Verificar disponibilidade
                    </button>
                  </div>
                </form>
              </>
            )}
        </div>

        <div className="rounded-lg bg-white p-4 shadow">
          {activeTab === 'installations' ? (
            <>
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Instalações disponíveis</h3>
              <AvailableInstallationsTable
                installations={availableInstalls}
                loading={loadingInstalls}
                hasFilters={!!(installationFilters.date && installationFilters.start && installationFilters.end)}
              />
            </>
          ) : (
            <>
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Equipamentos disponíveis</h3>
              <AvailableEquipmentTable
                equipment={availableEquipment}
                loading={loadingEquipment}
                hasFilters={!!(equipmentFilters.date && equipmentFilters.start && equipmentFilters.end)}
              />
            </>
          )}
        </div>
      </section>
    </Layout>
  );
}

export default function InstallationsPage() {
  return (
    <ProtectedRoute allowedRoles={['internal', 'staff', 'admin']}>
      <Suspense fallback={<div>Carregando...</div>}>
        <InstallationsContent />
      </Suspense>
    </ProtectedRoute>
  );
}
