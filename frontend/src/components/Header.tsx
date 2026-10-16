import React from 'react';
import { MapPin, Waves, Settings2, RefreshCw } from 'lucide-react';
import type { DashboardSummary } from '../services/api';

interface HeaderProps {
  dashboard: DashboardSummary;
  isBackendLive: boolean;
  onOpenSettings: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  dashboard,
  isBackendLive,
  onOpenSettings,
  onRefresh,
  isRefreshing,
}) => {
  const isOnline = dashboard.sensor_status === 'ONLINE';

  const getAlertBadge = () => {
    switch (dashboard.status) {
      case 'ROJO':
        return {
          bg: 'bg-[#311116] border-[#6b1e28] text-[#f87171]',
          dot: 'bg-[#ef4444] animate-ping-slow',
          label: 'ALERTA ROJA',
        };
      case 'AMARILLO':
        return {
          bg: 'bg-[#33220d] border-[#66461a] text-[#fbbf24]',
          dot: 'bg-[#f59e0b] animate-ping-slow',
          label: 'ALERTA PREVENTIVA',
        };
      case 'FALLO_SENSOR':
        return {
          bg: 'bg-[#291738] border-[#552778] text-[#c084fc]',
          dot: 'bg-[#a855f7]',
          label: 'FALLA SENSOR',
        };
      case 'VERDE':
      default:
        return {
          bg: 'bg-[#0b261d] border-[#15543c] text-[#34d399]',
          dot: 'bg-[#10b981]',
          label: 'ESTADO SEGURO',
        };
    }
  };

  const alertBadge = getAlertBadge();

  return (
    <header className="relative w-full bg-[#0D1424] border border-[#1E2A44] rounded-2xl p-4 md:p-5 shadow-2xl backdrop-blur-md">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: App Identity & Location */}
        <div className="flex items-start md:items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0284c7]/20 via-[#06b6d4]/20 to-[#0e7490]/10 border border-[#0ea5e9]/40 flex items-center justify-center text-[#38bdf8] shadow-inner shadow-cyan-500/20 shrink-0">
            <Waves className="w-6 h-6 animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white font-sans">
                Reservorio Vivo
              </h1>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-[#10243d] border border-[#1e3a63] text-[#38bdf8] tracking-wider uppercase">
                MVP 24h
              </span>
            </div>

            <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="truncate">
                {dashboard.reservoir_name} (Lat: {dashboard.location.lat}, Lng: {dashboard.location.lng})
              </span>
            </div>
          </div>
        </div>

        {/* Right: Badges & Diagnostics */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Refresh button */}
          <button
            onClick={onRefresh}
            title="Actualizar datos ahora"
            className="p-2 rounded-xl bg-[#141E34] border border-[#1E2E4E] hover:bg-[#1C2B4C] text-slate-400 hover:text-white transition-all active:scale-95"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
          </button>

          {/* Settings / API URL modal trigger */}
          <button
            onClick={onOpenSettings}
            title="Configurar Backend URL"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-mono transition-all ${
              isBackendLive
                ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300 hover:bg-emerald-900/40'
                : 'bg-amber-950/40 border-amber-800/60 text-amber-300 hover:bg-amber-900/40'
            }`}
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {isBackendLive ? 'API Conectada' : 'Simulador Fallback'}
            </span>
          </button>

          {/* Sensor Status Pill */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono font-medium tracking-wide ${
              isOnline
                ? 'bg-[#092520] border-[#0D4F3E] text-[#10B981]'
                : 'bg-[#31131A] border-[#5C1D28] text-[#F43F5E]'
            }`}
          >
            <span className="relative flex h-2 w-2">
              {isOnline && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              )}
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isOnline ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
              ></span>
            </span>
            <span>Sensor IoT {dashboard.sensor_status}</span>
          </div>

          {/* Alert Level Pill */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold tracking-wider uppercase ${alertBadge.bg}`}
          >
            <span className="relative flex h-2 w-2">
              <span className={`relative inline-flex rounded-full h-2 w-2 ${alertBadge.dot}`}></span>
            </span>
            <span>{alertBadge.label}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
