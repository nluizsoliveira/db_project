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

interface ActivityDenseRank {
  activity_name: string;
  total_participants: number;
  dense_ranking: number;
}

interface ActivitiesDenseRankChartProps {
  data: ActivityDenseRank[];
}

export default function ActivitiesDenseRankChart({
  data,
}: ActivitiesDenseRankChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        Nenhum dado disponível
      </div>
    );
  }

  const sortedData = [...data].sort((a, b) => a.dense_ranking - b.dense_ranking);

  const chartData = sortedData.map((row) => ({
    name: row.activity_name.length > 20
      ? row.activity_name.substring(0, 20) + "..."
      : row.activity_name,
    fullName: row.activity_name,
    participants: row.total_participants,
    ranking: row.dense_ranking,
  }));

  return (
    <div className="w-full h-96 mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 150, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis
            type="category"
            dataKey="name"
            width={140}
            tick={{ fontSize: 11 }}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-white p-2 border border-gray-300 rounded shadow">
                    <p className="font-semibold">{data.fullName}</p>
                    <p className="text-sm text-gray-600">
                      Ranking: #{data.ranking}
                    </p>
                    <p className="text-sm text-gray-600">
                      Participantes: {data.participants}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="participants" fill="#8b5cf6" name="Participantes" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
