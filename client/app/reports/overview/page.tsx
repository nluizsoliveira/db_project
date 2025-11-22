"use client";

import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { apiGet } from "@/lib/api";

interface ReservationRollup {
  installation_name: string | null;
  month_number: number | null;
  total_reservations: number;
}

interface ActivitiesCube {
  council_number: string | null;
  category: string | null;
  total_activities: number;
}

interface ParticipantsTotal {
  activity_name: string | null;
  total_participants: number;
}

interface InstallationRanking {
  ranking: number;
  installation_name: string;
  total_reservations: number;
}

interface ActivityOccurrence {
  atividade: string;
  local: string;
  tipo_local: string;
  dia_semana: string;
  horario_inicio: string;
  horario_fim: string;
  educador_responsavel: string;
}

interface InstallationMostReserved {
  nome: string;
  tipo: string;
  total_reservas: number;
}

export default function ReportsOverviewPage() {
  const [reservationRollup, setReservationRollup] = useState<
    ReservationRollup[]
  >([]);
  const [activitiesCube, setActivitiesCube] = useState<ActivitiesCube[]>([]);
  const [participantsTotals, setParticipantsTotals] = useState<
    ParticipantsTotal[]
  >([]);
  const [installationRanking, setInstallationRanking] = useState<
    InstallationRanking[]
  >([]);
  const [activityOccurrences, setActivityOccurrences] = useState<
    ActivityOccurrence[]
  >([]);
  const [installationsMostReserved, setInstallationsMostReserved] = useState<
    InstallationMostReserved[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setError(null);
      const data = await apiGet<{
        success: boolean;
        reservation_rollup: ReservationRollup[];
        activities_cube: ActivitiesCube[];
        participants_totals: ParticipantsTotal[];
        installation_ranking: InstallationRanking[];
        activity_occurrences?: ActivityOccurrence[];
        installations_most_reserved?: InstallationMostReserved[];
      }>("/reports/overview");

      if (data.success) {
        setReservationRollup(data.reservation_rollup || []);
        setActivitiesCube(data.activities_cube || []);
        setParticipantsTotals(data.participants_totals || []);
        setInstallationRanking(data.installation_ranking || []);
        setActivityOccurrences(data.activity_occurrences || []);
        setInstallationsMostReserved(data.installations_most_reserved || []);
      }
    } catch (err) {
      console.error("Erro ao carregar relatórios:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Erro desconhecido ao carregar relatórios";
      setError(errorMessage);
      setReservationRollup([]);
      setActivitiesCube([]);
      setParticipantsTotals([]);
      setInstallationRanking([]);
      setActivityOccurrences([]);
      setInstallationsMostReserved([]);
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
              Relatórios operacionais
            </h1>
          </header>
          <div className="rounded-lg bg-white p-4 shadow">
            <p className="text-gray-600">Carregando relatórios...</p>
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
              Relatórios operacionais
            </h1>
          </header>
          <div className="rounded-lg bg-red-50 border border-red-200 p-4 shadow">
            <h2 className="text-lg font-semibold text-red-900 mb-2">
              Erro ao carregar relatórios
            </h2>
            <p className="text-red-700">{error}</p>
            <button
              onClick={loadReports}
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
            Relatórios operacionais
          </h1>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg bg-white p-4 shadow">
            <h2 className="text-lg font-semibold text-gray-900">
              Consolidado de reservas
            </h2>
            <div className="mt-4 max-h-96 overflow-x-auto overflow-y-auto">
              <table className="min-w-full text-sm">
                <thead className="border-b text-left text-gray-500">
                  <tr>
                    <th className="px-3 py-2">Instalação</th>
                    <th className="px-3 py-2">Mês</th>
                    <th className="px-3 py-2">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {reservationRollup.length > 0 ? (
                    reservationRollup.map((row, index) => (
                      <tr key={index}>
                        <td className="px-3 py-2">
                          {row.installation_name || "Total"}
                        </td>
                        <td className="px-3 py-2">{row.month_number || "—"}</td>
                        <td className="px-3 py-2 font-semibold text-gray-900">
                          {row.total_reservations}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        className="px-3 py-6 text-center text-gray-500"
                        colSpan={3}
                      >
                        Nenhum dado de reserva disponível.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-lg bg-white p-4 shadow">
            <h2 className="text-lg font-semibold text-gray-900">
              Atividades por educador
            </h2>
            <div className="mt-4 max-h-96 overflow-x-auto overflow-y-auto">
              <table className="min-w-full text-sm">
                <thead className="border-b text-left text-gray-500">
                  <tr>
                    <th className="px-3 py-2">Conselho</th>
                    <th className="px-3 py-2">Categoria</th>
                    <th className="px-3 py-2">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {activitiesCube.length > 0 ? (
                    activitiesCube.map((row, index) => (
                      <tr key={index}>
                        <td className="px-3 py-2">
                          {row.council_number || "Todos"}
                        </td>
                        <td className="px-3 py-2">{row.category || "Todos"}</td>
                        <td className="px-3 py-2 font-semibold text-gray-900">
                          {row.total_activities}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        className="px-3 py-6 text-center text-gray-500"
                        colSpan={3}
                      >
                        Nenhum dado de atividade disponível.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg bg-white p-4 shadow">
            <h2 className="text-lg font-semibold text-gray-900">
              Participantes por atividade
            </h2>
            <div className="mt-4 max-h-96 overflow-x-auto overflow-y-auto">
              <table className="min-w-full text-sm">
                <thead className="border-b text-left text-gray-500">
                  <tr>
                    <th className="px-3 py-2">Atividade</th>
                    <th className="px-3 py-2">Participantes</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {participantsTotals.length > 0 ? (
                    participantsTotals.map((row, index) => (
                      <tr key={index}>
                        <td className="px-3 py-2">
                          {row.activity_name || "Total"}
                        </td>
                        <td className="px-3 py-2 font-semibold text-gray-900">
                          {row.total_participants}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        className="px-3 py-6 text-center text-gray-500"
                        colSpan={2}
                      >
                        Nenhum dado de participante disponível.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-lg bg-white p-4 shadow">
            <h2 className="text-lg font-semibold text-gray-900">
              Ranking de instalações
            </h2>
            <div className="mt-4 max-h-96 overflow-x-auto overflow-y-auto">
              <table className="min-w-full text-sm">
                <thead className="border-b text-left text-gray-500">
                  <tr>
                    <th className="px-3 py-2">Posição</th>
                    <th className="px-3 py-2">Instalação</th>
                    <th className="px-3 py-2">Reservas</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {installationRanking.length > 0 ? (
                    installationRanking.map((row, index) => (
                      <tr key={index}>
                        <td className="px-3 py-2 font-semibold text-gray-900">
                          #{row.ranking}
                        </td>
                        <td className="px-3 py-2">{row.installation_name}</td>
                        <td className="px-3 py-2">{row.total_reservations}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        className="px-3 py-6 text-center text-gray-500"
                        colSpan={3}
                      >
                        Nenhum ranking disponível.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {activityOccurrences.length > 0 && (
          <div className="rounded-lg bg-white p-4 shadow">
            <h2 className="text-lg font-semibold text-gray-900">
              Ocorrências Semanais de Atividades
            </h2>
            <div className="mt-4 max-h-96 overflow-x-auto overflow-y-auto">
              <table className="min-w-full text-sm">
                <thead className="border-b text-left text-gray-500">
                  <tr>
                    <th className="px-3 py-2">Atividade</th>
                    <th className="px-3 py-2">Local</th>
                    <th className="px-3 py-2">Tipo</th>
                    <th className="px-3 py-2">Dia da Semana</th>
                    <th className="px-3 py-2">Horário</th>
                    <th className="px-3 py-2">Educador</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {activityOccurrences
                    .sort((a, b) => {
                      const dayOrder: Record<string, number> = {
                        SEGUNDA: 1,
                        TERÇA: 2,
                        TERCA: 2,
                        QUARTA: 3,
                        QUINTA: 4,
                        SEXTA: 5,
                        SÁBADO: 6,
                        SABADO: 6,
                        DOMINGO: 7,
                      };
                      const dayA = dayOrder[a.dia_semana.toUpperCase()] || 99;
                      const dayB = dayOrder[b.dia_semana.toUpperCase()] || 99;
                      if (dayA !== dayB) return dayA - dayB;
                      return a.horario_inicio.localeCompare(b.horario_inicio);
                    })
                    .map((occurrence, index) => (
                      <tr key={index}>
                        <td className="px-3 py-2">{occurrence.atividade}</td>
                        <td className="px-3 py-2">{occurrence.local}</td>
                        <td className="px-3 py-2">{occurrence.tipo_local}</td>
                        <td className="px-3 py-2">{occurrence.dia_semana}</td>
                        <td className="px-3 py-2">
                          {occurrence.horario_inicio.substring(0, 5)} -{" "}
                          {occurrence.horario_fim.substring(0, 5)}
                        </td>
                        <td className="px-3 py-2">
                          {occurrence.educador_responsavel}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {installationsMostReserved.length > 0 && (
          <div className="rounded-lg bg-white p-4 shadow">
            <h2 className="text-lg font-semibold text-gray-900">
              Instalações Mais Reservadas
            </h2>
            <div className="mt-4 max-h-96 overflow-x-auto overflow-y-auto">
              <table className="min-w-full text-sm">
                <thead className="border-b text-left text-gray-500">
                  <tr>
                    <th className="px-3 py-2">Instalação</th>
                    <th className="px-3 py-2">Tipo</th>
                    <th className="px-3 py-2">Total de Reservas</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {installationsMostReserved
                    .sort((a, b) => b.total_reservas - a.total_reservas)
                    .map((installation, index) => (
                      <tr key={index}>
                        <td className="px-3 py-2 font-semibold text-gray-900">
                          {installation.nome}
                        </td>
                        <td className="px-3 py-2">{installation.tipo}</td>
                        <td className="px-3 py-2 font-semibold text-gray-900">
                          {installation.total_reservas}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </Layout>
  );
}
