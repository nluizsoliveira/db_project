"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface InstallationRanking {
  ranking: number;
  installation_name: string;
  total_reservations: number;
}

interface InstallationRankingChartProps {
  data: InstallationRanking[];
}

export default function InstallationRankingChart({
  data,
}: InstallationRankingChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        Nenhum dado disponível
      </div>
    );
  }

  const sortedData = [...data].sort((a, b) => a.ranking - b.ranking);

  const chartData = sortedData.map((row) => ({
    name: row.installation_name,
    reservations: row.total_reservations,
    ranking: row.ranking,
  }));

  return (
    <div className="w-full h-64 mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis
            type="category"
            dataKey="name"
            width={110}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-white p-2 border border-gray-300 rounded shadow">
                    <p className="font-semibold">{data.name}</p>
                    <p className="text-sm text-gray-600">
                      Ranking: #{data.ranking}
                    </p>
                    <p className="text-sm text-gray-600">
                      Reservas: {data.reservations}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="reservations" fill="#10b981" name="Reservas" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
