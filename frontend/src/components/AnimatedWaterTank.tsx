import React from 'react';
import { Waves, AlertTriangle, ArrowUpRight, ShieldCheck, Radio } from 'lucide-react';

interface AnimatedWaterTankProps {
  levelPct: number; // 0 to 100
  levelCm: number; // 0 to 300
  maxCapacityCm?: number;
  riseRatePct30m?: number;
  status: 'VERDE' | 'AMARILLO' | 'ROJO' | 'FALLO_SENSOR';
  isDark: boolean;
}

export const AnimatedWaterTank: React.FC<AnimatedWaterTankProps> = ({
  levelPct,
  levelCm,
  maxCapacityCm = 300,
  riseRatePct30m = 0,
  status,
  isDark,
}) => {
  const clampedPct = Math.min(100, Math.max(0, levelPct));
  const isRed = status === 'ROJO';
  const isYellow = status === 'AMARILLO';
  const isFault = status === 'FALLO_SENSOR';

  // Tank dimensions and coordinates
  const tankHeight = 180; // px
  const waterHeight = Math.max(8, (clampedPct / 100) * tankHeight);
  const waterY = tankHeight - waterHeight;

  // Fluid theme based on severity
  const fluidColor = isRed
    ? {
        gradientStart: '#ef4444',
        gradientEnd: '#991b1b',
        waveColor: '#fca5a5',
        glow: 'rgba(239, 68, 68, 0.35)',
        statusLabel: 'CRÍTICO: RIESGO DE DESBORDE',
        badgeClass: 'bg-red-500/20 text-red-500 border-red-500/30',
      }
    : isYellow
    ? {
        gradientStart: '#f59e0b',
        gradientEnd: '#b45309',
        waveColor: '#fde68a',
        glow: 'rgba(245, 158, 11, 0.3)',
        statusLabel: 'PRECAUCIÓN: CRECIDA ACTIVA',
        badgeClass: 'bg-amber-500/20 text-amber-500 border-amber-500/30',
      }
    : isFault
    ? {
        gradientStart: '#64748b',
        gradientEnd: '#334155',
        waveColor: '#cbd5e1',
        glow: 'rgba(100, 116, 139, 0.2)',
        statusLabel: 'SENSOR EN MANTENIMIENTO',
        badgeClass: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
      }
    : {
        gradientStart: '#10b981',
        gradientEnd: '#047857',
        waveColor: '#a7f3d0',
        glow: 'rgba(16, 185, 129, 0.3)',
        statusLabel: 'NIVEL NORMAL: FLUJO SEGURO',
        badgeClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      };

  return (
    <div
      className={`rounded-2xl border p-4 md:p-5 transition-all shadow-xs ${
        isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
      }`}
    >
      {/* Encabezado del visor de tanque */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-600/10 text-emerald-600 dark:text-emerald-400">
            <Waves className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs md:text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>Vaso Hidrométrico en Tiempo Real (Sabana Grande)</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${fluidColor.badgeClass}`}>
                {fluidColor.statusLabel}
              </span>
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Lectura continua con sensor ultrasónico sellado IP67 cada 2s
            </p>
          </div>
        </div>

        {/* Tasa de variación */}
        <div className="flex items-center gap-2 self-end sm:self-auto text-xs">
          <span className="text-[11px] text-slate-400">Tasa 30m:</span>
          <span
            className={`font-bold flex items-center gap-0.5 ${
              riseRatePct30m > 20
                ? 'text-red-500'
                : riseRatePct30m > 5
                ? 'text-amber-500'
                : 'text-emerald-500'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+{riseRatePct30m.toFixed(1)}%</span>
          </span>
        </div>
      </div>

      {/* Visualizador del Tanque con SVG animado y Regla Métrica */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Contenedor SVG del Tanque (8 cols) */}
        <div className="md:col-span-8 relative">
          <svg
            viewBox="0 0 500 240"
            className="w-full h-auto rounded-xl overflow-hidden drop-shadow-md select-none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="tankFluidGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={fluidColor.gradientStart} stopOpacity="0.85" />
                <stop offset="100%" stopColor={fluidColor.gradientEnd} stopOpacity="0.95" />
              </linearGradient>

              {/* Fondo del tanque metálico/vidrio */}
              <linearGradient id="tankBgGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#0f172a" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#1e293b" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#0f172a" stopOpacity="0.9" />
              </linearGradient>
            </defs>

            {/* Marco estructural del reservorio / tanque */}
            <rect x="50" y="30" width="400" height={tankHeight} rx="10" fill="url(#tankBgGrad)" stroke="#334155" strokeWidth="3" />

            {/* Líneas horizontales de cotas de seguridad */}
            {/* Cota Crítica (+240cm = 80%) -> y = 30 + 180*(1 - 0.8) = 66 */}
            <line x1="50" y1="66" x2="450" y2="66" stroke="#ef4444" strokeWidth="1" strokeDasharray="4 3" opacity="0.6" />
            <text x="440" y="62" textAnchor="end" fill="#ef4444" fontSize="9" fontWeight="bold">
              Cota Desborde: 240 cm (80%)
            </text>

            {/* Cota Preventiva (+150cm = 50%) -> y = 30 + 180*(1 - 0.5) = 120 */}
            <line x1="50" y1="120" x2="450" y2="120" stroke="#f59e0b" strokeWidth="1" strokeDasharray="4 3" opacity="0.5" />
            <text x="440" y="116" textAnchor="end" fill="#f59e0b" fontSize="9" fontWeight="bold">
              Umbral Alerta: 150 cm (50%)
            </text>

            {/* Cota Base Segura (+60cm = 20%) -> y = 30 + 180*(1 - 0.2) = 174 */}
            <line x1="50" y1="174" x2="450" y2="174" stroke="#10b981" strokeWidth="1" strokeDasharray="4 3" opacity="0.4" />
            <text x="440" y="170" textAnchor="end" fill="#10b981" fontSize="9" fontWeight="bold">
              Flujo Normal: 60 cm (20%)
            </text>

            {/* Masa de Agua con olas animadas */}
            <g>
              {/* Olas traseras más tenues */}
              <path
                d={`M 50,${30 + waterY} 
                    Q 150,${30 + waterY - 5} 250,${30 + waterY} 
                    T 450,${30 + waterY} 
                    L 450,210 
                    L 50,210 Z`}
                fill={fluidColor.waveColor}
                opacity="0.3"
              />

              {/* Olas principales con gradiente líquido */}
              <path
                d={`M 50,${30 + waterY} 
                    Q 130,${30 + waterY + 4} 210,${30 + waterY} 
                    T 370,${30 + waterY} 
                    T 450,${30 + waterY} 
                    L 450,210 
                    L 50,210 Z`}
                fill="url(#tankFluidGrad)"
              />

              {/* Burbujas decorativas animadas dentro del agua */}
              <circle cx="120" cy={Math.min(200, 30 + waterY + 20)} r="2.5" fill="#ffffff" opacity="0.4" />
              <circle cx="280" cy={Math.min(195, 30 + waterY + 40)} r="3" fill="#ffffff" opacity="0.3" />
              <circle cx="380" cy={Math.min(200, 30 + waterY + 15)} r="2" fill="#ffffff" opacity="0.5" />
            </g>

            {/* Sensor Ultrasónico montado en el borde superior (x: 250, y: 12) */}
            <g transform="translate(250, 10)">
              {/* Caja del sensor */}
              <rect x="-16" y="0" width="32" height="18" rx="4" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
              <circle cx="-6" cy="18" r="3.5" fill="#38bdf8" />
              <circle cx="6" cy="18" r="3.5" fill="#38bdf8" />

              {/* Ondas emitidas hacia el agua */}
              <path
                d={`M -8,25 Q 0,30 8,25 M -14,33 Q 0,40 14,33 M -20,41 Q 0,50 20,41`}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="1.5"
                opacity="0.75"
                strokeLinecap="round"
              />
            </g>

            {/* Regla graduada a la izquierda (x: 50 a 80) */}
            <g transform="translate(50, 30)">
              {/* Línea vertical de la regla */}
              <line x1="0" y1="0" x2="0" y2="180" stroke="#94a3b8" strokeWidth="2" />
              {/* Marcas de 0 cm a 300 cm cada 50 cm */}
              {[
                { val: '300cm', y: 0 },
                { val: '250cm', y: 30 },
                { val: '200cm', y: 60 },
                { val: '150cm', y: 90 },
                { val: '100cm', y: 120 },
                { val: '50cm', y: 150 },
                { val: '0cm', y: 180 },
              ].map((tick, i) => (
                <g key={i}>
                  <line x1="0" y1={tick.y} x2="10" y2={tick.y} stroke="#94a3b8" strokeWidth="1.5" />
                  <text x="14" y={tick.y + 3} fill="#94a3b8" fontSize="8" fontWeight="bold">
                    {tick.val}
                  </text>
                </g>
              ))}
            </g>

            {/* Marcador flotante de nivel actual (Etiqueta en la superficie) */}
            <g transform={`translate(250, ${Math.max(45, 30 + waterY)})`}>
              <rect x="-65" y="-14" width="130" height="24" rx="12" fill="#0f172a" stroke={fluidColor.gradientStart} strokeWidth="2" filter="drop-shadow(0 2px 6px rgba(0,0,0,0.5))" />
              <text x="0" y="2" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold">
                {levelCm.toFixed(1)} cm • {clampedPct.toFixed(0)}%
              </text>
            </g>

            {/* Capa de sedimentos en el fondo */}
            <rect x="52" y="202" width="396" height="7" rx="3" fill="#78350f" opacity="0.6" />
            <text x="250" y="207" textAnchor="middle" fill="#d97706" fontSize="7" fontWeight="bold">
              FONDO DEPRESIÓN • TRAMPA DE SEDIMENTOS
            </text>
          </svg>
        </div>

        {/* Tarjetas de Telemetría Numérica y Parámetros (4 cols) */}
        <div className="md:col-span-4 space-y-3">
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
              Tirante Hidrométrico Actual
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                {levelCm.toFixed(1)}
              </span>
              <span className="text-xs text-slate-500 font-semibold">cm de {maxCapacityCm} cm</span>
            </div>
            <div className="mt-2 w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${clampedPct}%`,
                  backgroundColor: fluidColor.gradientStart,
                }}
              />
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
              Volumen Retenido Estimado
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                {((clampedPct / 100) * 73000).toLocaleString('es-NI', { maximumFractionDigits: 0 })}
              </span>
              <span className="text-xs text-slate-500 font-semibold">Litros</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Amortiguamiento activo en el vaso de Sabana Grande
            </p>
          </div>

          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
            <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-500" />
            <span className="text-[11px] leading-tight">
              Aliviadero de emergencia listo a los <strong>240 cm</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
