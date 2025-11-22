"use client";

import { useEffect } from "react";
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

interface ReservationRollup {
  installation_name: string | null;
  month_number: number | null;
  total_reservations: number;
}

interface ReservationRollupChartProps {
  data: ReservationRollup[];
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

export default function ReservationRollupChart({
  data,
}: ReservationRollupChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        Nenhum dado disponível
      </div>
    );
  }

  const installations = new Set<string>();
  const validData: Array<{
    installation_name: string;
    month_number: number;
    total_reservations: number;
  }> = [];

  data.forEach((row) => {
    if (row.installation_name && row.month_number !== null) {
      const monthNum =
        typeof row.month_number === "string"
          ? parseInt(row.month_number, 10)
          : Math.floor(Number(row.month_number));

      if (!isNaN(monthNum) && monthNum >= 1 && monthNum <= 12) {
        installations.add(row.installation_name);
        validData.push({
          installation_name: row.installation_name,
          month_number: monthNum,
          total_reservations: row.total_reservations,
        });
      }
    }
  });

  if (validData.length === 0 || installations.size === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        Nenhum dado válido disponível
      </div>
    );
  }

  const installationsList = Array.from(installations);

  const chartData: Record<number, Record<string, number>> = {};

  validData.forEach((row) => {
    if (!chartData[row.month_number]) {
      chartData[row.month_number] = {};
    }
    chartData[row.month_number][row.installation_name] =
      row.total_reservations;
  });

  const months = Object.keys(chartData)
    .map(Number)
    .sort((a, b) => a - b);

  if (months.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        Nenhum dado válido disponível
      </div>
    );
  }

  const formattedData = months.map((month) => {
    const entry: Record<string, string | number> = {
      month: monthNames[month] || month.toString(),
      monthNumber: month,
    };

    installationsList.forEach((installation) => {
      entry[installation] = chartData[month][installation] || 0;
    });

    return entry;
  });

  const colors = [
    "#3b82f6",
    "#ef4444",
    "#10b981",
    "#f59e0b",
    "#8b5cf6",
    "#ec4899",
    "#06b6d4",
    "#84cc16",
  ];

  useEffect(() => {
    console.log("ReservationRollupChart - Raw data:", data);
    console.log("ReservationRollupChart - Valid data:", validData);
    console.log("ReservationRollupChart - Formatted data:", formattedData);
    console.log("ReservationRollupChart - Installations:", installationsList);
    console.log("ReservationRollupChart - Chart data structure:", chartData);
  }, [data]);

  if (formattedData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        Nenhum dado válido disponível
      </div>
    );
  }

  return (
    <div className="w-full mt-4">
      <ResponsiveContainer width="100%" height={600}>
        <LineChart
          data={formattedData}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 12 }}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 12 }}
            domain={[0, 'auto']}
          />
          <Tooltip
            wrapperStyle={{ zIndex: 100 }}
            contentStyle={{ zIndex: 100 }}
          />
          <Legend
            wrapperStyle={{ paddingTop: "20px", zIndex: 1 }}
            iconType="line"
          />
          {installationsList.map((installation, index) => (
            <Line
              key={installation}
              type="monotone"
              dataKey={installation}
              stroke={colors[index % colors.length]}
              strokeWidth={2}
              name={installation}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
              connectNulls={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
