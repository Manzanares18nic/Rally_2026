import React from 'react';
import {
  Award,
  DollarSign,
  TrendingDown,
  Clock,
  ShieldCheck,
  Sprout,
  Radio,
  Users,
  Building2,
  X,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface ProjectPitchModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
}

export const ProjectPitchModal: React.FC<ProjectPitchModalProps> = ({
  isOpen,
  onClose,
  isDark,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto"
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-4xl my-auto rounded-3xl border shadow-2xl overflow-hidden transition-all max-h-[92vh] flex flex-col ${
          isDark
            ? 'bg-[#0b1324] border-emerald-900/40 text-slate-100'
            : 'bg-white border-emerald-200 text-slate-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera del Pitch */}
        <div className="p-5 md:p-6 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-emerald-900/30 via-slate-900/40 to-emerald-900/20 flex items-start justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-600/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              <Award className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                  Rally Latinoamericano de Innovación 2026 • Reto 05
                </span>
              </div>
              <h3 className="text-xl md:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
                Ficha Técnica Ejecutiva y Modelo de Viabilidad • AquaVerde
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Solución Modular y Replicable en Cualquier Comunidad Urbana Vulnerable de Latinoamérica (Piloto: Sabana Grande)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cuerpo del Pitch (Scrollable) */}
        <div className="p-5 md:p-6 space-y-6 overflow-y-auto text-xs leading-relaxed">
          {/* 1. Resumen Ejecutivo del Proyecto */}
          <section className="space-y-2">
            <h4 className="text-sm font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>1. La Innovación Disruptiva de AquaVerde</span>
            </h4>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
              <p>
                <strong>AquaVerde</strong> resuelve el reto de las inundaciones urbanas mediante un modelo de <strong>infraestructura verde adaptativa de ciclo cerrado</strong>:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1.5">
                <li>
                  <strong>Reservorios Multifuncionales (Water Squares)</strong>: Espacios urbanos con función dual: durante 6 meses de época seca funcionan como canchas deportivas, plazas comunitarias y zonas de sombra nativa con confort térmico (-4.5°C); y durante la temporada lluviosa priorizan la retención (73,000 L), amortiguamiento y alivio hidráulico seguro.
                </li>
                <li>
                  <strong>Telemetría IoT Accesible (Sin IA innecesaria)</strong>: Red de nodos autónomos de bajo costo ($34.50 USD) basados en microcontroladores ESP32 con sensores ultrasónicos JSN-SR04T y paneles solares, monitoreando la tasa de subida de agua en tiempo real.
                </li>
                <li>
                  <strong>Gobernanza Comunitaria Real</strong>: Alertas automatizadas por WhatsApp directo a los vigías barriales y mapeo participativo de incidentes de drenaje.
                </li>
              </ul>
            </div>
          </section>

          {/* 2. Análisis Económico Disruptivo: Hardware Tradicional vs AquaVerde */}
          <section className="space-y-3">
            <h4 className="text-sm font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              <span>2. Viabilidad Económica y Comparativa de Costos</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Estación Tradicional */}
              <div className="p-4 rounded-2xl border border-red-300 dark:border-red-900/40 bg-red-500/5 space-y-2">
                <span className="text-[10px] font-bold text-red-500 uppercase tracking-wide">
                  Enfoque Tradicional Comercial
                </span>
                <p className="text-base font-extrabold text-red-600 dark:text-red-400">
                  $3,500 USD por estación
                </p>
                <ul className="text-slate-600 dark:text-slate-400 space-y-1">
                  <li>❌ Equipos propietarios de importación costosa.</li>
                  <li>❌ Mantenimiento dependiente de proveedores extranjeros.</li>
                  <li>❌ Una sola estación no cubre la microcuenca.</li>
                  <li>❌ Red de 10 puntos: <strong>$35,000 USD</strong> (Inviable para municipalidades).</li>
                </ul>
              </div>

              {/* Solución AquaVerde */}
              <div className="p-4 rounded-2xl border border-emerald-400 dark:border-emerald-600/50 bg-emerald-500/10 space-y-2 relative overflow-hidden">
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Solución Abierta AquaVerde
                </span>
                <p className="text-base font-extrabold text-emerald-700 dark:text-emerald-300">
                  $34.50 USD por nodo (99% de Ahorro)
                </p>
                <ul className="text-slate-700 dark:text-slate-300 space-y-1">
                  <li>✅ ESP32 WiFi/GSM + Sensor JSN-SR04T IP67: $14.00</li>
                  <li>✅ Panel Solar 6V + Batería 18650 y BMS: $11.50</li>
                  <li>✅ Gabinete estanco IP67 impreso en 3D / PVC: $5.00</li>
                  <li>✅ Pluviómetro basculante impreso localmente: $4.00</li>
                  <li>✅ Red completa de 10 nodos barriales: <strong>$345 USD</strong>.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 3. Métricas de Impacto Cuantificables */}
          <section className="space-y-3">
            <h4 className="text-sm font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
              <TrendingDown className="w-4 h-4" />
              <span>3. Métricas Clave de Desempeño Hidráulico y Social</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <p className="text-lg md:text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  73,000 L
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">Amortiguamiento inmediato por vaso</p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <p className="text-lg md:text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  -34%
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">Reducción del caudal pico en puentes</p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <p className="text-lg md:text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  +42 Min
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">Tiempo de anticipación para evacuación</p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <p className="text-lg md:text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  -4.5°C
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">Mitigación de isla de calor en verano</p>
              </div>
            </div>
          </section>

          {/* 4. Articulación Institucional (Reto 05) */}
          <section className="space-y-3">
            <h4 className="text-sm font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              <span>4. Articulación Institucional y Modelo de Gobernanza</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-1">
                <p className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-emerald-600" />
                  <span>Gobiernos Locales y Alcaldías</span>
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Direcciones de Drenaje Pluvial y Obras Públicas reciben telemetría en tiempo real para despachar cuadrillas de limpieza antes de los taponamientos en cauces.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-1">
                <p className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-500" />
                  <span>Protección Civil y Gestión de Riesgo</span>
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Sistemas nacionales y locales de prevención activan protocolos de evacuación anticipada con un margen de +42 minutos para salvar vidas y bienes.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-1">
                <p className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-amber-500" />
                  <span>Comités Vecinales y Vigías Barriales</span>
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Vecinos empoderados que custodian los nodos IoT, validan reportes ciudadanos con fotos y realizan jornadas de mantenimiento en los reservorios.
                </p>
              </div>
            </div>
          </section>

          {/* 5. Retorno Social de la Inversión (SROI) */}
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-800 dark:text-slate-200">
            <div>
              <p className="font-bold text-emerald-800 dark:text-emerald-300 text-sm">
                Retorno Social de Inversión (SROI): 1 a 48
              </p>
              <p className="text-[11px] opacity-80 mt-0.5">
                Por cada $1 USD invertido en la red de nodos AquaVerde, la comunidad y el municipio evitan $48 USD en reparaciones de pavimento, desbordes y dragados de urgencia.
              </p>
            </div>
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shrink-0 transition-colors shadow-xs"
            >
              Entendido / Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
