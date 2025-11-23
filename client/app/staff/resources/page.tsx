"use client";

import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { apiGet } from "@/lib/api";
import EquipamentosDisponiveisTable from "@/components/views/EquipamentosDisponiveisTable";
import InstalacoesOcupacaoTable from "@/components/views/InstalacoesOcupacaoTable";

interface EquipamentoDisponivel {
  id_patrimonio: string;
  nome_equipamento: string;
  preco_aquisicao: number | null;
  data_aquisicao: string | null;
  eh_reservavel: string;
  id_instalacao: number | null;
  nome_instalacao: string | null;
  tipo_instalacao: string | null;
  cpf_doador: string | null;
  nome_doador: string | null;
  data_doacao: string | null;
  status_disponibilidade: string;
}

interface InstalacaoOcupacao {
  id_instalacao: number;
  nome_instalacao: string;
  tipo_instalacao: string;
  capacidade: number | null;
  eh_reservavel: string;
  total_reservas: number;
  reservas_futuras: number;
  reservas_passadas: number;
  total_ocorrencias_semanais: number;
  total_equipamentos: number;
  percentual_ocupacao: number | null;
}

export default function ResourcesPage() {
  const [equipamentosDisponiveis, setEquipamentosDisponiveis] = useState<
    EquipamentoDisponivel[]
  >([]);
  const [instalacoesOcupacao, setInstalacoesOcupacao] = useState<
    InstalacaoOcupacao[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"instalacoes" | "equipamentos">(
    "instalacoes"
  );

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    try {
      setError(null);
      setLoading(true);

      const [equipamentos, instalacoes] = await Promise.all([
        apiGet<{ success: boolean; data: EquipamentoDisponivel[] }>(
          "/views/equipamentos-disponiveis"
        ),
        apiGet<{ success: boolean; data: InstalacaoOcupacao[] }>(
          "/views/instalacoes-ocupacao"
        ),
      ]);

      if (equipamentos.success) {
        setEquipamentosDisponiveis(equipamentos.data || []);
      }
      if (instalacoes.success) {
        setInstalacoesOcupacao(instalacoes.data || []);
      }
    } catch (err) {
      console.error("Erro ao carregar recursos:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Erro desconhecido ao carregar recursos";
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
              Recursos Disponíveis
            </h1>
          </header>
          <div className="rounded-lg bg-white p-4 shadow">
            <p className="text-gray-600">Carregando recursos...</p>
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
              Recursos Disponíveis
            </h1>
          </header>
          <div className="rounded-lg bg-red-50 border border-red-200 p-4 shadow">
            <h2 className="text-lg font-semibold text-red-900 mb-2">
              Erro ao carregar recursos
            </h2>
            <p className="text-red-700">{error}</p>
            <button
              onClick={loadResources}
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
            Recursos Disponíveis
          </h1>
          <p className="text-gray-600 mt-2">
            Visualização de instalações e equipamentos disponíveis no sistema
          </p>
        </header>

        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("instalacoes")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "instalacoes"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Instalações - Ocupação
            </button>
            <button
              onClick={() => setActiveTab("equipamentos")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "equipamentos"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Equipamentos Disponíveis
            </button>
          </nav>
        </div>

        <div className="rounded-lg bg-white p-4 shadow">
          {activeTab === "instalacoes" && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Instalações - Ocupação
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Visualização de todas as instalações com informações de
                ocupação e reservas
              </p>
              <InstalacoesOcupacaoTable data={instalacoesOcupacao} />
            </div>
          )}

          {activeTab === "equipamentos" && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Equipamentos Disponíveis
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Visualização de todos os equipamentos disponíveis para reserva
                com informações completas
              </p>
              <EquipamentosDisponiveisTable data={equipamentosDisponiveis} />
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
