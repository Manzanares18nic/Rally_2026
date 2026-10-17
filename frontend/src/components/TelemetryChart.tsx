import React, { useState, useEffect } from 'react';
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
import { Droplets, Waves, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';
import type { TelemetryPoint, DashboardSummary } from '../services/api';

interface TelemetryChartProps {
  telemetry: TelemetryPoint[];
  dashboard: DashboardSummary;
  isDark: boolean;
}

export const TelemetryChart: React.FC<TelemetryChartProps> = ({ telemetry, dashboard, isDark }) => {
  // Ondulación hidrodinámica continua en tiempo real (efecto de fluido activo)
  const [wavePhase, setWavePhase] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setWavePhase((prev) => (prev + 0.3) % (Math.PI * 4));
    }, 75);
    return () => clearInterval(timer);
  }, []);

  // Enriquecer los puntos con ondulación dinámica rápida para que el agua se mueva visiblemente
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

    // Variación de onda superficial activa fluida
    const basePct = Math.max(0, Math.min(100, point.water_level_pct));
    const rippleFront = Math.sin(index * 0.7 + wavePhase) * 1.6;
    const rippleBack = Math.cos(index * 0.7 + 1.3 + wavePhase * 1.1) * 2.0;

    const waterFront = Math.max(0, Math.min(100, Math.round((basePct + rippleFront) * 10) / 10));
    const waterBack = Math.max(0, Math.min(100, Math.round((basePct + rippleBack - 0.3) * 10) / 10));

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

        <div className="flex items-center gap-3">
          {/* Badge de dinámica de flujo en tiempo real */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border transition-colors shadow-2xs"
            style={{
              backgroundColor:
                dashboard.rise_rate_pct_30m > 4
                  ? 'rgba(216, 27, 96, 0.12)'
                  : dashboard.rise_rate_pct_30m < -4
                  ? 'rgba(112, 193, 103, 0.15)'
                  : 'rgba(0, 168, 232, 0.12)',
              color:
                dashboard.rise_rate_pct_30m > 4
                  ? '#D81B60'
                  : dashboard.rise_rate_pct_30m < -4
                  ? '#70C167'
                  : '#00A8E8',
              borderColor:
                dashboard.rise_rate_pct_30m > 4
                  ? 'rgba(216, 27, 96, 0.3)'
                  : dashboard.rise_rate_pct_30m < -4
                  ? 'rgba(112, 193, 103, 0.3)'
                  : 'rgba(0, 168, 232, 0.3)',
            }}
          >
            {dashboard.rise_rate_pct_30m > 4 ? (
              <>
                <ArrowUpRight className="w-3.5 h-3.5 animate-bounce" />
                <span>Crecida Rápida (+{dashboard.rise_rate_pct_30m}%)</span>
              </>
            ) : dashboard.rise_rate_pct_30m < -4 ? (
              <>
                <ArrowDownRight className="w-3.5 h-3.5 animate-bounce" />
                <span>Drenando e Infiltrando ({dashboard.rise_rate_pct_30m}%)</span>
              </>
            ) : (
              <>
                <Activity className="w-3.5 h-3.5 text-[#00A8E8]" />
                <span>Nivel Estable</span>
              </>
            )}
          </div>

          <div className="text-right">
            <div className="flex items-baseline justify-end gap-1.5">
              <span className="text-xl font-extrabold text-[#00A8E8]">
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
      </div>

      {/* Gráfica con acabado de agua líquida + Columna hidráulica lateral */}
      <div className="flex gap-3 items-stretch">
        <div className="h-64 flex-1">
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
                stroke="#D81B60"
                strokeDasharray="4 4"
                strokeOpacity={0.75}
                label={{
                  value: 'Cota Crítica (80%)',
                  position: 'insideTopRight',
                  fill: '#D81B60',
                  fontSize: 10,
                  fontWeight: 'bold',
                }}
              />
              <ReferenceLine
                y={50}
                stroke="#00A8E8"
                strokeDasharray="4 4"
                strokeOpacity={0.5}
                label={{
                  value: 'Alerta Preventiva (50%)',
                  position: 'insideTopRight',
                  fill: '#00A8E8',
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
                        <div className="flex items-center gap-1.5 font-bold text-[#00A8E8]">
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

              {/* Capa de onda trasera (sensación de profundidad de agua) con animación rápida y fluida */}
              <Area
                type="natural"
                dataKey="waterBack"
                stroke={waterColors.strokeBack}
                strokeWidth={1.5}
                strokeDasharray="4 2"
                fill="url(#backWaveGrad)"
                name="Onda Secundaria"
                isAnimationActive={true}
                animationDuration={280}
              />

              {/* Capa de agua principal (fluido con cresta brillante) con animación rápida y fluida */}
              <Area
                type="natural"
                dataKey="waterFront"
                stroke={waterColors.strokeFront}
                strokeWidth={2.5}
                fill="url(#realWaterGrad)"
                name="Superficie de Agua"
                isAnimationActive={true}
                animationDuration={300}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Columna Manométrica Hidráulica (Tirante de agua en vivo que sube y baja) */}
        <div className="w-16 sm:w-20 rounded-2xl border border-sky-400/30 bg-sky-950/20 dark:bg-slate-900/60 p-2 flex flex-col justify-between items-center relative overflow-hidden shadow-inner shrink-0">
          <div className="text-[9px] font-bold text-sky-400 uppercase tracking-wider text-center">
            Nivel
          </div>

          {/* Tubo de nivel de agua */}
          <div className="relative w-7 sm:w-8 h-40 bg-slate-800/40 dark:bg-slate-950/80 rounded-xl border border-sky-500/30 overflow-hidden flex flex-col justify-end">
            {/* Graduaciones de nivel */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none p-0.5 opacity-40">
              <span className="w-full border-t border-red-400 text-[7px] text-red-400 pl-0.5">80%</span>
              <span className="w-full border-t border-amber-400 text-[7px] text-amber-400 pl-0.5">50%</span>
              <span className="w-full border-t border-slate-400 text-[7px] text-slate-400 pl-0.5">20%</span>
            </div>

            {/* Agua líquida que sube y baja con transición fluida */}
            <div
              className="w-full transition-all duration-700 ease-out relative"
              style={{
                height: `${Math.min(100, Math.max(8, dashboard.current_level_pct))}%`,
                background: 'linear-gradient(180deg, #38bdf8 0%, #0284c7 35%, #0369a1 100%)',
              }}
            >
              {/* Cresta de onda activa */}
              <div
                className="absolute -top-1.5 left-0 right-0 h-2 bg-sky-200/80 rounded-full animate-pulse"
                style={{ transform: `scaleY(${1 + Math.sin(wavePhase) * 0.3})` }}
              />
            </div>
          </div>

          <div className="text-[11px] font-extrabold text-[#00A8E8] text-center">
            {dashboard.current_level_pct.toFixed(0)}%
          </div>
        </div>
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
