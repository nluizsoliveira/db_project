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

interface EducatorActivityCount {
  educator_name: string;
  council_number: string;
  activity_name: string;
  activity_start_date: string;
  cumulative_activities_count: number;
}

interface EducatorActivitiesCountChartProps {
  data: EducatorActivityCount[];
}

export default function EducatorActivitiesCountChart({
  data,
}: EducatorActivitiesCountChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        Nenhum dado disponível
      </div>
    );
  }

  const educators = new Map<string, {
    name: string;
    council: string;
    maxCount: number;
    activities: Array<{
      activity: string;
      date: string;
      count: number;
    }>;
  }>();

  data.forEach((row) => {
    if (!educators.has(row.educator_name)) {
      educators.set(row.educator_name, {
        name: row.educator_name,
        council: row.council_number,
        maxCount: 0,
        activities: [],
      });
    }
    const educator = educators.get(row.educator_name)!;
    const date = new Date(row.activity_start_date);
    educator.activities.push({
      activity: row.activity_name,
      date: date.toLocaleDateString("pt-BR"),
      count: row.cumulative_activities_count,
    });
    if (row.cumulative_activities_count > educator.maxCount) {
      educator.maxCount = row.cumulative_activities_count;
    }
  });

  const chartData = Array.from(educators.values())
    .sort((a, b) => b.maxCount - a.maxCount)
    .slice(0, 10)
    .map((educator) => ({
      name: educator.name.length > 20
        ? educator.name.substring(0, 20) + "..."
        : educator.name,
      fullName: educator.name,
      council: educator.council,
      count: educator.maxCount,
      activities: educator.activities.length,
    }));

  return (
    <div className="w-full mt-4">
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            height={120}
            tick={{ fontSize: 11 }}
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
                    <p className="font-semibold mb-2">{data.fullName}</p>
                    <p className="text-sm text-gray-600">
                      Conselho: {data.council}
                    </p>
                    <p className="text-sm text-gray-600">
                      Total de Atividades: {data.count}
                    </p>
                    <p className="text-sm text-gray-600">
                      Atividades Únicas: {data.activities}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend />
          <Bar dataKey="count" fill="#8b5cf6" name="Total Acumulado de Atividades" />
        </BarChart>
      </ResponsiveContainer>
      {Array.from(educators.values()).length > 10 && (
        <p className="text-sm text-gray-500 mt-2">
          Mostrando apenas os 10 educadores com mais atividades. Total: {Array.from(educators.values()).length}
        </p>
      )}
    </div>
  );
}
