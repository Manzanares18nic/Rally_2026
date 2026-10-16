import React from 'react';
import { MapPin, Sun, Moon, LogIn, LogOut, RefreshCw } from 'lucide-react';
import type { DashboardSummary } from '../services/api';

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
        {/* Identidad del Sistema y Localidad */}
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-blue-600 dark:text-blue-400">
            Reservorio Vivo
          </h1>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500 dark:text-slate-400">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-blue-500" />
            <span>Cauce La Maravilla • Pista Sabana Grande, Managua</span>
          </div>
        </div>

        {/* Controles: Refresco, Modo Oscuro y Botón de Inicio de Sesión Admin */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Indicador de conexión discreto */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mr-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isBackendLive ? 'bg-blue-500' : 'bg-slate-400'
              }`}
            />
            <span className="text-[11px]">
              {isBackendLive ? 'Conectado' : 'Modo local'}
            </span>
          </div>

          {/* Actualizar datos */}
          <button
            onClick={onRefresh}
            title="Actualizar datos"
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-300 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-500' : ''}`} />
          </button>

          {/* Selector de Tema (Modo Claro / Oscuro) */}
          <button
            onClick={onToggleTheme}
            title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-300 transition-colors"
          >
            {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-600" />}
          </button>

          {/* Botón explícito: Iniciar sesión como administrador / Cerrar sesión */}
          {isAdminLoggedIn ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                {adminName || 'Administrador'}
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
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Iniciar sesión como administrador</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
