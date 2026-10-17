import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  XCircle,
  Bell,
  Camera,
  ChevronRight,
  CheckSquare,
  Square,
  PhoneCall,
  MapPin,
  Leaf,
} from 'lucide-react';
import type { DashboardSummary } from '../services/api';
import { NewsCarousel } from './NewsCarousel';

interface CommunityViewProps {
  dashboard: DashboardSummary;
  onOpenReportModal: () => void;
  onSendWhatsApp: () => void;
  isSendingWhatsApp: boolean;
  onGoToMap: () => void;
  onGoToForum?: () => void;
  isDark: boolean;
}

export const CommunityView: React.FC<CommunityViewProps> = ({
  dashboard,
  onOpenReportModal,
  onSendWhatsApp,
  isSendingWhatsApp,
  onGoToMap,
  onGoToForum,
  isDark,
}) => {
  const levelPct = Math.min(100, Math.max(0, dashboard.current_level_pct));
  const isRed = dashboard.status === 'ROJO';
  const isYellow = dashboard.status === 'AMARILLO';
  const isFault = dashboard.status === 'FALLO_SENSOR';

  // Estado para el checklist interactivo de prevención familiar
  const [checklist, setChecklist] = useState<{ [key: string]: boolean }>({
    step1: false,
    step2: false,
    step3: false,
    step4: false,
  });

  const toggleChecklist = (key: string) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const completedSteps = Object.values(checklist).filter(Boolean).length;
  const progressPct = Math.round((completedSteps / 4) * 100);

  // Configuración amigable y clara del estado para cualquier vecino (cero tecnicismos)
  const isRaining = isYellow || isRed || dashboard.rise_rate_pct_30m > 3 || levelPct > 45;

  const statusConfig = isRed
    ? {
        label: 'Alerta de Crecida: Proteger a la Familia',
        desc: 'El agua del cauce ha subido rápidamente por la tormenta. Por favor mantente a salvo, acompaña a niños y adultos mayores hacia zonas altas y comparte este aviso con tus vecinos.',
        bg: isDark ? 'bg-gradient-to-br from-[#D81B60]/25 via-pink-950/20 to-slate-900 border-[#D81B60]/60 text-pink-100' : 'bg-gradient-to-br from-pink-50 via-rose-50 to-white border-[#D81B60]/40 text-pink-950',
        badge: 'bg-[#D81B60] text-white font-bold',
        barColor: 'bg-[#D81B60]',
        icon: <AlertTriangle className="w-8 h-8 text-[#D81B60]" />,
        peaceOfMindTip: '🚨 Qué hacer ahora: Salir de orillas bajas, resguardar documentos y acudir al punto seguro.',
      }
    : isYellow
    ? {
        label: 'Precaución: El agua está subiendo',
        desc: 'Está lloviendo en la cuenca y el agua está llenando el cauce. El reservorio está captando el agua para amortiguarla. Mantente atento y despeja basura de tu acera.',
        bg: isDark ? 'bg-gradient-to-br from-amber-950/40 via-yellow-950/20 to-slate-900 border-amber-600/50 text-amber-100' : 'bg-gradient-to-br from-amber-50 via-yellow-50 to-white border-amber-300 text-amber-950',
        badge: 'bg-amber-600 text-white font-bold',
        barColor: 'bg-amber-500',
        icon: <AlertTriangle className="w-8 h-8 text-amber-500" />,
        peaceOfMindTip: '⚠️ Recomendación: Evita cruzar puentes peatonales bajos mientras baje la corriente.',
      }
    : isFault
    ? {
        label: 'Revisión Técnica del Sensor',
        desc: 'Estamos ajustando la calibración del equipo de medición. Mientras tanto, los vigías barriales realizan recorridos físicos en el cauce.',
        bg: isDark ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-slate-100 border-slate-300 text-slate-800',
        badge: 'bg-slate-700 text-slate-100 font-bold',
        barColor: 'bg-slate-500',
        icon: <ShieldCheck className="w-8 h-8 text-slate-400" />,
        peaceOfMindTip: 'ℹ️ Estado: Monitoreo presencial activo por el comité barrial.',
      }
    : {
        label: 'Flujo Normal y Seguro',
        desc: 'El agua corre con tranquilidad y el reservorio tiene suficiente espacio de amortiguamiento. Tu calle y tu barrio se encuentran fuera de peligro.',
        bg: isDark ? 'bg-gradient-to-br from-[#70C167]/20 via-emerald-950/20 to-slate-900 border-[#70C167]/40 text-emerald-100' : 'bg-gradient-to-br from-emerald-50 via-green-50 to-white border-[#70C167]/40 text-emerald-950',
        badge: 'bg-[#70C167] text-white font-bold',
        barColor: 'bg-[#00A8E8]',
        icon: <ShieldCheck className="w-8 h-8 text-[#70C167]" />,
        peaceOfMindTip: '✅ Tranquilidad garantizada: Capacidad de drenaje óptima en el sector.',
      };

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-2">
      {/* 1. Tarjeta principal de Estado Comunitario y Tranquilidad */}
      <section
        className={`rounded-3xl border p-6 md:p-8 transition-all shadow-md ${statusConfig.bg}`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-white/40 dark:bg-black/20 shadow-xs shrink-0">
              {statusConfig.icon}
            </div>
            <div>
              <span className={`px-3 py-1 rounded-full text-xs tracking-wide shadow-2xs ${statusConfig.badge}`}>
                Estado Barrial
              </span>
              <h2 className="text-xl md:text-2xl font-extrabold mt-1.5">{statusConfig.label}</h2>
            </div>
          </div>

          <button
            onClick={onSendWhatsApp}
            disabled={isSendingWhatsApp}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#00A8E8] hover:bg-[#0090c8] text-white font-bold text-xs flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-sm shrink-0"
          >
            <Bell className="w-4 h-4" />
            <span>{isSendingWhatsApp ? 'Enviando...' : 'Avisar a Vecinos por WhatsApp'}</span>
          </button>
        </div>

        <p className="mt-4 text-sm leading-relaxed opacity-95 max-w-2xl font-medium">
          {statusConfig.desc}
        </p>

        {/* Consejo que brinda alivio y acción clara */}
        <div className="mt-3 py-2 px-3.5 rounded-xl bg-black/5 dark:bg-white/5 border border-current/10 text-xs font-medium inline-block">
          {statusConfig.peaceOfMindTip}
        </div>

        {/* Indicador Visual del Reservorio con Gotas de Lluvia Animadas */}
        <div className="mt-6 pt-5 border-t border-current/10">
          <div className="flex justify-between items-baseline text-xs mb-2 font-medium">
            <span className="flex items-center gap-1.5">
              <span>Nivel de Agua en el Reservorio</span>
              {isRaining && (
                <span className="text-[10px] font-bold text-[#00A8E8] bg-[#00A8E8]/15 px-2 py-0.5 rounded-full border border-[#00A8E8]/30 animate-pulse">
                  🌧️ Lluvia activa entrando
                </span>
              )}
            </span>
            <span className="font-extrabold text-sm">{levelPct.toFixed(0)}% ocupado</span>
          </div>

          {/* Visualizador de Gotas de Lluvia cayendo hacia el agua */}
          {isRaining && (
            <div className="relative h-7 w-full overflow-hidden flex justify-around items-start pointer-events-none mb-1 px-4">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                <div
                  key={i}
                  className="w-1.5 h-3 rounded-full bg-[#00A8E8] animate-raindrop opacity-80"
                  style={{
                    animationDelay: `${(i * 0.15) % 1.1}s`,
                    animationDuration: `${0.85 + (i % 3) * 0.18}s`,
                  }}
                />
              ))}
            </div>
          )}

          {/* Barra del reservorio con olas de agua */}
          <div className="w-full h-4 rounded-full bg-black/15 dark:bg-black/40 overflow-hidden p-0.5 relative">
            <div
              className={`h-full transition-all duration-700 rounded-full relative overflow-hidden ${statusConfig.barColor}`}
              style={{ width: `${Math.max(5, levelPct)}%` }}
            >
              {/* Olas sutiles en la superficie del agua */}
              <div className="absolute inset-0 bg-white/20 animate-reservoir-wave rounded-full" />
            </div>
          </div>

          <div className="flex justify-between text-[11px] opacity-75 mt-2 font-medium">
            <span>Fondo Seco (0 cm)</span>
            <span className="font-bold text-[#00A8E8]">Agua acumulada: {dashboard.current_level_cm.toFixed(1)} cm</span>
            <span>Límite Seguro (300 cm)</span>
          </div>
        </div>
      </section>

      {/* 2. Acciones Rápidas del Vecino (Reportar con Foto, Foro Comunitario y Ver Mapa) */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Reportar con Foto */}
        <div
          className={`p-5 rounded-2xl border transition-all ${
            isDark
              ? 'bg-[#0f172a] border-slate-800 text-slate-100'
              : 'bg-white border-slate-200 text-slate-900'
          } shadow-xs flex flex-col justify-between`}
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-[#00A8E8]/10 text-[#00A8E8] flex items-center justify-center mb-3">
              <Camera className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm">Reportar con Fotografía</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Toma una foto de sedimentos o basura bloqueando el cauce para notificar a la cuadrilla de limpieza.
            </p>
          </div>
          <button
            onClick={onOpenReportModal}
            className="mt-4 w-full py-2.5 px-3 rounded-xl border border-[#00A8E8] text-[#00A8E8] hover:bg-[#00A8E8]/10 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>Subir Fotografía</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Muro / Foro Comunitario */}
        <div
          className={`p-5 rounded-2xl border transition-all ${
            isDark
              ? 'bg-[#0f172a] border-slate-800 text-slate-100'
              : 'bg-white border-slate-200 text-slate-900'
          } shadow-xs flex flex-col justify-between`}
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-[#70C167]/15 text-[#70C167] flex items-center justify-center mb-3">
              <Leaf className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm">Foro e Infraestructura Verde</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Propón bio-jardines, zanjas de infiltración y comparte iniciativas vecinales con fotos y likes.
            </p>
          </div>
          <button
            onClick={onGoToForum}
            className="mt-4 w-full py-2.5 px-3 rounded-xl border border-[#70C167] text-[#70C167] hover:bg-[#70C167]/10 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>Ver Muro Barrial</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Ver Mapa Satelital */}
        <div
          className={`p-5 rounded-2xl border transition-all ${
            isDark
              ? 'bg-[#0f172a] border-slate-800 text-slate-100'
              : 'bg-white border-slate-200 text-slate-900'
          } shadow-xs flex flex-col justify-between`}
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-[#D81B60]/10 text-[#D81B60] flex items-center justify-center mb-3">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm">Mapa Satelital Multicuenca</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Radios de cobertura de los nodos, bio-retención y reportes vecinales geolocalizados.
            </p>
          </div>
          <button
            onClick={onGoToMap}
            className="mt-4 w-full py-2.5 px-3 rounded-xl bg-[#00A8E8] hover:bg-[#0090c8] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
          >
            <span>Explorar Mapa</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* 3. CARRUSEL SHORTS YOUTUBE (ESTILO carrusel.jpg CON REPRODUCTOR EN GRANDE Y DESENFOQUE) */}
      <NewsCarousel isDark={isDark} />

      {/* 4. PLAN FAMILIAR DE PREVENCIÓN ANTE LLUVIAS (CHECKLIST INTERACTIVO) */}
      <section
        className={`p-5 md:p-6 rounded-2xl border ${
          isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
        } shadow-xs space-y-4`}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-emerald-600" />
            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
              Plan Familiar ante Lluvias (Protocolo Barrial)
            </h4>
          </div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
            {progressPct}% completado
          </span>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Marca las acciones preventivas recomendadas para salvaguardar tu hogar y cooperar con el drenaje barrial:
        </p>

        {/* Barra de progreso */}
        <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-emerald-600 rounded-full transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* Lista interactiva */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs">
          <label
            onClick={() => toggleChecklist('step1')}
            className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-colors ${
              checklist.step1
                ? 'border-emerald-600/40 bg-emerald-50/40 dark:bg-emerald-950/20'
                : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
            }`}
          >
            {checklist.step1 ? (
              <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <Square className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            )}
            <span
              className={
                checklist.step1
                  ? 'line-through text-slate-400'
                  : 'text-slate-700 dark:text-slate-300 font-medium'
              }
            >
              Limpiar canaletas del techo y despejar basura del frente de la casa.
            </span>
          </label>

          <label
            onClick={() => toggleChecklist('step2')}
            className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-colors ${
              checklist.step2
                ? 'border-emerald-600/40 bg-emerald-50/40 dark:bg-emerald-950/20'
                : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
            }`}
          >
            {checklist.step2 ? (
              <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <Square className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            )}
            <span
              className={
                checklist.step2
                  ? 'line-through text-slate-400'
                  : 'text-slate-700 dark:text-slate-300 font-medium'
              }
            >
              Guardar cédulas, títulos y medicamentos en bolsas plásticas impermeables.
            </span>
          </label>

          <label
            onClick={() => toggleChecklist('step3')}
            className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-colors ${
              checklist.step3
                ? 'border-emerald-600/40 bg-emerald-50/40 dark:bg-emerald-950/20'
                : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
            }`}
          >
            {checklist.step3 ? (
              <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <Square className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            )}
            <span
              className={
                checklist.step3
                  ? 'line-through text-slate-400'
                  : 'text-slate-700 dark:text-slate-300 font-medium'
              }
            >
              Identificar la ruta de evacuación hacia el punto alto (Pista Sabana Grande).
            </span>
          </label>

          <label
            onClick={() => toggleChecklist('step4')}
            className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-colors ${
              checklist.step4
                ? 'border-emerald-600/40 bg-emerald-50/40 dark:bg-emerald-950/20'
                : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
            }`}
          >
            {checklist.step4 ? (
              <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <Square className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            )}
            <span
              className={
                checklist.step4
                  ? 'line-through text-slate-400'
                  : 'text-slate-700 dark:text-slate-300 font-medium'
              }
            >
              Reportar en la app cualquier atasco de sedimentos en el puente peatonal.
            </span>
          </label>
        </div>

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
          <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
            {progressPct === 100
              ? '¡Excelente! Tu familia tiene el protocolo preventivo al día.'
              : 'Completa todas las acciones antes de las lluvias de la tarde.'}
          </span>
        </div>
      </section>

      {/* 5. LÍNEAS DIRECTAS DE ASISTENCIA Y APOYO INSTITUCIONAL (MANAGUA) */}
      <section
        className={`rounded-2xl border p-4 transition-all shadow-xs ${
          isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <PhoneCall className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Líneas Directas de Apoyo Comunitario e Institucional (Managua)
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <a
              href="tel:115"
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <span>Bomberos:</span>
              <strong className="text-emerald-700 dark:text-emerald-400 font-bold">115</strong>
            </a>

            <a
              href="tel:100"
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <span>SINAPRED:</span>
              <strong className="text-emerald-700 dark:text-emerald-400 font-bold">100</strong>
            </a>

            <a
              href="tel:22507000"
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <span>Alcaldía D-VI:</span>
              <strong className="text-emerald-700 dark:text-emerald-400 font-bold">2250-7000</strong>
            </a>
          </div>
        </div>
      </section>

      {/* 6. Pie institucional */}
      <footer className="text-center pt-2">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Red Hidrométrica Barrial • Cauce La Maravilla & Pista Sabana Grande, Distrito VI, Managua
        </p>
      </footer>
    </div>
  );
};
