"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ReservationCumulative {
  reservation_date: string;
  daily_count: number;
  cumulative_total: number;
}

interface ReservationsCumulativeChartProps {
  data: ReservationCumulative[];
}

export default function ReservationsCumulativeChart({
  data,
}: ReservationsCumulativeChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        Nenhum dado disponível
      </div>
    );
  }

  const chartData = data.map((row) => {
    const date = new Date(row.reservation_date);
    return {
      date: date.toLocaleDateString("pt-BR"),
      daily: row.daily_count,
      cumulative: row.cumulative_total,
    };
  });

  return (
    <div className="w-full mt-4">
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <defs>
            <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorDaily" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            allowDecimals={false}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-white p-3 border border-gray-300 rounded shadow">
                    <p className="font-semibold mb-2">{data.date}</p>
                    <p className="text-sm text-blue-600">
                      Total Acumulado: {data.cumulative}
                    </p>
                    <p className="text-sm text-green-600">
                      Reservas do Dia: {data.daily}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Area
            type="monotone"
            dataKey="cumulative"
            stroke="#3b82f6"
            fillOpacity={1}
            fill="url(#colorCumulative)"
            name="Total Acumulado"
          />
          <Area
            type="monotone"
            dataKey="daily"
            stroke="#10b981"
            fillOpacity={1}
            fill="url(#colorDaily)"
            name="Reservas Diárias"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
