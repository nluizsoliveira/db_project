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

  const activities = new Set(data.map((row) => row.activity_name));
  const activitiesList = Array.from(activities);

  const chartDataByActivity: Record<string, Array<{
    date: string;
    daily: number;
    average: number;
  }>> = {};

  data.forEach((row) => {
    if (!chartDataByActivity[row.activity_name]) {
      chartDataByActivity[row.activity_name] = [];
    }
    const date = new Date(row.enrollment_date);
    let avgValue = 0;
    if (row.moving_average_7_days != null) {
      if (typeof row.moving_average_7_days === 'number') {
        avgValue = row.moving_average_7_days;
      } else if (typeof row.moving_average_7_days === 'string') {
        avgValue = parseFloat(row.moving_average_7_days) || 0;
      }
    }
    chartDataByActivity[row.activity_name].push({
      date: date.toLocaleDateString("pt-BR"),
      daily: row.daily_participants || 0,
      average: Number(avgValue.toFixed(2)),
    });
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
    <div className="w-full mt-4">
      <ResponsiveContainer width="100%" height={500}>
        <LineChart
          margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10 }}
            angle={-45}
            textAnchor="end"
            height={100}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            allowDecimals={false}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-white p-3 border border-gray-300 rounded shadow">
                    {payload.map((entry, index) => (
                      <p key={index} className="text-sm" style={{ color: entry.color }}>
                        {entry.name}: {entry.value}
                      </p>
                    ))}
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend
            wrapperStyle={{ paddingTop: "20px" }}
            iconType="line"
          />
          {activitiesList.slice(0, 5).map((activity, index) => {
            const activityData = chartDataByActivity[activity];
            return (
              <Line
                key={`${activity}-daily`}
                type="monotone"
                data={activityData}
                dataKey="daily"
                stroke={colors[index % colors.length]}
                strokeWidth={2}
                name={`${activity.length > 30 ? activity.substring(0, 30) + "..." : activity} (Diário)`}
                dot={false}
                connectNulls={false}
              />
            );
          })}
          {activitiesList.slice(0, 5).map((activity, index) => {
            const activityData = chartDataByActivity[activity];
            return (
              <Line
                key={`${activity}-average`}
                type="monotone"
                data={activityData}
                dataKey="average"
                stroke={colors[index % colors.length]}
                strokeWidth={2}
                strokeDasharray="5 5"
                name={`${activity.length > 30 ? activity.substring(0, 30) + "..." : activity} (Média 7 dias)`}
                dot={false}
                connectNulls={false}
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
      {activitiesList.length > 5 && (
        <p className="text-sm text-gray-500 mt-2">
          Mostrando apenas as 5 primeiras atividades. Total: {activitiesList.length}
        </p>
      )}
    </div>
  );
}
