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
import { Droplets, Waves, Sun } from 'lucide-react';
import type { TelemetryPoint, DashboardSummary } from '../services/api';
import type { ScenarioType } from './JurorSimulator';

interface TelemetryChartProps {
  telemetry: TelemetryPoint[];
  dashboard: DashboardSummary;
  isDark: boolean;
  currentScenario?: ScenarioType;
}

export const TelemetryChart: React.FC<TelemetryChartProps> = ({
  telemetry,
  dashboard,
  isDark,
  currentScenario,
}) => {
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

  // Solo llueve si el escenario activo es de lluvia, o si no hay escenario y el sensor reporta lluvia
  const isRaining =
    currentScenario === 'CRECIDA_SUBITA' ||
    currentScenario === 'LLUVIA_MODERADA' ||
    (!currentScenario &&
      (dashboard.status === 'AMARILLO' || dashboard.status === 'ROJO') &&
      (dashboard.rain_mm ?? 0) > 0);

  // Nivel de agua y altura del espacio aéreo por donde caen las gotas
  const waterPct = Math.max(0, Math.min(100, dashboard.current_level_pct));
  // Las gotas caen desde el cielo hasta la superficie del agua:
  // Si el agua está al 15%, caen por el 85% del reservorio hasta casi la base.
  // Conforme el agua sube (ej. 80%), el espacio aéreo se reduce a 20% y las gotas tocan el agua que subió.
  const airHeightPct = Math.max(6, Math.min(94, 100 - waterPct));

  return (
    <div
      className={`rounded-2xl border p-5 transition-all shadow-xs ${
        isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
      }`}
    >
      {/* Encabezado comprensible y humano */}
      <div className="flex justify-between items-center pb-4 mb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#00A8E8]/10 text-[#00A8E8]">
            <Waves className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>Nivel de Agua en Vivo</span>
              <span className="text-[10px] font-semibold text-[#00A8E8] bg-[#00A8E8]/15 px-2 py-0.5 rounded-full border border-[#00A8E8]/30 flex items-center gap-1">
                <Droplets className="w-2.5 h-2.5" />
                <span>Medición en Tiempo Real</span>
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Altura y movimiento del agua en el Cauce La Maravilla
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className="flex items-baseline justify-end gap-1.5">
            <span className="text-lg font-extrabold text-[#00A8E8]">
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

      {/* Gráfica del reservorio con lluvia cayendo directamente sobre la superficie del agua */}
      <div className="relative h-64 w-full">
        {/* Capa de lluvia dinámica: solo si hay lluvia activa */}
        {isRaining && (
          <div
            className="absolute top-0 left-10 right-4 overflow-hidden pointer-events-none z-10 transition-all duration-500 ease-out"
            style={{ height: `${airHeightPct}%` }}
          >
            {/* Gotas de lluvia cayendo desde el cielo hasta la superficie del agua */}
            <div className="relative w-full h-full">
              {[
                { left: '6%', delay: '0.05s', dur: '0.75s', width: '2px', height: '14px' },
                { left: '14%', delay: '0.35s', dur: '0.85s', width: '2px', height: '18px' },
                { left: '22%', delay: '0.15s', dur: '0.70s', width: '2.5px', height: '16px' },
                { left: '31%', delay: '0.55s', dur: '0.90s', width: '2px', height: '14px' },
                { left: '39%', delay: '0.22s', dur: '0.78s', width: '2px', height: '16px' },
                { left: '48%', delay: '0.45s', dur: '0.82s', width: '2.5px', height: '20px' },
                { left: '56%', delay: '0.10s', dur: '0.72s', width: '2px', height: '15px' },
                { left: '65%', delay: '0.62s', dur: '0.88s', width: '2px', height: '17px' },
                { left: '74%', delay: '0.28s', dur: '0.76s', width: '2.5px', height: '18px' },
                { left: '83%', delay: '0.48s', dur: '0.84s', width: '2px', height: '14px' },
                { left: '92%', delay: '0.18s', dur: '0.74s', width: '2px', height: '16px' },
              ].map((drop, i) => (
                <div
                  key={i}
                  className="absolute animate-raindrop-to-water rounded-full bg-gradient-to-b from-[#38bdf8]/40 to-[#00A8E8]"
                  style={{
                    left: drop.left,
                    width: drop.width,
                    height: drop.height,
                    animationDelay: drop.delay,
                    animationDuration: drop.dur,
                  }}
                />
              ))}

              {/* Ondas de choque en la línea exacta donde las gotas tocan el agua */}
              <div className="absolute bottom-0 left-0 right-0 h-2 flex justify-around items-center">
                {[8, 22, 38, 52, 68, 82, 94].map((pos, idx) => (
                  <span
                    key={idx}
                    className="w-3 h-1 rounded-full border border-[#38bdf8]/70 animate-surface-ripple"
                    style={{
                      animationDelay: `${(idx * 0.17) % 0.8}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Indicador superior de clima en vivo */}
        <div className="absolute top-2 right-4 z-10 pointer-events-none">
          {isRaining ? (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#00A8E8]/20 border border-[#00A8E8]/40 text-[#00A8E8] backdrop-blur-xs flex items-center gap-1.5 shadow-xs">
              <Droplets className="w-3 h-3 animate-bounce" />
              <span>
                {currentScenario === 'CRECIDA_SUBITA' ? 'Lluvia Fuerte en Microcuenca' : 'Lluvia Moderada Activa'}
              </span>
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-[#70C167]/15 border border-[#70C167]/30 text-[#70C167] backdrop-blur-xs flex items-center gap-1.5">
              <Sun className="w-3 h-3 text-[#70C167]" />
              <span>Día Soleado y Despejado</span>
            </span>
          )}
        </div>

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

            {/* Líneas de cota con lenguaje claro */}
            <ReferenceLine
              y={80}
              stroke="#D81B60"
              strokeDasharray="4 4"
              strokeOpacity={0.75}
              label={{
                value: 'Alerta de Desborde (80%)',
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
                value: 'Precaución por Lluvia (50%)',
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
                        Nivel de agua: <strong>{data.originalPct}%</strong> ({data.water_level_cm} cm)
                      </p>
                      {data.rain_mm !== undefined && (
                        <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                          Lluvia registrada: {data.rain_mm} mm
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
              animationDuration={280}
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
              animationDuration={300}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Pie de gráfica comprensible para cualquier persona */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#00A8E8] inline-block" />
          <span>Agua acumulada en el reservorio</span>
        </span>
        <span className="text-slate-500">Medición continua sin tocar el agua</span>
      </div>
    </div>
  );
};
