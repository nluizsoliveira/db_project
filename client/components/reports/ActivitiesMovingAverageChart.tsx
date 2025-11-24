"use client";

import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface ActivityMovingAverage {
  activity_name: string;
  enrollment_date: string;
  daily_participants: number;
  moving_average_7_days: number;
}

interface ActivitiesMovingAverageChartProps {
  data: ActivityMovingAverage[];
}

export default function ActivitiesMovingAverageChart({
  data,
}: ActivitiesMovingAverageChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        Nenhum dado disponível
      </div>
    );
  }

  // Agrupar dados por data (soma de todas as atividades por data)
  const dataByDate: Record<string, {
    date: string;
    dateValue: number;
    totalDaily: number;
    totalAverage: number;
  }> = {};

  data.forEach((row) => {
    const date = new Date(row.enrollment_date);
    if (isNaN(date.getTime())) {
      console.warn(`Data inválida encontrada: ${row.enrollment_date}`);
      return;
    }

    const dateKey = date.toLocaleDateString("pt-BR");
    const dateValue = date.getTime();

    if (!dataByDate[dateKey]) {
      dataByDate[dateKey] = {
        date: dateKey,
        dateValue,
        totalDaily: 0,
        totalAverage: 0,
      };
    }

    dataByDate[dateKey].totalDaily += row.daily_participants || 0;

    let avgValue = 0;
    if (row.moving_average_7_days != null) {
      if (typeof row.moving_average_7_days === 'number') {
        avgValue = row.moving_average_7_days;
      } else if (typeof row.moving_average_7_days === 'string') {
        avgValue = parseFloat(row.moving_average_7_days) || 0;
      }
    }
    dataByDate[dateKey].totalAverage += avgValue;
  });

  // Converter para array e ordenar por data
  const chartData = Object.values(dataByDate).sort((a, b) => a.dateValue - b.dateValue);

  // Calcular média móvel do total (se necessário, ou usar a média já calculada)
  // Por enquanto, vamos usar a soma das médias móveis de cada atividade
  const processedData = chartData.map((item) => ({
    date: item.date,
    dateValue: item.dateValue,
    total: item.totalDaily,
    mediaMovel: Number((item.totalAverage).toFixed(2)),
  }));

  return (
    <div className="w-full mt-4">
      <ResponsiveContainer width="100%" height={600}>
        <ComposedChart
          data={processedData}
          margin={{ top: 20, right: 30, left: 20, bottom: 120 }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11 }}
            angle={-45}
            textAnchor="end"
            height={120}
            interval="preserveStartEnd"
            minTickGap={30}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            allowDecimals={false}
            width={60}
            label={{ value: 'Participantes', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
                    <p className="font-semibold mb-2 text-gray-700">
                      {payload[0]?.payload?.date}
                    </p>
                    {payload.map((entry, index) => (
                      <p key={index} className="text-sm" style={{ color: entry.color }}>
                        <span className="font-medium">{entry.name}:</span> {entry.value}
                      </p>
                    ))}
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend
            wrapperStyle={{ paddingTop: "10px" }}
            iconType="line"
          />
          <Area
            type="monotone"
            dataKey="mediaMovel"
            fill="#3b82f6"
            fillOpacity={0.2}
            stroke="#3b82f6"
            strokeWidth={2}
            name="Média Móvel (7 dias)"
          />
          <Line
            type="monotone"
            dataKey="total"
            stroke="#ef4444"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
            name="Total Diário de Participantes"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
