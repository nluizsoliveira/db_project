"use client";

import { useState, useEffect, Suspense } from "react";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { apiGet } from "@/lib/api";
import ReservasCompletasTable from "@/components/views/ReservasCompletasTable";
import ReservasEquipamentosCompletasTable from "@/components/views/ReservasEquipamentosCompletasTable";

interface ReservaCompleta {
  id_reserva: number;
  data_reserva: string;
  horario_inicio: string;
  horario_fim: string;
  id_instalacao: number;
  nome_instalacao: string;
  tipo_instalacao: string;
  capacidade_instalacao: number | null;
  cpf_responsavel: string;
  nome_responsavel: string;
  email_responsavel: string;
  celular_responsavel: string | null;
  nusp_responsavel: string;
  categoria_responsavel: string;
}

interface ReservaEquipamentoCompleta {
  id_reserva_equip: number;
  data_reserva: string;
  horario_inicio: string;
  horario_fim: string;
  id_equipamento: string;
  nome_equipamento: string;
  id_instalacao: number | null;
  nome_instalacao: string | null;
  tipo_instalacao: string | null;
  cpf_responsavel: string;
  nome_responsavel: string;
  email_responsavel: string;
  celular_responsavel: string | null;
  nusp_responsavel: string;
  categoria_responsavel: string;
}

function StaffReservationsContent() {
  const [reservasCompletas, setReservasCompletas] = useState<
    ReservaCompleta[]
  >([]);
  const [reservasEquipamentosCompletas, setReservasEquipamentosCompletas] =
    useState<ReservaEquipamentoCompleta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "reservas" | "reservas-equipamentos"
  >("reservas");

  useEffect(() => {
    loadReservations();
  }, []);

  const loadReservations = async () => {
    try {
      setError(null);
      setLoading(true);

      const [reservas, reservasEquip] = await Promise.all([
        apiGet<{ success: boolean; data: ReservaCompleta[] }>(
          "/views/reservas-completas"
        ),
        apiGet<{ success: boolean; data: ReservaEquipamentoCompleta[] }>(
          "/views/reservas-equipamentos-completas"
        ),
      ]);

      if (reservas.success) {
        setReservasCompletas(reservas.data || []);
      }
      if (reservasEquip.success) {
        setReservasEquipamentosCompletas(reservasEquip.data || []);
      }
    } catch (err) {
      console.error("Erro ao carregar reservas:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Erro desconhecido ao carregar reservas";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <section className="space-y-6">
          <header>
            <h1 className="text-2xl font-semibold text-gray-900">
              Reservas Completas
            </h1>
          </header>
          <div className="rounded-lg bg-white p-4 shadow">
            <p className="text-gray-600">Carregando reservas...</p>
          </div>
        </section>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <section className="space-y-6">
          <header>
            <h1 className="text-2xl font-semibold text-gray-900">
              Reservas Completas
            </h1>
          </header>
          <div className="rounded-lg bg-red-50 border border-red-200 p-4 shadow">
            <h2 className="text-lg font-semibold text-red-900 mb-2">
              Erro ao carregar reservas
            </h2>
            <p className="text-red-700">{error}</p>
            <button
              onClick={loadReservations}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="space-y-6">
        <header>
          <h1 className="text-2xl font-semibold text-gray-900">
            Reservas Completas
          </h1>
          <p className="text-gray-600 mt-2">
            Visualização consolidada de todas as reservas do sistema
          </p>
        </header>

        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("reservas")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "reservas"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Reservas de Instalações
            </button>
            <button
              onClick={() => setActiveTab("reservas-equipamentos")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "reservas-equipamentos"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Reservas de Equipamentos
            </button>
          </nav>
        </div>

        <div className="rounded-lg bg-white p-4 shadow">
          {activeTab === "reservas" && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Reservas de Instalações Completas
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Visualização consolidada de todas as reservas de instalações com
                informações de instalação e responsável
              </p>
              <ReservasCompletasTable data={reservasCompletas} />
            </div>
          )}

          {activeTab === "reservas-equipamentos" && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Reservas de Equipamentos Completas
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Visualização consolidada de todas as reservas de equipamentos com
                informações do equipamento, instalação e responsável
              </p>
              <ReservasEquipamentosCompletasTable
                data={reservasEquipamentosCompletas}
              />
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}

export default function StaffReservationsPage() {
  return (
    <ProtectedRoute allowedRoles={["staff", "admin"]}>
      <Suspense fallback={<div>Carregando...</div>}>
        <StaffReservationsContent />
      </Suspense>
    </ProtectedRoute>
  );
}
