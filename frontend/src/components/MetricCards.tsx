import React from 'react';
import {
  Gauge,
  Ruler,
  TrendingUp,
  Zap,
  AlertTriangle,
  Database,
  Sparkles,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import type { DashboardSummary } from '../services/api';

interface MetricCardsProps {
  dashboard: DashboardSummary;
  currentScenario: string;
  onSendWhatsApp: () => void;
  isSendingWhatsApp: boolean;
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  dashboard,
  currentScenario,
  onSendWhatsApp,
  isSendingWhatsApp,
}) => {
  const levelPct = Math.min(100, Math.max(0, dashboard.current_level_pct));
  const isOverflowImminent = levelPct >= 85;
  const isWarning = levelPct >= 60 && levelPct < 85;

  const getStatusBadge = () => {
    if (isOverflowImminent) {
      return (
        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#2F1216] border border-[#571F25] text-[#F87171] text-[11px] font-semibold">
          <AlertTriangle className="w-3 h-3 text-[#F87171]" />
          Desborde Inminente
        </span>
      );
    }
    if (isWarning) {
      return (
        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#2F2210] border border-[#5E431A] text-[#FBBF24] text-[11px] font-semibold">
          <AlertTriangle className="w-3 h-3 text-[#FBBF24]" />
          Alerta Preventiva
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#0F291E] border border-[#1B5E40] text-[#34D399] text-[11px] font-semibold">
        <CheckCircle2 className="w-3 h-3 text-[#34D399]" />
        Nivel Seguro
      </span>
    );
  };

  const formattedRate = dashboard.rise_rate_pct_30m >= 0
    ? `+${dashboard.rise_rate_pct_30m.toFixed(1)}%`
    : `${dashboard.rise_rate_pct_30m.toFixed(1)}%`;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* CARD 1: NIVEL ACTUAL (%) */}
      <div className="bg-[#0D1424] border border-[#1E2A44] rounded-2xl p-5 shadow-xl flex flex-col justify-between hover:border-[#2A3B5E] transition-all">
        <div>
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold tracking-wider font-mono uppercase">
              Nivel Actual (%)
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#141E34] border border-[#1E2E4E] flex items-center justify-center text-cyan-400">
              <Gauge className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl md:text-4xl font-extrabold text-white font-mono tracking-tight">
              {levelPct.toFixed(0)}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-[#162238] h-2 rounded-full overflow-hidden my-3 relative">
            {/* Threshold marker at 85% */}
            <div
              className="absolute top-0 bottom-0 w-[2px] bg-rose-500/80 z-10"
              style={{ left: '85%' }}
              title="Umbral de Evacuación (85%)"
            />
            {/* Threshold marker at 60% */}
            <div
              className="absolute top-0 bottom-0 w-[2px] bg-amber-500/80 z-10"
              style={{ left: '60%' }}
              title="Umbral de Alerta (60%)"
            />
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${
                isOverflowImminent
                  ? 'bg-gradient-to-r from-cyan-500 via-amber-500 to-rose-500 shadow-[0_0_12px_rgba(239,68,68,0.5)]'
                  : isWarning
                  ? 'bg-gradient-to-r from-cyan-500 to-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.4)]'
                  : 'bg-gradient-to-r from-teal-400 to-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.4)]'
              }`}
              style={{ width: `${levelPct}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-slate-400 font-medium">Umbral: 85%</span>
          {getStatusBadge()}
        </div>
      </div>

      {/* CARD 2: ALTURA DE AGUA */}
      <div className="bg-[#0D1424] border border-[#1E2A44] rounded-2xl p-5 shadow-xl flex flex-col justify-between hover:border-[#2A3B5E] transition-all">
        <div>
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold tracking-wider font-mono uppercase">
              Altura de Agua
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#141E34] border border-[#1E2E4E] flex items-center justify-center text-cyan-400">
              <Ruler className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3 flex items-baseline gap-1.5 font-mono">
            <span className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              {dashboard.current_level_cm.toFixed(0)} <span className="text-xl font-medium text-slate-300">cm</span>
            </span>
            <span className="text-sm font-normal text-slate-400">
              / {dashboard.max_capacity_cm.toFixed(0)} cm
            </span>
          </div>

          {/* Volume Fill Bar */}
          <div className="w-full bg-[#162238] h-2 rounded-full overflow-hidden my-3">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${Math.min(
                  100,
                  (dashboard.current_level_cm / dashboard.max_capacity_cm) * 100
                )}%`,
              }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Database className="w-3.5 h-3.5 text-slate-400" />
            <span>Capacidad: 15,000 m³</span>
          </div>
          <span className="px-2 py-0.5 rounded bg-[#162238] text-slate-300 text-[10px] font-mono font-semibold uppercase">
            {levelPct >= 99 ? 'Max' : `${levelPct.toFixed(0)}%`}
          </span>
        </div>
      </div>

      {/* CARD 3: TASA DE SUBIDA (30M) */}
      <div className="bg-[#0D1424] border border-[#1E2A44] rounded-2xl p-5 shadow-xl flex flex-col justify-between hover:border-[#2A3B5E] transition-all">
        <div>
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold tracking-wider font-mono uppercase">
              Tasa de Subida (30m)
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#141E34] border border-[#1E2E4E] flex items-center justify-center text-amber-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3 flex items-baseline gap-1.5 font-mono">
            <span className="text-3xl md:text-4xl font-extrabold text-[#FACC15] tracking-tight">
              {formattedRate}
            </span>
            <span className="text-sm font-normal text-slate-400">/ 30min</span>
          </div>

          {/* Indicator bar */}
          <div className="w-full bg-[#162238] h-2 rounded-full overflow-hidden my-3">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                dashboard.rise_rate_pct_30m > 30
                  ? 'bg-amber-400'
                  : dashboard.rise_rate_pct_30m > 10
                  ? 'bg-yellow-400'
                  : 'bg-emerald-400'
              }`}
              style={{
                width: `${Math.min(100, Math.max(5, Math.abs(dashboard.rise_rate_pct_30m)))}%`,
              }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5 text-xs text-[#38BDF8]">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-medium">Anticipación Inteligente</span>
          </div>
          <span className="px-2 py-0.5 rounded bg-[#251F47] border border-[#483478] text-[#C084FC] text-[10px] font-bold font-mono tracking-wide">
            Predicción IA
          </span>
        </div>
      </div>

      {/* CARD 4: SIMULADOR EN VIVO */}
      <div className="bg-[#0D1424] border border-[#1E2A44] rounded-2xl p-5 shadow-xl flex flex-col justify-between hover:border-[#2A3B5E] transition-all">
        <div>
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold tracking-wider font-mono uppercase">
              Simulador en Vivo
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#1F1738] border border-[#3A265E] flex items-center justify-center text-purple-400">
              <Zap className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3">
            <span className="text-[11px] text-slate-400 font-medium block mb-1">
              Modo de Operación:
            </span>
            <div className="bg-[#17122C] border border-[#35255C] text-[#E9D5FF] px-3 py-1.5 rounded-xl font-mono text-xs font-bold flex items-center justify-between">
              <span className="truncate">{currentScenario}</span>
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse shrink-0 ml-2"></span>
            </div>
          </div>
        </div>

        {/* Big WhatsApp Action Button */}
        <div className="mt-3 pt-1">
          <button
            onClick={onSendWhatsApp}
            disabled={isSendingWhatsApp}
            className="w-full bg-[#10B981] hover:bg-[#059669] text-black font-extrabold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 transition-all active:scale-[0.98] disabled:opacity-60 cursor-pointer"
          >
            <MessageSquare className={`w-4 h-4 fill-current ${isSendingWhatsApp ? 'animate-bounce' : ''}`} />
            <span>
              {isSendingWhatsApp ? 'Despachando...' : 'Probar Alerta WhatsApp'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
