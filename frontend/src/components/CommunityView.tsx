import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  XCircle,
  Bell,
  Camera,
  ChevronRight,
  Droplets,
  Calculator,
  CheckSquare,
  Square,
  PhoneCall,
  Sparkles,
  Info,
  MapPin,
} from 'lucide-react';
import type { DashboardSummary } from '../services/api';
import { NewsCarousel } from './NewsCarousel';

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

  // Estado para la calculadora interactiva de cosecha de lluvia
  const [roofArea, setRoofArea] = useState<number>(75);
  const [rainScenario, setRainScenario] = useState<'moderada' | 'fuerte'>('moderada');

  // Cálculo hidráulico en tiempo real:
  // Lluvia moderada ~25mm, Lluvia fuerte ~50mm
  const rainfallMm = rainScenario === 'moderada' ? 25 : 50;
  // Litros generados = Área (m²) * Precipitación (mm)
  const runoffLiters = Math.round(roofArea * rainfallMm);
  // Un jardín de bio-retención absorbe e infiltra aprox 70% de la escorrentía
  const infiltratedLiters = Math.round(runoffLiters * 0.72);

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

  // Configuración del semáforo ciudadano con tonos sobrios institucionales
  const statusConfig = isRed
    ? {
        label: 'Alerta Roja: Desborde Inminente',
        desc: 'El cauce La Maravilla superó el umbral crítico. Familias en márgenes y zonas bajas deben evacuar inmediatamente a los puntos altos seguros de Sabana Grande.',
        bg: isDark ? 'bg-red-950/40 border-red-900/60 text-red-100' : 'bg-red-50 border-red-200 text-red-900',
        badge: 'bg-red-600 text-white',
        barColor: 'bg-red-600',
        icon: <XCircle className="w-8 h-8 text-red-500" />,
      }
    : isYellow
    ? {
        label: 'Alerta Amarilla: Precaución por Crecida Rápida',
        desc: 'El caudal está aumentando velozmente por precipitaciones en la cuenca alta. Evite cruzar el puente peatonal y asegure accesos y bienes.',
        bg: isDark ? 'bg-amber-950/40 border-amber-900/60 text-amber-100' : 'bg-amber-50 border-amber-200 text-amber-950',
        badge: 'bg-amber-600 text-white',
        barColor: 'bg-amber-500',
        icon: <AlertTriangle className="w-8 h-8 text-amber-500" />,
      }
    : isFault
    ? {
        label: 'Sensor en Mantenimiento',
        desc: 'El nodo ultrasónico no transmite lecturas telemétricas. Vigías del comité barrial realizan inspección visual en sitio.',
        bg: isDark ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-slate-100 border-slate-300 text-slate-800',
        badge: 'bg-slate-700 text-slate-100',
        barColor: 'bg-slate-500',
        icon: <AlertTriangle className="w-8 h-8 text-slate-400" />,
      }
    : {
        label: 'Nivel Normal: Flujo Seguro',
        desc: 'El tirante de agua se encuentra dentro del margen de seguridad en el Cauce La Maravilla y la Pista Sabana Grande.',
        bg: isDark ? 'bg-emerald-950/30 border-emerald-900/40 text-emerald-100' : 'bg-emerald-50/70 border-emerald-200 text-emerald-950',
        badge: 'bg-emerald-700 text-white',
        barColor: 'bg-emerald-600',
        icon: <ShieldCheck className="w-8 h-8 text-emerald-500" />,
      };

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-2">
      {/* 1. Tarjeta principal de Estado Comunitario */}
      <section
        className={`rounded-2xl border p-6 md:p-8 transition-all shadow-xs ${statusConfig.bg}`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-white/10 shrink-0">
              {statusConfig.icon}
            </div>
            <div>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusConfig.badge}`}>
                Semáforo Barrial
              </span>
              <h2 className="text-xl md:text-2xl font-bold mt-1.5">{statusConfig.label}</h2>
            </div>
          </div>

          <button
            onClick={onSendWhatsApp}
            disabled={isSendingWhatsApp}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs flex items-center justify-center gap-2 transition-colors shadow-xs shrink-0"
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
            <span>Capacidad ocupada del cauce</span>
            <span className="font-semibold text-sm">{levelPct.toFixed(0)}% de capacidad</span>
          </div>
          <div className="w-full h-3 rounded-full bg-black/15 overflow-hidden">
            <div
              className={`h-full transition-all duration-700 rounded-full ${statusConfig.barColor}`}
              style={{ width: `${levelPct}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] opacity-75 mt-1.5 font-medium">
            <span>0 cm (Cauce seco)</span>
            <span>Altura medida: {dashboard.current_level_cm.toFixed(1)} cm</span>
            <span>300 cm (Cota de desborde)</span>
          </div>
        </div>
      </section>

      {/* 2. Acciones Rápidas del Vecino (Reportar con Foto y Ver Mapa) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Reportar con Foto */}
        <div
          className={`p-5 rounded-2xl border transition-all ${
            isDark
              ? 'bg-[#0f172a] border-slate-800 text-slate-100'
              : 'bg-white border-slate-200 text-slate-900'
          } shadow-xs flex flex-col justify-between`}
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
              <Camera className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm">Reportar Obstrucción con Fotografía</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              ¿Ves basura, sedimentos o ramas bloqueando el paso del agua? Sube una foto para que el sistema de visión artificial evalúe la prioridad y la cuadrilla municipal acuda de inmediato.
            </p>
          </div>
          <button
            onClick={onOpenReportModal}
            className="mt-4 w-full py-2.5 px-4 rounded-xl border border-emerald-600 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>Subir Fotografía del Drenaje</span>
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
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm">Mapa Satelital de Sabana Grande</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Explora las imágenes satelitales en alta resolución de la cuenca, la ubicación de las franjas de bio-retención y los reportes comunitarios activos en el sector.
            </p>
          </div>
          <button
            onClick={onGoToMap}
            className="mt-4 w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
          >
            <span>Explorar Mapa Satelital</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* 3. CARRUSEL DE NOTICIAS Y EDUCACIÓN HIDRÁULICA (VIDEOS OFICIALES) */}
      <NewsCarousel isDark={isDark} />

      {/* 4. HERRAMIENTAS INTERACTIVAS COMUNITARIAS */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* A. Calculadora Interactiva de Cosecha de Lluvia y Bio-Retención Hogareña */}
        <div
          className={`p-5 rounded-2xl border ${
            isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
          } shadow-xs flex flex-col justify-between space-y-4`}
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-emerald-600" />
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Calculadora Barrial de Bio-Retención
                </h4>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                Interactivo
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Descubre cuántos litros de lluvia puedes cosechar o infiltrar con un jardín de lluvia o barril pluvial en tu vivienda.
            </p>

            {/* Slider de Metros Cuadrados */}
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-600 dark:text-slate-400">Área de techo / patio:</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400">
                  {roofArea} m²
                </span>
              </div>
              <input
                type="range"
                min="20"
                max="250"
                step="5"
                value={roofArea}
                onChange={(e) => setRoofArea(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>20 m² (Casa pequeña)</span>
                <span>250 m² (Patio amplio)</span>
              </div>
            </div>

            {/* Selector de Evento de Lluvia */}
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => setRainScenario('moderada')}
                className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-medium border transition-colors ${
                  rainScenario === 'moderada'
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                    : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-700'
                }`}
              >
                Lluvia típica (25 mm)
              </button>
              <button
                onClick={() => setRainScenario('fuerte')}
                className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-medium border transition-colors ${
                  rainScenario === 'fuerte'
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                    : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-700'
                }`}
              >
                Tormenta fuerte (50 mm)
              </button>
            </div>
          </div>

          {/* Resultado del impacto hídrico */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-slate-600 dark:text-slate-400">Escorrentía aportada:</span>
              <strong className="text-sm text-slate-900 dark:text-slate-100">
                {runoffLiters.toLocaleString()} Litros
              </strong>
            </div>
            <div className="flex justify-between items-baseline pt-1 border-t border-slate-200 dark:border-slate-800">
              <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                Infiltrables con bio-jardín:
              </span>
              <strong className="text-base text-emerald-700 dark:text-emerald-400 font-bold">
                {infiltratedLiters.toLocaleString()} Litros
              </strong>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 pt-1 leading-snug">
              Al infiltrar esta agua en el patio, disminuyes la presión de choque sobre el Cauce La Maravilla y previenes la acumulación en la calzada.
            </p>
          </div>
        </div>

        {/* B. Checklist Interactivo: Plan Familiar de Prevención */}
        <div
          className={`p-5 rounded-2xl border ${
            isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
          } shadow-xs flex flex-col justify-between space-y-4`}
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-emerald-600" />
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Plan Familiar ante Lluvias
                </h4>
              </div>
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                {progressPct}% completado
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Marca las medidas preventivas que tu familia ya ejecutó en tu vivienda antes de la llegada de la lluvia:
            </p>

            {/* Barra de progreso */}
            <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 mt-3 overflow-hidden">
              <div
                className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>

            {/* Lista interactiva */}
            <div className="mt-3.5 space-y-2 text-xs">
              <label
                onClick={() => toggleChecklist('step1')}
                className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
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
                      : 'text-slate-700 dark:text-slate-300'
                  }
                >
                  Limpiar canaletas del techo y despejar basura del frente de la casa.
                </span>
              </label>

              <label
                onClick={() => toggleChecklist('step2')}
                className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
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
                      : 'text-slate-700 dark:text-slate-300'
                  }
                >
                  Guardar cédulas, títulos y medicamentos en bolsas plásticas impermeables.
                </span>
              </label>

              <label
                onClick={() => toggleChecklist('step3')}
                className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
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
                      : 'text-slate-700 dark:text-slate-300'
                  }
                >
                  Revisar la ruta hacia la zona alta (Pista Sabana Grande hacia empalme).
                </span>
              </label>

              <label
                onClick={() => toggleChecklist('step4')}
                className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
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
                      : 'text-slate-700 dark:text-slate-300'
                  }
                >
                  Reportar en la app cualquier atasco de sedimentos en el puente peatonal.
                </span>
              </label>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
            <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
              {progressPct === 100
                ? '¡Excelente! Tu familia tiene el protocolo preventivo al día.'
                : 'Completa todas las acciones antes de las lluvias de la tarde.'}
            </span>
          </div>
        </div>
      </section>

      {/* 5. Directorio de Emergencia Directo */}
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
