import React from 'react';
import { ShieldCheck, AlertTriangle, XCircle, Bell, Camera, ChevronRight } from 'lucide-react';
import type { DashboardSummary } from '../services/api';

interface CommunityViewProps {
  dashboard: DashboardSummary;
  onOpenReportModal: () => void;
  onSendWhatsApp: () => void;
  isSendingWhatsApp: boolean;
  onGoToMap: () => void;
  isDark: boolean;
}

export const CommunityView: React.FC<CommunityViewProps> = ({
  dashboard,
  onOpenReportModal,
  onSendWhatsApp,
  isSendingWhatsApp,
  onGoToMap,
  isDark,
}) => {
  const levelPct = Math.min(100, Math.max(0, dashboard.current_level_pct));
  const isRed = dashboard.status === 'ROJO';
  const isYellow = dashboard.status === 'AMARILLO';
  const isFault = dashboard.status === 'FALLO_SENSOR';

  // Configuración del semáforo ciudadano
  const statusConfig = isRed
    ? {
        label: 'Alerta Roja: Evacuación Inmediata',
        desc: 'El nivel del cauce superó el límite de seguridad. Familias en zonas bajas deben trasladarse a los puntos altos seguros.',
        bg: isDark ? 'bg-red-950/40 border-red-900/60 text-red-200' : 'bg-red-50 border-red-200 text-red-900',
        badge: isDark ? 'bg-red-600 text-white' : 'bg-red-600 text-white',
        barColor: 'bg-red-600',
        icon: <XCircle className="w-8 h-8 text-red-500" />,
      }
    : isYellow
    ? {
        label: 'Alerta Amarilla: Precaución',
        desc: 'El caudal está aumentando con rapidez. Evite cruzar el puente peatonal y asegure objetos en patios y accesos.',
        bg: isDark ? 'bg-amber-950/40 border-amber-900/60 text-amber-200' : 'bg-amber-50 border-amber-200 text-amber-900',
        badge: isDark ? 'bg-amber-600 text-white' : 'bg-amber-600 text-white',
        barColor: 'bg-amber-500',
        icon: <AlertTriangle className="w-8 h-8 text-amber-500" />,
      }
    : isFault
    ? {
        label: 'Sensor en Revisión Técnica',
        desc: 'El equipo de sensado no reporta señal. Los vigías comunitarios realizan inspección visual en el sitio.',
        bg: isDark ? 'bg-slate-800/60 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-300 text-slate-800',
        badge: isDark ? 'bg-slate-700 text-slate-200' : 'bg-slate-300 text-slate-700',
        barColor: 'bg-slate-500',
        icon: <AlertTriangle className="w-8 h-8 text-slate-400" />,
      }
    : {
        label: 'Nivel Normal: Sin Riesgo',
        desc: 'El flujo de agua se mantiene dentro de los márgenes seguros sobre la Pista Sabana Grande.',
        bg: isDark ? 'bg-blue-950/30 border-blue-900/40 text-blue-100' : 'bg-blue-50/70 border-blue-200 text-blue-950',
        badge: isDark ? 'bg-blue-700 text-white' : 'bg-blue-600 text-white',
        barColor: 'bg-blue-600',
        icon: <ShieldCheck className="w-8 h-8 text-blue-500" />,
      };

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-2">
      {/* 1. Tarjeta principal de Estado Comunitario */}
      <section
        className={`rounded-2xl border p-6 md:p-8 transition-all shadow-sm ${statusConfig.bg}`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-white/10 shrink-0">
              {statusConfig.icon}
            </div>
            <div>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusConfig.badge}`}>
                Estado Barrial
              </span>
              <h2 className="text-xl md:text-2xl font-bold mt-1.5">{statusConfig.label}</h2>
            </div>
          </div>

          <button
            onClick={onSendWhatsApp}
            disabled={isSendingWhatsApp}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs flex items-center justify-center gap-2 transition-colors shadow-sm shrink-0"
          >
            <Bell className="w-4 h-4" />
            <span>{isSendingWhatsApp ? 'Enviando...' : 'Avisar a Vecinos por WhatsApp'}</span>
          </button>
        </div>

        <p className="mt-4 text-sm leading-relaxed opacity-90 max-w-2xl">
          {statusConfig.desc}
        </p>

        {/* Indicador de Altura del Agua */}
        <div className="mt-6 pt-6 border-t border-current/10">
          <div className="flex justify-between items-baseline text-xs mb-2 font-medium">
            <span>Nivel actual del cauce</span>
            <span className="font-semibold text-sm">{levelPct.toFixed(0)}% de capacidad</span>
          </div>
          <div className="w-full h-3 rounded-full bg-black/10 overflow-hidden">
            <div
              className={`h-full transition-all duration-700 rounded-full ${statusConfig.barColor}`}
              style={{ width: `${levelPct}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] opacity-70 mt-1.5">
            <span>0 cm (Vacío)</span>
            <span>Altura medida: {dashboard.current_level_cm} cm</span>
            <span>300 cm (Límite desborde)</span>
          </div>
        </div>
      </section>

      {/* 2. Acciones del Vecino */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Reportar con Foto */}
        <div
          className={`p-6 rounded-2xl border transition-all ${
            isDark
              ? 'bg-[#0f172a] border-slate-800 hover:border-slate-700 text-slate-100'
              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-900'
          } shadow-sm flex flex-col justify-between`}
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
              <Camera className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base">Reportar Basura u Obstrucción</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              ¿Ves desechos o sedimentos que impiden el paso del agua? Toma una fotografía para que la cuadrilla municipal atienda el punto crítico.
            </p>
          </div>
          <button
            onClick={onOpenReportModal}
            className="mt-5 w-full py-2.5 px-4 rounded-xl border border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>Subir Fotografía del Drenaje</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Ver Mapa Satelital */}
        <div
          className={`p-6 rounded-2xl border transition-all ${
            isDark
              ? 'bg-[#0f172a] border-slate-800 hover:border-slate-700 text-slate-100'
              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-900'
          } shadow-sm flex flex-col justify-between`}
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base">Zonas Seguras y Cartografía</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Consulta la vista satelital oficial del Cauce La Maravilla y la ubicación de las franjas de bio-retención que protegen el sector.
            </p>
          </div>
          <button
            onClick={onGoToMap}
            className="mt-5 w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>Abrir Mapa de Sabana Grande</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* 3. Información Clara de Contacto Comunitario */}
      <footer className="text-center pt-4">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Cauce La Maravilla • Pista Sabana Grande, Distrito VI, Managua
        </p>
      </footer>
    </div>
  );
};
