"use client";

import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { apiGet } from "@/lib/api";
import ReservasCompletasTable from "@/components/views/ReservasCompletasTable";
import AtividadesCompletasTable from "@/components/views/AtividadesCompletasTable";
import EquipamentosDisponiveisTable from "@/components/views/EquipamentosDisponiveisTable";
import InstalacoesOcupacaoTable from "@/components/views/InstalacoesOcupacaoTable";

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

interface AtividadeCompleta {
  id_atividade: number;
  nome_atividade: string;
  vagas_limite: number | null;
  data_inicio_periodo: string;
  data_fim_periodo: string | null;
  grupo_extensao: string | null;
  descricao_grupo: string | null;
  cpf_educador: string | null;
  nome_educador: string | null;
  conselho_educador: string | null;
  id_ocorrencia: number | null;
  dia_semana: string | null;
  horario_inicio: string | null;
  horario_fim: string | null;
  id_instalacao: number | null;
  nome_instalacao: string | null;
  tipo_instalacao: string | null;
  total_participantes: number;
  vagas_disponiveis: number | null;
}

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

export default function ViewsPage() {
  const [reservasCompletas, setReservasCompletas] = useState<
    ReservaCompleta[]
  >([]);
  const [atividadesCompletas, setAtividadesCompletas] = useState<
    AtividadeCompleta[]
  >([]);
  const [equipamentosDisponiveis, setEquipamentosDisponiveis] = useState<
    EquipamentoDisponivel[]
  >([]);
  const [instalacoesOcupacao, setInstalacoesOcupacao] = useState<
    InstalacaoOcupacao[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "reservas" | "atividades" | "equipamentos" | "instalacoes"
  >("reservas");

  useEffect(() => {
    loadViews();
  }, []);

  const loadViews = async () => {
    try {
      setError(null);
      setLoading(true);

      const [reservas, atividades, equipamentos, instalacoes] =
        await Promise.all([
          apiGet<{ success: boolean; data: ReservaCompleta[] }>(
            "/views/reservas-completas"
          ),
          apiGet<{ success: boolean; data: AtividadeCompleta[] }>(
            "/views/atividades-completas"
          ),
          apiGet<{ success: boolean; data: EquipamentoDisponivel[] }>(
            "/views/equipamentos-disponiveis"
          ),
          apiGet<{ success: boolean; data: InstalacaoOcupacao[] }>(
            "/views/instalacoes-ocupacao"
          ),
        ]);

      if (reservas.success) {
        setReservasCompletas(reservas.data || []);
      }
      if (atividades.success) {
        setAtividadesCompletas(atividades.data || []);
      }
      if (equipamentos.success) {
        setEquipamentosDisponiveis(equipamentos.data || []);
      }
      if (instalacoes.success) {
        setInstalacoesOcupacao(instalacoes.data || []);
      }
    } catch (err) {
      console.error("Erro ao carregar views:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Erro desconhecido ao carregar views";
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
            <h1 className="text-2xl font-semibold text-gray-900">Views</h1>
          </header>
          <div className="rounded-lg bg-white p-4 shadow">
            <p className="text-gray-600">Carregando views...</p>
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
            <h1 className="text-2xl font-semibold text-gray-900">Views</h1>
          </header>
          <div className="rounded-lg bg-red-50 border border-red-200 p-4 shadow">
            <h2 className="text-lg font-semibold text-red-900 mb-2">
              Erro ao carregar views
            </h2>
            <p className="text-red-700">{error}</p>
            <button
              onClick={loadViews}
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
          <h1 className="text-2xl font-semibold text-gray-900">Views</h1>
          <p className="text-gray-600 mt-2">
            Visualizações consolidadas dos dados do sistema
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
              Reservas Completas
            </button>
            <button
              onClick={() => setActiveTab("atividades")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "atividades"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Atividades Completas
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
          </nav>
        </div>

        <div className="rounded-lg bg-white p-4 shadow">
          {activeTab === "reservas" && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Reservas Completas
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Visualização consolidada de todas as reservas com informações
                de instalação e responsável
              </p>
              <ReservasCompletasTable data={reservasCompletas} />
            </div>
          )}

          {activeTab === "atividades" && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Atividades Completas
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Visualização consolidada de todas as atividades com grupo de
                extensão, educador e informações de participantes
              </p>
              <AtividadesCompletasTable data={atividadesCompletas} />
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
        </div>
      </section>
    </Layout>
  );
}
