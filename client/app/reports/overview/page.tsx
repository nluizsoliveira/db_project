"use client";

import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { apiGet } from "@/lib/api";
import ReservationRollupChart from "@/components/reports/ReservationRollupChart";
import ActivitiesCubeChart from "@/components/reports/ActivitiesCubeChart";
import ParticipantsTotalsChart from "@/components/reports/ParticipantsTotalsChart";
import InstallationRankingChart from "@/components/reports/InstallationRankingChart";
import InstallationsMostReservedChart from "@/components/reports/InstallationsMostReservedChart";
import ReservationsRowNumberChart from "@/components/reports/ReservationsRowNumberChart";
import ActivitiesDenseRankChart from "@/components/reports/ActivitiesDenseRankChart";
import ReservationsMonthlyGrowthChart from "@/components/reports/ReservationsMonthlyGrowthChart";
import ReservationsCumulativeChart from "@/components/reports/ReservationsCumulativeChart";
import ActivitiesMovingAverageChart from "@/components/reports/ActivitiesMovingAverageChart";
import EducatorActivitiesCountChart from "@/components/reports/EducatorActivitiesCountChart";

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

interface InstallationMostReserved {
  nome: string;
  tipo: string;
  total_reservas: number;
}

interface ReservationRowNumber {
  id_reserva: number;
  installation_name: string;
  data_reserva: string;
  horario_inicio: string;
  horario_fim: string;
  responsible_name: string;
  reservation_sequence: number;
}

interface ActivityDenseRank {
  activity_name: string;
  total_participants: number;
  dense_ranking: number;
}

interface ReservationMonthlyGrowth {
  year: number;
  month: number;
  current_month_reservations: number;
  previous_month_reservations: number | null;
  growth_absolute: number | null;
  growth_percentage: number | null;
}


interface ReservationCumulative {
  reservation_date: string;
  daily_count: number;
  cumulative_total: number;
}

interface ActivityMovingAverage {
  activity_name: string;
  enrollment_date: string;
  daily_participants: number;
  moving_average_7_days: number;
}

interface EducatorActivityCount {
  educator_name: string;
  council_number: string;
  activity_name: string;
  activity_start_date: string;
  cumulative_activities_count: number;
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
  const [installationsMostReserved, setInstallationsMostReserved] = useState<
    InstallationMostReserved[]
  >([]);
  const [reservationsRowNumber, setReservationsRowNumber] = useState<
    ReservationRowNumber[]
  >([]);
  const [activitiesDenseRank, setActivitiesDenseRank] = useState<
    ActivityDenseRank[]
  >([]);
  const [reservationsMonthlyGrowth, setReservationsMonthlyGrowth] = useState<
    ReservationMonthlyGrowth[]
  >([]);
  const [reservationsCumulative, setReservationsCumulative] = useState<
    ReservationCumulative[]
  >([]);
  const [activitiesMovingAverage, setActivitiesMovingAverage] = useState<
    ActivityMovingAverage[]
  >([]);
  const [educatorActivitiesCount, setEducatorActivitiesCount] = useState<
    EducatorActivityCount[]
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
        installations_most_reserved?: InstallationMostReserved[];
        reservations_row_number?: ReservationRowNumber[];
        activities_dense_rank?: ActivityDenseRank[];
        reservations_monthly_growth?: ReservationMonthlyGrowth[];
        reservations_cumulative?: ReservationCumulative[];
        activities_moving_average?: ActivityMovingAverage[];
        educator_activities_count?: EducatorActivityCount[];
      }>("/reports/overview");

      if (data.success) {
        setReservationRollup(data.reservation_rollup || []);
        setActivitiesCube(data.activities_cube || []);
        setParticipantsTotals(data.participants_totals || []);
        setInstallationRanking(data.installation_ranking || []);
        setInstallationsMostReserved(data.installations_most_reserved || []);
        setReservationsRowNumber(data.reservations_row_number || []);
        setActivitiesDenseRank(data.activities_dense_rank || []);
        setReservationsMonthlyGrowth(data.reservations_monthly_growth || []);
        setReservationsCumulative(data.reservations_cumulative || []);
        setActivitiesMovingAverage(data.activities_moving_average || []);
        setEducatorActivitiesCount(data.educator_activities_count || []);
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
      setInstallationsMostReserved([]);
      setReservationsRowNumber([]);
      setActivitiesDenseRank([]);
      setReservationsMonthlyGrowth([]);
      setReservationsCumulative([]);
      setActivitiesMovingAverage([]);
      setEducatorActivitiesCount([]);
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

        <div className="space-y-6">
          <div className="rounded-lg bg-white p-4 shadow">
            <h2 className="text-lg font-semibold text-gray-900">
              Consolidado de reservas
            </h2>
            <ReservationRollupChart data={reservationRollup} />
          </div>

          <div className="rounded-lg bg-white p-4 shadow">
            <h2 className="text-lg font-semibold text-gray-900">
              Atividades por educador
            </h2>
            <ActivitiesCubeChart data={activitiesCube} />
          </div>

          <div className="rounded-lg bg-white p-4 shadow">
            <h2 className="text-lg font-semibold text-gray-900">
              Participantes por atividade
            </h2>
            <ParticipantsTotalsChart data={participantsTotals} />
          </div>

          <div className="rounded-lg bg-white p-4 shadow">
            <h2 className="text-lg font-semibold text-gray-900">
              Ranking de instalações
            </h2>
            <InstallationRankingChart data={installationRanking} />
          </div>

          {installationsMostReserved.length > 0 && (
            <div className="rounded-lg bg-white p-4 shadow">
              <h2 className="text-lg font-semibold text-gray-900">
                Instalações Mais Reservadas
              </h2>
              <InstallationsMostReservedChart data={installationsMostReserved} />
            </div>
          )}

          {reservationsRowNumber.length > 0 && (
            <div className="rounded-lg bg-white p-4 shadow">
              <h2 className="text-lg font-semibold text-gray-900">
                Reservas Sequenciais por Instalação
              </h2>
              <ReservationsRowNumberChart data={reservationsRowNumber} />
            </div>
          )}

          {activitiesDenseRank.length > 0 && (
            <div className="rounded-lg bg-white p-4 shadow">
              <h2 className="text-lg font-semibold text-gray-900">
                Ranking de Atividades por Participantes
              </h2>
              <ActivitiesDenseRankChart data={activitiesDenseRank} />
            </div>
          )}

          {reservationsMonthlyGrowth.length > 0 && (
            <div className="rounded-lg bg-white p-4 shadow">
              <h2 className="text-lg font-semibold text-gray-900">
                Crescimento Mês a Mês de Reservas
              </h2>
              <ReservationsMonthlyGrowthChart data={reservationsMonthlyGrowth} />
            </div>
          )}

          {reservationsCumulative.length > 0 && (
            <div className="rounded-lg bg-white p-4 shadow">
              <h2 className="text-lg font-semibold text-gray-900">
                Total Acumulado de Reservas
              </h2>
              <ReservationsCumulativeChart data={reservationsCumulative} />
            </div>
          )}

          {activitiesMovingAverage.length > 0 && (
            <div className="rounded-lg bg-white p-4 shadow">
              <h2 className="text-lg font-semibold text-gray-900">
                Média Móvel de Participantes
              </h2>
              <ActivitiesMovingAverageChart data={activitiesMovingAverage} />
            </div>
          )}

          {educatorActivitiesCount.length > 0 && (
            <div className="rounded-lg bg-white p-4 shadow">
              <h2 className="text-lg font-semibold text-gray-900">
                Contagem Acumulada de Atividades por Educador
              </h2>
              <EducatorActivitiesCountChart data={educatorActivitiesCount} />
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
