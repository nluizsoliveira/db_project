"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface ActivitiesCube {
  council_number: string | null;
  category: string | null;
  total_activities: number;
}

interface ActivitiesCubeChartProps {
  data: ActivitiesCube[];
}

export default function ActivitiesCubeChart({
  data,
}: ActivitiesCubeChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        Nenhum dado disponível
      </div>
    );
  }

  const categories = new Set<string>();
  const councils = new Set<string>();

  data.forEach((row) => {
    if (row.category) {
      categories.add(row.category);
    }
    if (row.council_number) {
      councils.add(row.council_number);
    }
  });

  const categoriesList = Array.from(categories);
  const councilsList = Array.from(councils).sort();

  const chartData: Record<string, Record<string, number>> = {};

  data.forEach((row) => {
    const council = row.council_number || "Todos";
    const category = row.category || "Todos";

    if (!chartData[council]) {
      chartData[council] = {};
    }
    chartData[council][category] = row.total_activities;
  });

  const formattedData = councilsList.map((council) => {
    const entry: Record<string, string | number> = {
      council: council,
    };

    categoriesList.forEach((category) => {
      entry[category] = chartData[council]?.[category] || 0;
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

  return (
    <div className="w-full h-64 mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="council" />
          <YAxis />
          <Tooltip />
          <Legend />
          {categoriesList.map((category, index) => (
            <Bar
              key={category}
              dataKey={category}
              fill={colors[index % colors.length]}
              name={category}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
