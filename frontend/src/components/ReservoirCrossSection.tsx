import React, { useState } from 'react';
import {
  Sun,
  CloudRain,
  Radio,
  Layers,
  Sparkles,
  ShieldAlert,
  Info,
  Maximize2,
} from 'lucide-react';

interface ReservoirCrossSectionProps {
  season: 'SECA' | 'LLUVIOSA';
  isDark: boolean;
  waterLevelPct?: number; // 0 to 100
}

export const ReservoirCrossSection: React.FC<ReservoirCrossSectionProps> = ({
  season,
  isDark,
  waterLevelPct = 40,
}) => {
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);

  const isDry = season === 'SECA';

  // Hotspots info
  const hotspotDetails: { [key: string]: { title: string; desc: string; tag: string } } = {
    cancha: {
      title: 'Lecho Multideportivo y Plaza Comunitaria',
      desc: 'En época seca, el fondo deprimido funciona como cancha de fútbol sala y básquetbol con pavimento permeable, permitiendo recreación barrial sin riesgo.',
      tag: 'Época Seca • Uso Social',
    },
    sensor: {
      title: 'Nodo IoT ESP32 + Ultrasonido JSN-SR04T',
      desc: 'Brazo voladizo con sensor sellado IP67 que mide el tirante de agua cada 2 segundos y calcula la tasa de subida (cm/min) para alertar antes del desborde.',
      tag: 'Hardware IoT • Telemetría',
    },
    aliviadero: {
      title: 'Aliviadero de Emergencia (Cota +2.80m)',
      desc: 'Vertedero de demasías dimensionado para eventos hidrológicos extremos (Tr = 50 años). Evita que la crecida socave los bordes del barrio.',
      tag: 'Hidráulica de Seguridad',
    },
    salida: {
      title: 'Salida Regulada y Válvula de Descarga',
      desc: 'Tubería inferior con compuerta calibrada que dosifica el drenaje hacia el Cauce La Maravilla a una tasa máxima no destructiva.',
      tag: 'Control de Caudal',
    },
    biozanja: {
      title: 'Bio-Zanja Filtrante con Pasto Vetiver',
      desc: 'Franja vegetada que recibe la escorrentía de la Pista Sabana Grande, atrapa sedimentos y basura plástica, y reduce la velocidad del torrente.',
      tag: 'Infraestructura Verde',
    },
    arboles: {
      title: 'Zonas de Sombra con Madroño y Jiñocuabo',
      desc: 'Arbolado nativo en el talud superior que aporta confort bioclimático (-4.5°C), atrae biodiversidad y estabiliza el suelo con raíces profundas.',
      tag: 'Confort Bioclimático',
    },
  };

  return (
    <div
      className={`rounded-2xl border p-5 md:p-6 transition-all shadow-xs space-y-4 ${
        isDark ? 'bg-[#0b1324] border-slate-800' : 'bg-white border-slate-200'
      }`}
    >
      {/* Encabezado del Diagrama */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" />
              <span>Corte Transversal Arquitectónico-Hidráulico Interactivo</span>
            </span>
          </div>
          <h4 className="text-base md:text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5">
            {isDry
              ? 'Esquema de Corte: Parque Inundable en Época Seca'
              : 'Esquema de Corte: Retención y Regulación en Temporada Lluviosa'}
          </h4>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 text-[11px] hidden sm:inline">
            Toca los puntos marcados en el corte:
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
            {isDry ? (
              <>
                <Sun className="w-3 h-3 text-amber-500" />
                <span>Modo Recreativo Activo</span>
              </>
            ) : (
              <>
                <CloudRain className="w-3 h-3 text-emerald-500" />
                <span>Modo Amortiguamiento Hidráulico</span>
              </>
            )}
          </span>
        </div>
      </div>

      {/* SVG del Corte Transversal Dinámico */}
      <div className="relative w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-gradient-to-b from-sky-100/40 via-emerald-50/20 to-amber-100/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-2 md:p-4 select-none">
        <svg
          viewBox="0 0 900 420"
          className="w-full h-auto drop-shadow-sm font-sans"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Gradientes para agua y suelo */}
            <linearGradient id="waterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#0369a1" stopOpacity="0.95" />
            </linearGradient>
            <linearGradient id="groundGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>
            <linearGradient id="grassGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
            </linearGradient>

            {/* Patrón de adoquín permeable */}
            <pattern id="permeablePattern" width="20" height="20" patternUnits="userSpaceOnUse">
              <rect width="20" height="20" fill="#334155" />
              <rect x="1" y="1" width="8" height="8" fill="#475569" rx="1" />
              <rect x="11" y="11" width="8" height="8" fill="#475569" rx="1" />
            </pattern>
          </defs>

          {/* 1. Fondo atmosférico */}
          <rect x="0" y="0" width="900" height="420" fill="url(#skyGrad)" />

          {/* Línea de horizonte de Sabana Grande */}
          <path
            d="M0,150 Q200,140 450,150 T900,145 L900,420 L0,420 Z"
            fill="none"
            stroke="#94a3b8"
            strokeWidth="0.5"
            strokeDasharray="4 4"
            opacity="0.4"
          />

          {/* 2. Topografía del Vaso Escalonado (Perfil transversal) */}
          {/* Nivel Superior Izquierdo: Pista Sabana Grande y Bio-Zanja */}
          {/* Talud hacia el fondo: 1:2 */}
          {/* Fondo Plano: Cancha / Vaso */}
          {/* Talud Derecho con Aliviadero y Cauce */}
          <path
            d="M 0,160 
               L 180,160 
               Q 200,160 220,185 
               L 280,310 
               Q 295,330 320,330 
               L 600,330 
               Q 625,330 640,310 
               L 700,210 
               L 760,210 
               L 760,250 
               L 900,250 
               L 900,420 
               L 0,420 Z"
            fill="url(#groundGrad)"
          />

          {/* Capa de Vegetación / Grama en taludes */}
          <path
            d="M 0,158 L 180,158 Q 200,158 220,183 L 280,308 Q 295,328 320,328 L 600,328 Q 625,328 640,308 L 700,208 L 760,208 L 760,248 L 900,248"
            fill="none"
            stroke="url(#grassGrad)"
            strokeWidth="6"
            strokeLinecap="round"
          />

          {/* Capa de Pavimento Permeable / Cancha en el fondo plano (x: 320 a 600, y: 330) */}
          <rect
            x="320"
            y="330"
            width="280"
            height="16"
            fill="url(#permeablePattern)"
            stroke="#10b981"
            strokeWidth="1.5"
          />
          <text
            x="460"
            y="342"
            textAnchor="middle"
            fill="#e2e8f0"
            fontSize="10"
            fontWeight="bold"
            letterSpacing="1"
          >
            {isDry ? 'PAVIMENTO PERMEABLE / CANCHA' : 'LECHO FILTRANTE DE RETENCIÓN'}
          </text>

          {/* Flechas de infiltración al acuífero subterráneo (bajo el pavimento) */}
          <g opacity="0.75">
            <path d="M 380,355 L 380,385 M 376,380 L 380,387 L 384,380" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
            <path d="M 460,355 L 460,385 M 456,380 L 460,387 L 464,380" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
            <path d="M 540,355 L 540,385 M 536,380 L 540,387 L 544,380" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
            <text x="460" y="405" textAnchor="middle" fill="#94a3b8" fontSize="10">
              Recarga natural al Acuífero de Managua (Infiltración limpia)
            </text>
          </g>

          {/* 3. Infraestructura y Elementos Bioclimáticos */}

          {/* Árboles Nativos en el talud superior izquierdo (Madroño / Jiñocuabo) */}
          <g transform="translate(60, 85)" className="cursor-pointer" onClick={() => setActiveHotspot('arboles')}>
            {/* Tronco */}
            <path d="M 30,75 L 30,35 Q 28,25 35,20" stroke="#78350f" strokeWidth="6" strokeLinecap="round" />
            {/* Copa */}
            <circle cx="30" cy="20" r="28" fill="#15803d" opacity="0.9" />
            <circle cx="45" cy="25" r="20" fill="#16a34a" opacity="0.9" />
            <circle cx="15" cy="25" r="18" fill="#22c55e" opacity="0.8" />
            <text x="30" y="-12" textAnchor="middle" fill={isDark ? '#86efac' : '#166534'} fontSize="10" fontWeight="bold">
              Madroño / Sombra (-4.5°C)
            </text>
          </g>

          {/* Bio-Zanja con pasto Vetiver en la entrada izquierda (x: 140 a 200) */}
          <g transform="translate(130, 125)" className="cursor-pointer" onClick={() => setActiveHotspot('biozanja')}>
            <rect x="0" y="30" width="55" height="6" fill="#047857" rx="3" />
            {/* Raíces profundas de Vetiver */}
            <path d="M 10,35 L 10,75 M 25,35 L 25,85 M 40,35 L 40,78 M 50,35 L 50,70" stroke="#065f46" strokeWidth="1.5" strokeDasharray="3 2" />
            {/* Follaje denso */}
            <path d="M 5,30 L 12,5 M 15,30 L 22,0 M 25,30 L 30,2 M 35,30 L 40,8 M 48,30 L 52,12" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
            <text x="25" y="-5" textAnchor="middle" fill={isDark ? '#a7f3d0' : '#065f46'} fontSize="9" fontWeight="bold">
              Bio-Zanja Vetiver
            </text>
          </g>

          {/* Brazo Voladizo y Nodo IoT ESP32 (x: 310, y: 150) */}
          <g transform="translate(290, 140)" className="cursor-pointer" onClick={() => setActiveHotspot('sensor')}>
            {/* Poste metálico */}
            <path d="M 0,160 L 0,0 L 50,0" fill="none" stroke="#64748b" strokeWidth="4" strokeLinecap="round" />
            {/* Caja estanca del ESP32 con mini panel solar */}
            <rect x="-12" y="-18" width="24" height="24" rx="4" fill="#0f172a" stroke="#10b981" strokeWidth="1.5" />
            <rect x="-10" y="-28" width="20" height="7" rx="2" fill="#0284c7" stroke="#38bdf8" strokeWidth="1" />
            {/* Sensor ultrasónico en la punta */}
            <rect x="42" y="0" width="16" height="12" rx="3" fill="#334155" />
            <circle cx="46" cy="12" r="3" fill="#cbd5e1" />
            <circle cx="54" cy="12" r="3" fill="#cbd5e1" />

            {/* Ondas ultrasónicas de telemetría hacia abajo */}
            <g className="animate-pulse">
              <path d="M 42,22 Q 50,28 58,22" fill="none" stroke="#38bdf8" strokeWidth="1.5" />
              <path d="M 36,32 Q 50,42 64,32" fill="none" stroke="#38bdf8" strokeWidth="1.5" />
              <path d="M 30,44 Q 50,56 70,44" fill="none" stroke="#38bdf8" strokeWidth="1.5" opacity="0.7" />
            </g>

            <text x="50" y="-10" textAnchor="middle" fill="#38bdf8" fontSize="10" fontWeight="bold">
              Nodo ESP32 IoT
            </text>
          </g>

          {/* Salida Regulada Inferior (Tubo de desagüe controlado x: 595, y: 315) */}
          <g transform="translate(595, 305)" className="cursor-pointer" onClick={() => setActiveHotspot('salida')}>
            {/* Tubo de concreto */}
            <rect x="0" y="5" width="115" height="20" rx="3" fill="#334155" stroke="#94a3b8" strokeWidth="1.5" />
            {/* Válvula compuerta */}
            <rect x="25" y="-5" width="8" height="35" fill="#f59e0b" stroke="#b45309" strokeWidth="1" />
            <circle cx="29" cy="-10" r="5" fill="#ef4444" />
            <text x="60" y="-8" textAnchor="middle" fill="#f59e0b" fontSize="9" fontWeight="bold">
              Salida Regulada (Q_max)
            </text>
          </g>

          {/* Aliviadero de Emergencia Superior (x: 700, y: 210) */}
          <g transform="translate(685, 185)" className="cursor-pointer" onClick={() => setActiveHotspot('aliviadero')}>
            {/* Vertedero de demasías */}
            <path d="M 15,25 L 75,25 L 75,65" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeDasharray="4 3" />
            <text x="45" y="15" textAnchor="middle" fill="#ef4444" fontSize="10" fontWeight="bold">
              Aliviadero de Emergencia (+2.8m)
            </text>
          </g>

          {/* Cauce Receptor (La Maravilla) a la extrema derecha (x: 760 a 900) */}
          <text x="830" y="240" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="bold">
            Cauce La Maravilla
          </text>

          {/* 4. Estado de Temporada (Dibujo Condicional) */}
          {isDry ? (
            /* =================== ÉPOCA SECA =================== */
            <g id="dry-season-elements">
              {/* Cancha deportiva pintada en el fondo */}
              <g transform="translate(350, 320)">
                {/* Arco de fútbol sala izquierdo */}
                <path d="M 0,0 L 0,-25 L 12,-25 L 12,0" fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.9" />
                {/* Línea de medio campo */}
                <line x1="110" y1="0" x2="110" y2="10" stroke="#ffffff" strokeWidth="2" strokeDasharray="2 2" />
                <circle cx="110" cy="5" r="12" fill="none" stroke="#ffffff" strokeWidth="1.5" />
                {/* Arco derecho */}
                <path d="M 220,0 L 220,-25 L 208,-25 L 208,0" fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.9" />
              </g>

              {/* Personas / Jóvenes jugando fútbol y descansando (Siluetas Vectoriales) */}
              <g transform="translate(420, 290)" className="cursor-pointer" onClick={() => setActiveHotspot('cancha')}>
                {/* Jugador 1 */}
                <circle cx="15" cy="5" r="4" fill="#f59e0b" />
                <path d="M 15,10 L 15,25 M 15,15 L 8,22 M 15,15 L 22,18 M 15,25 L 10,38 M 15,25 L 20,38" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
                {/* Balón */}
                <circle cx="26" cy="36" r="3" fill="#ffffff" stroke="#000000" strokeWidth="0.8" />

                {/* Jugador 2 */}
                <circle cx="65" cy="7" r="4" fill="#10b981" />
                <path d="M 65,12 L 65,27 M 65,17 L 58,23 M 65,17 L 72,21 M 65,27 L 60,38 M 65,27 L 70,38" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
              </g>

              {/* Bancas y áreas de descanso en el talud */}
              <g transform="translate(230, 230)">
                <rect x="0" y="0" width="22" height="4" rx="1" fill="#78350f" />
                <line x1="4" y1="4" x2="4" y2="10" stroke="#475569" strokeWidth="2" />
                <line x1="18" y1="4" x2="18" y2="10" stroke="#475569" strokeWidth="2" />
                <circle cx="11" cy="-4" r="3" fill="#38bdf8" />
                <path d="M 11,0 L 11,8" stroke="#38bdf8" strokeWidth="1.5" />
              </g>

              {/* Etiqueta flotante */}
              <rect x="360" y="240" width="200" height="26" rx="13" fill="#0f172a" opacity="0.85" stroke="#f59e0b" strokeWidth="1" />
              <text x="460" y="257" textAnchor="middle" fill="#fde68a" fontSize="11" fontWeight="bold">
                ☀️ 100% USO COMUNITARIO ACTIVO
              </text>
            </g>
          ) : (
            /* =================== TEMPORADA LLUVIOSA =================== */
            <g id="rain-season-elements">
              {/* Nivel de Agua dinámico en el reservorio */}
              {/* Altura calculada según waterLevelPct */}
              {/* Fondo: y=328. Tope de aliviadero: y=210. Rango = 118px */}
              {(() => {
                const waterHeight = Math.max(15, Math.min(115, (waterLevelPct / 100) * 115));
                const waterSurfaceY = 328 - waterHeight;
                // Coordenadas del polígono de agua adaptado al talud
                // Talud izquierdo: de (220, 185) a (280, 310) a (320, 328)
                // Talud derecho: de (600, 328) a (640, 310) a (700, 210)
                const leftX = 320 - (waterHeight / 115) * 80;
                const rightX = 600 + (waterHeight / 115) * 80;

                return (
                  <g>
                    {/* Masa de Agua */}
                    <path
                      d={`M ${leftX},${waterSurfaceY} 
                          Q ${(leftX + rightX) / 2},${waterSurfaceY - 4} ${rightX},${waterSurfaceY} 
                          L ${rightX},328 
                          L ${leftX},328 Z`}
                      fill="url(#waterGrad)"
                    />

                    {/* Ondas en la superficie del agua (Animación visual) */}
                    <path
                      d={`M ${leftX},${waterSurfaceY} 
                          Q ${(leftX + rightX) * 0.3},${waterSurfaceY - 3} ${(leftX + rightX) * 0.5},${waterSurfaceY} 
                          T ${rightX},${waterSurfaceY}`}
                      fill="none"
                      stroke="#7dd3fc"
                      strokeWidth="2"
                      className="animate-pulse"
                    />

                    {/* Línea de Cota de Agua */}
                    <line
                      x1={leftX - 30}
                      y1={waterSurfaceY}
                      x2={rightX + 30}
                      y2={waterSurfaceY}
                      stroke="#38bdf8"
                      strokeWidth="1"
                      strokeDasharray="4 2"
                      opacity="0.8"
                    />
                    <text
                      x="460"
                      y={waterSurfaceY - 8}
                      textAnchor="middle"
                      fill="#e0f2fe"
                      fontSize="11"
                      fontWeight="bold"
                    >
                      Tirante de Retención: {((waterLevelPct / 100) * 3).toFixed(2)} m ({waterLevelPct}% Capacidad)
                    </text>

                    {/* Flujo de entrada de la Bio-Zanja al vaso */}
                    <path
                      d="M 185,165 Q 240,200 270,${waterSurfaceY}"
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="3"
                      strokeDasharray="6 3"
                      className="animate-pulse"
                    />
                    <text x="210" y="210" fill="#38bdf8" fontSize="9" fontWeight="bold">
                      Escorrentía Filtrada
                    </text>

                    {/* Chorro de salida regulada al Cauce La Maravilla */}
                    <path
                      d="M 710,315 Q 750,315 780,300"
                      fill="none"
                      stroke="#0284c7"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                  </g>
                );
              })()}

              {/* Lluvia cayendo (Gotas estilizadas) */}
              <g stroke="#7dd3fc" strokeWidth="1.5" strokeLinecap="round" opacity="0.6">
                <line x1="200" y1="50" x2="190" y2="80" />
                <line x1="280" y1="40" x2="270" y2="70" />
                <line x1="380" y1="55" x2="370" y2="85" />
                <line x1="480" y1="45" x2="470" y2="75" />
                <line x1="580" y1="50" x2="570" y2="80" />
                <line x1="680" y1="40" x2="670" y2="70" />
              </g>

              {/* Etiqueta de Alivio y Amortiguamiento */}
              <rect x="340" y="70" width="240" height="26" rx="13" fill="#0369a1" opacity="0.9" stroke="#38bdf8" strokeWidth="1" />
              <text x="460" y="87" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold">
                🌧️ AMORTIGUAMIENTO: 73,000 L RETENIDOS
              </text>
            </g>
          )}

          {/* 5. Hotspot interactivo activo (Tooltip flotante) */}
          {activeHotspot && hotspotDetails[activeHotspot] && (
            <g transform="translate(250, 20)">
              <rect width="400" height="70" rx="10" fill="#0f172a" stroke="#10b981" strokeWidth="1.5" filter="drop-shadow(0 4px 10px rgba(0,0,0,0.5))" />
              <text x="15" y="22" fill="#34d399" fontSize="11" fontWeight="bold">
                {hotspotDetails[activeHotspot].tag}
              </text>
              <text x="15" y="40" fill="#f8fafc" fontSize="12" fontWeight="bold">
                {hotspotDetails[activeHotspot].title}
              </text>
              <text x="15" y="58" fill="#cbd5e1" fontSize="10">
                {hotspotDetails[activeHotspot].desc.substring(0, 72)}...
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Selector de puntos clave para jurados */}
      <div className="pt-2">
        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Detalle de los componentes de ingeniería urbana:</span>
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {Object.entries(hotspotDetails).map(([key, item]) => (
            <button
              key={key}
              onClick={() => setActiveHotspot(activeHotspot === key ? null : key)}
              className={`p-2 rounded-xl text-left border text-xs transition-all flex flex-col justify-between ${
                activeHotspot === key
                  ? 'border-emerald-500 bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300 hover:border-emerald-400'
              }`}
            >
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block truncate">
                {item.tag.split('•')[0]}
              </span>
              <span className="font-semibold text-[11px] leading-tight mt-1 line-clamp-2">
                {item.title}
              </span>
            </button>
          ))}
        </div>

        {/* Panel explicativo expandido si hay un hotspot seleccionado */}
        {activeHotspot && hotspotDetails[activeHotspot] && (
          <div className="mt-3 p-3.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 text-xs flex items-start justify-between gap-3 animate-fade-in">
            <div>
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                {hotspotDetails[activeHotspot].tag}
              </span>
              <h5 className="font-bold text-slate-900 dark:text-slate-100 text-sm mt-0.5">
                {hotspotDetails[activeHotspot].title}
              </h5>
              <p className="text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                {hotspotDetails[activeHotspot].desc}
              </p>
            </div>
            <button
              onClick={() => setActiveHotspot(null)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs px-2 py-1 rounded-md"
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
