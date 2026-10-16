import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { TelemetryPoint, DashboardSummary } from '../services/api';

interface TelemetryChartProps {
  telemetry: TelemetryPoint[];
  dashboard: DashboardSummary;
  isDark: boolean;
}

export const TelemetryChart: React.FC<TelemetryChartProps> = ({ telemetry, dashboard, isDark }) => {
  const formattedData = telemetry.map((point) => {
    let timeLabel = '';
    try {
      const d = new Date(point.timestamp);
      timeLabel = d.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
    } catch {
      timeLabel = point.timestamp.slice(11, 19);
    }
    return { ...point, timeLabel };
  });

  return (
    <div
      className={`rounded-2xl border p-5 transition-all shadow-xs ${
        isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
      }`}
    >
      <div className="flex justify-between items-center pb-4 mb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
            Comportamiento del Nivel de Agua
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Registro continuo del sensor ultrasónico en el cauce
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
            {dashboard.current_level_pct.toFixed(0)}%
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">
            ({dashboard.current_level_cm} cm)
          </span>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="waterLevelGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={isDark ? 0.4 : 0.3} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={isDark ? '#1e293b' : '#f1f5f9'}
              vertical={false}
            />
            <XAxis
              dataKey="timeLabel"
              stroke={isDark ? '#64748b' : '#94a3b8'}
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              domain={[0, 100]}
              stroke={isDark ? '#64748b' : '#94a3b8'}
              fontSize={11}
              tickLine={false}
              axisLine={false}
              unit="%"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? '#0f172a' : '#ffffff',
                borderColor: isDark ? '#1e293b' : '#e2e8f0',
                borderRadius: '12px',
                fontSize: '12px',
                color: isDark ? '#f8fafc' : '#0f172a',
              }}
            />
            <Area
              type="monotone"
              dataKey="water_level_pct"
              stroke="#2563eb"
              strokeWidth={2}
              fill="url(#waterLevelGrad)"
              name="Nivel (%)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
