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

interface ParticipantsTotal {
  activity_name: string | null;
  total_participants: number;
}

interface ParticipantsTotalsChartProps {
  data: ParticipantsTotal[];
}

export default function ParticipantsTotalsChart({
  data,
}: ParticipantsTotalsChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        Nenhum dado disponível
      </div>
    );
  }

  const filteredData = data.filter(
    (row) => row.activity_name !== null && row.activity_name !== ""
  );

  const sortedData = [...filteredData].sort(
    (a, b) => b.total_participants - a.total_participants
  );

  const chartData = sortedData.map((row) => ({
    name: row.activity_name || "Sem nome",
    participants: row.total_participants,
  }));

  return (
    <div className="w-full h-64 mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis
            type="category"
            dataKey="name"
            width={90}
            tick={{ fontSize: 12 }}
          />
          <Tooltip />
          <Bar dataKey="participants" fill="#3b82f6" name="Participantes" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
