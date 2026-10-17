import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Droplets, Waves, Sparkles } from 'lucide-react';
import type { TelemetryPoint, DashboardSummary } from '../services/api';

interface TelemetryChartProps {
  telemetry: TelemetryPoint[];
  dashboard: DashboardSummary;
  isDark: boolean;
}

export const TelemetryChart: React.FC<TelemetryChartProps> = ({ telemetry, dashboard, isDark }) => {
  // Enriquecer los puntos con ondulación hidrodinámica natural para que parezca agua real en movimiento
  const formattedData = telemetry.map((point, index) => {
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

    // Micro-ondulación armónica natural (efecto de superficie de agua real)
    const basePct = Math.max(0, Math.min(100, point.water_level_pct));
    // Suave variación de onda superficial (±0.6%) para romper líneas rectas artificiales
    const rippleFront = Math.sin(index * 0.75) * 0.7;
    const rippleBack = Math.cos(index * 0.75 + 1.5) * 1.1;

    const waterFront = Math.max(0, Math.min(100, Math.round((basePct + rippleFront) * 10) / 10));
    const waterBack = Math.max(0, Math.min(100, Math.round((basePct + rippleBack - 0.4) * 10) / 10));

    return {
      ...point,
      timeLabel,
      waterFront,
      waterBack,
      originalPct: basePct,
    };
  });

  // Paleta de agua natural permanente (azul cristalino y marino profundo)
  const waterColors = {
    primaryStop: '#0284c7', // Cyan azul agua brillante
    midStop: '#0369a1',    // Azul intermedio
    deepStop: '#0c4a6e',   // Azul marino de fondo
    strokeFront: '#38bdf8', // Cresta de agua brillante
    strokeBack: '#7dd3fc',  // Onda secundaria traslúcida
  };

  return (
    <div
      className={`rounded-2xl border p-5 transition-all shadow-xs ${
        isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
      }`}
    >
      {/* Encabezado con estética de fluido */}
      <div className="flex justify-between items-center pb-4 mb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-sky-500/10 text-sky-500 dark:text-sky-400">
            <Waves className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>Fluctuación Hidrométrica en Vivo</span>
              <span className="text-[10px] font-semibold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40 px-2 py-0.5 rounded-full border border-sky-200 dark:border-sky-800 flex items-center gap-1">
                <Droplets className="w-2.5 h-2.5" />
                <span>Superficie Activa</span>
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Oleaje y tirante hidrodinámico en el Cauce La Maravilla
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className="flex items-baseline justify-end gap-1.5">
            <span className="text-lg font-extrabold text-sky-600 dark:text-sky-400">
              {dashboard.current_level_pct.toFixed(0)}%
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              ({dashboard.current_level_cm.toFixed(1)} cm)
            </span>
          </div>
          <span className="text-[10px] text-slate-400 block">
            Capacidad: 300 cm
          </span>
        </div>
      </div>

      {/* Gráfica con acabado de agua líquida */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              {/* Gradiente principal del cuerpo de agua */}
              <linearGradient id="realWaterGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={waterColors.primaryStop} stopOpacity={isDark ? 0.85 : 0.75} />
                <stop offset="40%" stopColor={waterColors.midStop} stopOpacity={isDark ? 0.65 : 0.5} />
                <stop offset="90%" stopColor={waterColors.deepStop} stopOpacity={isDark ? 0.35 : 0.2} />
                <stop offset="100%" stopColor={waterColors.deepStop} stopOpacity={0.05} />
              </linearGradient>

              {/* Gradiente secundario de onda trasera traslúcida */}
              <linearGradient id="backWaveGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={waterColors.strokeBack} stopOpacity={isDark ? 0.45 : 0.35} />
                <stop offset="70%" stopColor={waterColors.primaryStop} stopOpacity={0.15} />
                <stop offset="100%" stopColor={waterColors.deepStop} stopOpacity={0.0} />
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

            {/* Líneas de cota hidrométrica */}
            <ReferenceLine
              y={80}
              stroke="#ef4444"
              strokeDasharray="4 4"
              strokeOpacity={0.6}
              label={{
                value: 'Cota Crítica (80%)',
                position: 'insideTopRight',
                fill: '#ef4444',
                fontSize: 10,
                fontWeight: 'bold',
              }}
            />
            <ReferenceLine
              y={50}
              stroke="#f59e0b"
              strokeDasharray="4 4"
              strokeOpacity={0.5}
              label={{
                value: 'Alerta Preventiva (50%)',
                position: 'insideTopRight',
                fill: '#f59e0b',
                fontSize: 10,
                fontWeight: 'bold',
              }}
            />

            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div
                      className={`p-3 rounded-xl shadow-lg border text-xs space-y-1 ${
                        isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-sky-600 dark:text-sky-400">
                        <Droplets className="w-3.5 h-3.5" />
                        <span>Hora: {data.timeLabel}</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300">
                        Nivel medido: <strong>{data.originalPct}%</strong> ({data.water_level_cm} cm)
                      </p>
                      {data.rain_mm !== undefined && (
                        <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                          Precipitación: {data.rain_mm} mm
                        </p>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />

            {/* Capa de onda trasera (sensación de profundidad de agua) */}
            <Area
              type="natural"
              dataKey="waterBack"
              stroke={waterColors.strokeBack}
              strokeWidth={1.5}
              strokeDasharray="4 2"
              fill="url(#backWaveGrad)"
              name="Onda Secundaria"
              isAnimationActive={true}
              animationDuration={800}
            />

            {/* Capa de agua principal (fluido con cresta brillante) */}
            <Area
              type="natural"
              dataKey="waterFront"
              stroke={waterColors.strokeFront}
              strokeWidth={2.5}
              fill="url(#realWaterGrad)"
              name="Superficie de Agua"
              isAnimationActive={true}
              animationDuration={900}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Pie de gráfica con leyenda de fluido */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block" />
          <span>Volumen dinámico en el reservorio</span>
        </span>
        <span className="text-slate-500">Muestreo ultrasónico: 2 Hz</span>
      </div>
    </div>
  );
};
