"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface ReservationMonthlyGrowth {
  year: number;
  month: number;
  current_month_reservations: number;
  previous_month_reservations: number | null;
  growth_absolute: number | null;
  growth_percentage: number | null;
}

interface ReservationsMonthlyGrowthChartProps {
  data: ReservationMonthlyGrowth[];
}

const monthNames: Record<number, string> = {
  1: "Jan",
  2: "Fev",
  3: "Mar",
  4: "Abr",
  5: "Mai",
  6: "Jun",
  7: "Jul",
  8: "Ago",
  9: "Set",
  10: "Out",
  11: "Nov",
  12: "Dez",
};

export default function ReservationsMonthlyGrowthChart({
  data,
}: ReservationsMonthlyGrowthChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        Nenhum dado disponível
      </div>
    );
  }

  const chartData = data.map((row) => ({
    period: `${monthNames[row.month]}/${row.year}`,
    current: row.current_month_reservations,
    previous: row.previous_month_reservations || 0,
    growth: row.growth_percentage || 0,
  }));

  return (
    <div className="w-full mt-4">
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="period"
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis
            yAxisId="left"
            tick={{ fontSize: 12 }}
            allowDecimals={false}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 12 }}
            label={{ value: "Crescimento %", angle: -90, position: "insideRight" }}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                const growthValue = typeof data.growth === 'number'
                  ? data.growth
                  : (data.growth != null ? parseFloat(data.growth) : 0);
                const growthFormatted = isNaN(growthValue)
                  ? "N/A"
                  : `${growthValue >= 0 ? "+" : ""}${growthValue.toFixed(2)}%`;
                return (
                  <div className="bg-white p-3 border border-gray-300 rounded shadow">
                    <p className="font-semibold mb-2">{data.period}</p>
                    <p className="text-sm text-gray-600">
                      Reservas Atuais: {data.current}
                    </p>
                    <p className="text-sm text-gray-600">
                      Reservas Anteriores: {data.previous}
                    </p>
                    <p className={`text-sm font-semibold ${
                      growthValue >= 0 ? "text-green-600" : "text-red-600"
                    }`}>
                      Crescimento: {growthFormatted}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="current"
            stroke="#3b82f6"
            strokeWidth={2}
            name="Reservas Atuais"
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="previous"
            stroke="#94a3b8"
            strokeWidth={2}
            strokeDasharray="5 5"
            name="Reservas Mês Anterior"
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="growth"
            stroke="#10b981"
            strokeWidth={2}
            name="Crescimento %"
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
