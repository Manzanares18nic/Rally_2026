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
import { Activity, Radio, Cpu, BatteryCharging, Clock, Wifi } from 'lucide-react';
import type { TelemetryPoint, DashboardSummary } from '../services/api';

interface TelemetryChartProps {
  telemetry: TelemetryPoint[];
  dashboard: DashboardSummary;
}

export const TelemetryChart: React.FC<TelemetryChartProps> = ({ telemetry, dashboard }) => {
  // Format timestamps nicely for X axis
  const formattedData = telemetry.map((point) => {
    let timeLabel = '';
    try {
      const d = new Date(point.timestamp);
      timeLabel = d.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
    } catch {
      timeLabel = point.timestamp.slice(11, 19);
    }

    return {
      ...point,
      timeLabel,
    };
  });

  const lastTransTime = React.useMemo(() => {
    try {
      return new Date(dashboard.last_updated).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
    } catch {
      return '03:01:35 PM';
    }
  }, [dashboard.last_updated]);

  return (
    <div className="bg-[#0D1424] border border-[#1E2A44] rounded-2xl p-5 shadow-2xl flex flex-col justify-between hover:border-[#2A3B5E] transition-all">
      {/* Header & Subtitle */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1A253D]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-950/60 border border-cyan-800/40 flex items-center justify-center text-cyan-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                Nivel de Agua en Tiempo Real
              </h2>
              <p className="text-xs text-slate-400">
                Telemetría hidrométrica ultrasónica & boyas piezométricas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#112338] border border-[#1E3D60] text-cyan-300 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              Actualizando cada 2s
            </span>
          </div>
        </div>

        {/* Thresholds Legend Bar */}
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 py-3 text-xs font-mono border-b border-[#162035]">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>0% - 60%: Seguro</span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span>61% - 84%: Alerta Preventiva</span>
          </div>
          <div className="flex items-center gap-1.5 text-rose-400">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            <span>85% - 100%: Evacuación</span>
          </div>
        </div>

        {/* Recharts Area Chart */}
        <div className="w-full h-[280px] sm:h-[320px] pt-4 -ml-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={formattedData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="waterLevelGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.45} />
                  <stop offset="60%" stopColor="#0284C7" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#0B132B" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#16223B" vertical={false} />

              <XAxis
                dataKey="timeLabel"
                stroke="#475569"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#1E2A44' }}
                interval="preserveStartEnd"
                minTickGap={45}
              />

              <YAxis
                stroke="#475569"
                fontSize={11}
                domain={[0, 100]}
                ticks={[0, 20, 40, 60, 80, 100]}
                tickFormatter={(val) => `${val}%`}
                tickLine={false}
                axisLine={{ stroke: '#1E2A44' }}
              />

              {/* Threshold Lines */}
              <ReferenceLine
                y={85}
                stroke="#EF4444"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: 'Evacuación (85%)',
                  fill: '#EF4444',
                  fontSize: 10,
                  position: 'right',
                }}
              />

              <ReferenceLine
                y={60}
                stroke="#F59E0B"
                strokeDasharray="3 3"
                strokeWidth={1}
                label={{
                  value: 'Alerta (60%)',
                  fill: '#F59E0B',
                  fontSize: 10,
                  position: 'right',
                }}
              />

              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as TelemetryPoint & { timeLabel: string };
                    return (
                      <div className="bg-[#09101F]/95 backdrop-blur-md border border-[#233554] p-3 rounded-xl shadow-2xl text-xs font-mono space-y-1.5 min-w-[170px]">
                        <div className="text-slate-400 flex items-center justify-between pb-1 border-b border-[#1A263D]">
                          <span>{data.timeLabel}</span>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] ${
                              data.water_level_pct >= 85
                                ? 'bg-rose-950 text-rose-300'
                                : data.water_level_pct >= 60
                                ? 'bg-amber-950 text-amber-300'
                                : 'bg-emerald-950 text-emerald-300'
                            }`}
                          >
                            {data.water_level_pct >= 85
                              ? 'ROJO'
                              : data.water_level_pct >= 60
                              ? 'AMARILLO'
                              : 'VERDE'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-300">Nivel Agua:</span>
                          <span className="text-cyan-400 font-bold text-sm">
                            {data.water_level_pct.toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Altura:</span>
                          <span className="text-slate-200">
                            {data.water_level_cm.toFixed(1)} cm
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Lluvia:</span>
                          <span className="text-blue-300">
                            {data.rain_mm.toFixed(1)} mm
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              <Area
                type="monotone"
                dataKey="water_level_pct"
                stroke="#00E5FF"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#waterLevelGradient)"
                dot={{
                  r: 3,
                  fill: '#00E5FF',
                  stroke: '#0D1424',
                  strokeWidth: 2,
                }}
                activeDot={{
                  r: 6,
                  fill: '#FFFFFF',
                  stroke: '#00E5FF',
                  strokeWidth: 3,
                }}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Telemetry Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 mt-3 border-t border-[#162035] text-xs font-mono">
        {/* Metric 1 */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-slate-400 tracking-wider font-semibold uppercase">
            Latencia Sensor
          </span>
          <div className="flex items-center gap-1.5 text-slate-200 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>120 ms</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-slate-400 tracking-wider font-semibold uppercase">
            Batería Nodo
          </span>
          <div className="flex items-center gap-1.5 text-slate-200 font-medium">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            <span>98.4% (Solar)</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-slate-400 tracking-wider font-semibold uppercase">
            Última Transmisión
          </span>
          <div className="flex items-center gap-1.5 text-slate-200 font-medium">
            <span className="w-2 h-2 rounded-full bg-slate-300"></span>
            <span>{lastTransTime}</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-slate-400 tracking-wider font-semibold uppercase">
            Protocolo
          </span>
          <div className="flex items-center gap-1.5 text-slate-200 font-medium">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            <span>LoRaWAN / MQTT</span>
          </div>
        </div>
      </div>
    </div>
  );
};
