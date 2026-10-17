import React from 'react';
import { MapPin, Sun, Moon, LogIn, LogOut, RefreshCw } from 'lucide-react';
import type { DashboardSummary } from '../services/api';
import { NotificationBell } from './NotificationBell';

interface HeaderProps {
  dashboard: DashboardSummary;
  isBackendLive: boolean;
  onRefresh: () => void;
  isRefreshing: boolean;
  isAdminLoggedIn: boolean;
  adminName: string | null;
  onOpenLogin: () => void;
  onLogout: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenPitch?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  dashboard,
  isBackendLive,
  onRefresh,
  isRefreshing,
  isAdminLoggedIn,
  adminName,
  onOpenLogin,
  onLogout,
  isDark,
  onToggleTheme,
}) => {
  return (
    <header
      className={`w-full rounded-2xl border p-4 md:p-5 transition-all shadow-xs ${
        isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
      }`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Identidad del Sistema, Logo y Localidad */}
        <div className="flex items-center gap-3.5">
          <img
            src="/images/logo.jpeg"
            alt="Logo PluviTec"
            className="w-14 h-14 md:w-16 md:h-16 rounded-2xl object-cover border-2 border-[#00A8E8]/40 shadow-md shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                <span className="text-[#00A8E8]">Pluvi</span>
                <span className="text-[#70C167]">Tec</span>
              </h1>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              <MapPin className="w-3.5 h-3.5 shrink-0 text-[#00A8E8]" />
              <span>Cauce La Maravilla • Pista Sabana Grande, Managua</span>
            </div>
          </div>
        </div>

        {/* Controles en la barra superior: Refresco, Tema, Admin y Notificaciones a la extrema derecha */}
        <div className="flex items-center gap-2.5 flex-wrap self-end md:self-auto">
          {/* Actualizar datos */}
          <button
            onClick={onRefresh}
            title="Actualizar datos"
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-300 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#00A8E8]' : ''}`} />
          </button>

          {/* Selector de Tema (Modo Claro / Oscuro) */}
          <button
            onClick={onToggleTheme}
            title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-300 transition-colors"
          >
            {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-600" />}
          </button>

          {/* Acceso para el equipo barrial / Cerrar sesión */}
          {isAdminLoggedIn ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#70C167] inline-block" />
                <span>{adminName ? adminName.replace(/^Ing\.\s*/i, '') : 'Coordinador Barrial'}</span>
              </span>
              <button
                onClick={onLogout}
                title="Cerrar sesión"
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-500 hover:text-red-600 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="px-3.5 py-2 rounded-xl bg-[#00A8E8] hover:bg-[#0090c8] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Acceso de Coordinador</span>
            </button>
          )}

          {/* Sistema de Notificaciones en la parte superior derecha */}
          <div className="pl-1 border-l border-slate-200 dark:border-slate-800">
            <NotificationBell isDark={isDark} />
          </div>
        </div>
      </div>
    </header>
  );
};
