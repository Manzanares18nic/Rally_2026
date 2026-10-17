import React, { useState } from 'react';
import {
  Radio,
  BatteryCharging,
  Wifi,
  Cpu,
  Bell,
  Send,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Layers,
  MapPin,
  ExternalLink,
  CloudRain,
  Users,
} from 'lucide-react';
import type { DashboardSummary } from '../services/api';
import { TelemetryChart } from './TelemetryChart';
import { JurorSimulator, type ScenarioType } from './JurorSimulator';

interface AdminDashboardProps {
  dashboard: DashboardSummary;
  telemetry: any[];
  currentScenario: ScenarioType;
  onTriggerScenario: (scenario: ScenarioType) => void;
  isLoadingScenario: boolean;
  isDark: boolean;
  onSendCustomNotification: (msg: string) => void;
  onSelectNode: (node: { id: string; name: string; lat: number; lng: number }) => void;
  selectedNodeId: string;
  onViewOnMap?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  dashboard,
  telemetry,
  currentScenario,
  onTriggerScenario,
  isLoadingScenario,
  isDark,
  onSendCustomNotification,
  onSelectNode,
  selectedNodeId,
  onViewOnMap,
}) => {
  const [activeAdminSubTab, setActiveAdminSubTab] = useState<'overview' | 'hardware' | 'network' | 'broadcast'>('overview');
  const [broadcastText, setBroadcastText] = useState(
    'Aviso Comunitario: El sistema de monitoreo de Sabana Grande informa que los niveles de agua se mantienen estables. Por favor mantener limpias las cunetas y rejillas frente a sus hogares.'
  );

  // Red de Nodos de Managua con coordenadas reales
  const networkNodes = [
    {
      id: 'node-01',
      name: 'Nodo 01: Cauce La Maravilla (Sabana Grande)',
      basin: 'Microcuenca Este • Distrito VI, Managua',
      lat: 12.1249,
      lng: -86.1761,
      status: 'Activo',
      sensor: 'Ultrasónico JSN-SR04T IP67',
      battery: '94%',
      voltage: '4.12 V',
      signal: '-72 dBm (LoRaWAN 915MHz)',
      waterLevel: `${dashboard.current_level_pct.toFixed(0)}%`,
      anomalies: 'Lecturas acústicas estables sin rebote falso',
      photo: '/images/reservorio1.jpeg',
    },
    {
      id: 'node-02',
      name: 'Nodo 02: Microrrepresa Barrial 31 de Diciembre',
      basin: 'Cuenca Larreynaga • Distrito VI, Managua',
      lat: 12.1485,
      lng: -86.2085,
      status: 'Activo',
      sensor: 'Ultrasónico Sellado + Pluviómetro',
      battery: '78%',
      voltage: '3.85 V',
      signal: '-84 dBm (LoRaWAN 915MHz)',
      waterLevel: '35%',
      anomalies: 'Sedimentación en fondo detectada',
      photo: '/images/reservorio2.jpeg',
    },
    {
      id: 'node-03',
      name: 'Nodo 03: Drenaje Laguneta Tiscapa Norte',
      basin: 'Subcuenca Central • Distrito I, Managua',
      lat: 12.1350,
      lng: -86.2700,
      status: 'Alerta de Batería',
      sensor: 'Ultrasónico + Enlace GSM SIM800L',
      battery: '18%',
      voltage: '3.42 V',
      signal: '-105 dBm (Intermitente)',
      waterLevel: '62%',
      anomalies: 'Pérdida de paquetes por batería baja',
      photo: '/images/reservorio3.jpg',
    },
  ];

  // Componentes electrónicos del Kit de Monitoreo Comunitario explicados de forma clara y accesible
  const hardwareComponents = [
    {
      name: 'Cerebro Electrónico de Bajo Consumo (ESP32)',
      role: '¿Qué hace?: Piensa, calcula qué tan rápido sube el agua y despacha los avisos día y noche sin fallar.',
      benefit: 'Beneficio para el barrio: Consume poquísima energía y sigue funcionando aunque se corte la luz en la comunidad.',
      image: '/images/esp32.jpg',
      badge: 'Cerebro Autónomo',
    },
    {
      name: 'Ojo Acústico Resistente al Agua (Sensor Ultrasónico)',
      role: '¿Qué hace?: Mide la altura del agua mediante ondas de sonido (como los murciélagos), sin tocar el agua sucia.',
      benefit: 'Beneficio para el barrio: Es completamente sellado e impermeable; no se oxida con el lodo ni se atasca con basura.',
      image: '/images/sensor_jsn.jpeg',
      badge: 'Totalmente Impermeable',
    },
    {
      name: 'Recolector de Lluvia (Pluviómetro Comunitario)',
      role: '¿Qué hace?: Cuenta cada gota que cae en el sector para anticipar crecidas antes de que el agua llegue al cauce.',
      benefit: 'Beneficio para el barrio: Nos da hasta 45 minutos de ventaja para actuar antes de que el nivel sea peligroso.',
      image: '/images/pluviometro.jpeg',
      badge: 'Anticipación de Lluvia',
    },
    {
      name: 'Panel Solar con Batería Recargable de Respaldo',
      role: '¿Qué hace?: Se alimenta con la luz solar durante el día y almacena energía para trabajar toda la noche.',
      benefit: 'Beneficio para el barrio: 100% autosuficiente; no requiere cables externos ni genera costos de electricidad a los vecinos.',
      image: '/images/solar_battery.jpeg',
      badge: 'Energía Solar Limpia',
    },
  ];

  const activeNode = networkNodes.find((n) => n.id === selectedNodeId) || networkNodes[0];

  const handleNodeChange = (nodeId: string) => {
    const node = networkNodes.find((n) => n.id === nodeId);
    if (node) {
      onSelectNode({ id: node.id, name: node.name, lat: node.lat, lng: node.lng });
    }
  };

  return (
    <div className="space-y-5">
      {/* Selector de nodo y sub-pestañas de administración */}
      <div
        className={`rounded-2xl border p-4 transition-all shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-3 ${
          isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <Building2 className="w-4 h-4 text-[#00A8E8]" />
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Punto de Monitoreo Comunitario e Institucional
          </span>
        </div>

        {/* Selector de reservorios de Managua */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <label className="text-[11px] text-slate-500 dark:text-slate-400 shrink-0">
            Ubicación del equipo:
          </label>
          <select
            value={selectedNodeId}
            onChange={(e) => handleNodeChange(e.target.value)}
            className="w-full md:w-auto px-3 py-1.5 text-xs font-medium rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#00A8E8]"
          >
            {networkNodes.map((node) => (
              <option key={node.id} value={node.id} className="dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                {node.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Sub-navegación administrativa clara y entendible */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 flex-wrap">
        <button
          onClick={() => setActiveAdminSubTab('overview')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
            activeAdminSubTab === 'overview'
              ? 'bg-[#00A8E8]/15 text-[#00A8E8] border border-[#00A8E8]/40 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-transparent'
          }`}
        >
          Gráfica y Simulación
        </button>

        <button
          onClick={() => setActiveAdminSubTab('hardware')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
            activeAdminSubTab === 'hardware'
              ? 'bg-[#70C167]/15 text-[#70C167] border border-[#70C167]/40 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-transparent'
          }`}
        >
          Componentes del Equipo
        </button>

        <button
          onClick={() => setActiveAdminSubTab('network')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
            activeAdminSubTab === 'network'
              ? 'bg-[#00A8E8]/15 text-[#00A8E8] border border-[#00A8E8]/40 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-transparent'
          }`}
        >
          Fotos del Terreno
        </button>

        <button
          onClick={() => setActiveAdminSubTab('broadcast')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
            activeAdminSubTab === 'broadcast'
              ? 'bg-[#D81B60]/15 text-[#D81B60] border border-[#D81B60]/40 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-transparent'
          }`}
        >
          Avisar a la Comunidad
        </button>
      </div>

      {/* 1. VISTA OVERVIEW (DIAGNÓSTICO ESP32 + GRÁFICA + SIMULADOR) */}
      {activeAdminSubTab === 'overview' && (
        <div className="space-y-4">
          {/* Tarjetas de Diagnóstico del nodo activo */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div
              className={`p-3.5 rounded-2xl border transition-all ${
                isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center gap-1.5 text-[11px] text-[#70C167] font-semibold">
                <BatteryCharging className="w-3.5 h-3.5 text-[#70C167]" />
                <span>Energía y Batería</span>
              </div>
              <p className="text-lg font-extrabold mt-1 text-slate-900 dark:text-slate-100">
                {activeNode.battery}
              </p>
              <span className="text-[10px] text-[#70C167] font-medium block mt-0.5">
                {activeNode.voltage} • Panel solar cargando
              </span>
            </div>

            <div
              className={`p-3.5 rounded-2xl border transition-all ${
                isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center gap-1.5 text-[11px] text-[#00A8E8] font-semibold">
                <Wifi className="w-3.5 h-3.5 text-[#00A8E8]" />
                <span>Señal del Equipo</span>
              </div>
              <p className="text-lg font-extrabold mt-1 text-slate-900 dark:text-slate-100">
                Buena ({activeNode.signal.split(' ')[0]})
              </p>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                Transmisión activa sin cortes
              </span>
            </div>

            <div
              className={`p-3.5 rounded-2xl border transition-all ${
                isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center gap-1.5 text-[11px] text-[#00A8E8] font-semibold">
                <Cpu className="w-3.5 h-3.5 text-[#00A8E8]" />
                <span>Sensor de Agua</span>
              </div>
              <p className="text-xs font-bold mt-1 text-slate-900 dark:text-slate-100 truncate">
                Ojo Sonoro Sellado
              </p>
              <span className="text-[10px] text-[#70C167] font-medium block mt-0.5">
                Resistente a lodo y lluvia
              </span>
            </div>

            <div
              className={`p-3.5 rounded-2xl border transition-all ${
                isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center gap-1.5 text-[11px] text-[#70C167] font-semibold">
                <Radio className="w-3.5 h-3.5 text-[#70C167]" />
                <span>Estado de Mediciones</span>
              </div>
              <p className="text-xs font-bold mt-1 text-slate-900 dark:text-slate-100 truncate">
                Lecturas Confiables
              </p>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                Muestreo continuo cada segundo
              </span>
            </div>
          </div>

          {/* Gráfica y Simulador en 2 columnas */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-7">
              <TelemetryChart
                telemetry={telemetry}
                dashboard={dashboard}
                isDark={isDark}
                currentScenario={currentScenario}
              />
            </div>
            <div className="lg:col-span-5">
              <JurorSimulator
                currentScenario={currentScenario}
                onTriggerScenario={onTriggerScenario}
                isLoading={isLoadingScenario}
                isDark={isDark}
              />
            </div>
          </div>
        </div>
      )}

      {/* 2. VISTA DE HARDWARE Y COMPONENTES ELECTRÓNICOS REALES ESP32 */}
      {activeAdminSubTab === 'hardware' && (
        <div className="space-y-4">
          <div
            className={`p-4 rounded-2xl border ${
              isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#70C167] inline-block" />
              <span>Cómo Funciona el Equipo de Medición en el Barrio</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Diseñado con piezas accesibles y duraderas para soportar sol fuerte, lodo y aguaceros tropicales sin fallar. Cada nodo cuesta menos de $45 USD y sus repuestos se consiguen en ferreterías locales de Managua.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {hardwareComponents.map((hw, idx) => (
              <div
                key={idx}
                className={`rounded-2xl border overflow-hidden shadow-xs flex flex-col justify-between ${
                  isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
                  <img src={hw.image} alt={hw.name} className="w-full h-full object-cover" />
                  <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#00A8E8] text-white shadow-sm">
                    {hw.badge}
                  </span>
                </div>
                <div className="p-4 space-y-2.5">
                  <h4 className="font-bold text-xs text-[#00A8E8]">{hw.name}</h4>
                  <p className="text-[11px] text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                    {hw.role}
                  </p>
                  <div className="p-2.5 rounded-xl bg-[#70C167]/10 border border-[#70C167]/30 text-[11px] text-[#70C167] font-semibold">
                    {hw.benefit}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. VISTA DE NODOS DE LA RED Y FOTOGRAFÍAS REALES DEL SITIO */}
      {activeAdminSubTab === 'network' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {networkNodes.map((n) => (
            <div
              key={n.id}
              className={`rounded-2xl border overflow-hidden shadow-xs transition-all ${
                n.id === selectedNodeId ? 'ring-2 ring-[#00A8E8]' : ''
              } ${isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'}`}
            >
              <div className="relative h-40 w-full overflow-hidden bg-slate-800">
                <img src={n.photo} alt={n.name} className="w-full h-full object-cover" />
                <span
                  className={`absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    n.status === 'Activo'
                      ? 'bg-[#70C167] text-white'
                      : 'bg-amber-600 text-white'
                  }`}
                >
                  {n.status}
                </span>
              </div>
              <div className="p-4 space-y-2">
                <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">{n.name}</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{n.basin}</p>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Nivel de llenado:</span>
                    <strong className="text-[#00A8E8]">{n.waterLevel}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Batería solar:</span>
                    <span className="text-slate-700 dark:text-slate-300">{n.battery}</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    handleNodeChange(n.id);
                    if (onViewOnMap) onViewOnMap();
                  }}
                  className="w-full mt-2 py-1.5 text-xs font-medium rounded-xl border border-[#00A8E8] text-[#00A8E8] hover:bg-[#00A8E8]/10 transition-colors flex items-center justify-center gap-1.5"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  {n.id === selectedNodeId ? 'Ver en Mapa Satelital →' : 'Seleccionar y Ver en Mapa →'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. VISTA DE DIFUSIÓN DE ALERTAS MASIVAS */}
      {activeAdminSubTab === 'broadcast' && (
        <div
          className={`rounded-2xl border p-6 transition-all shadow-xs max-w-2xl mx-auto space-y-4 ${
            isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Bell className="w-4 h-4 text-[#D81B60]" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                Avisos y Alertas Comunitarias
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Comunica avisos claros a los comités y familias del barrio. Puedes presionar una plantilla rápida o redactar un mensaje personalizado:
            </p>
          </div>

          {/* Plantillas rápidas para coordinadores */}
          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
              Plantillas rápidas de 1 clic:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() =>
                  setBroadcastText(
                    'Aviso Barrial: Todo se encuentra en calma. Los cauces y reservorios operan con normalidad y los drenajes están fluyendo sin obstáculos.'
                  )
                }
                className={`p-2.5 rounded-xl border text-left transition-all flex items-start gap-2.5 hover:border-[#70C167] ${
                  isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-[#70C167] shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    Todo en Calma (Normal)
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                    Cauce fluyendo con normalidad y tranquilidad.
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() =>
                  setBroadcastText(
                    'Aviso Preventivo: Se observan lluvias en la cuenca alta. Recomendamos mantener despejados los drenajes y evitar botar basura a las cunetas.'
                  )
                }
                className={`p-2.5 rounded-xl border text-left transition-all flex items-start gap-2.5 hover:border-[#00A8E8] ${
                  isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <CloudRain className="w-4 h-4 text-[#00A8E8] shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    Lluvia Iniciando (Precaución)
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                    Recordatorio vecinal para cuidar rejillas.
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() =>
                  setBroadcastText(
                    'Alerta Vecinal: El agua en el cauce ha subido al 80%. Por seguridad comunitaria, resguardar a niños y adultos mayores lejos de la orilla.'
                  )
                }
                className={`p-2.5 rounded-xl border text-left transition-all flex items-start gap-2.5 hover:border-[#D81B60] ${
                  isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <AlertTriangle className="w-4 h-4 text-[#D81B60] shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    Crecida de Agua (Alerta)
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                    Alerta preventiva ante aumento rápido del nivel.
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() =>
                  setBroadcastText(
                    'Convocatoria Barrial: Invitamos a los vecinos este sábado a una jornada comunitaria para limpiar hojas y sedimentos del reservorio.'
                  )
                }
                className={`p-2.5 rounded-xl border text-left transition-all flex items-start gap-2.5 hover:border-[#70C167] ${
                  isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <Users className="w-4 h-4 text-[#70C167] shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    Jornada de Limpieza Barrial
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                    Organización comunitaria y voluntariado.
                  </span>
                </div>
              </button>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
              Mensaje a difundir:
            </label>
            <textarea
              rows={3}
              value={broadcastText}
              onChange={(e) => setBroadcastText(e.target.value)}
              className="w-full p-3 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#00A8E8]"
            />
          </div>

          <button
            onClick={() => onSendCustomNotification(broadcastText)}
            className="w-full py-2.5 rounded-xl bg-[#D81B60] hover:bg-[#b0144d] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Enviar Aviso a la Comunidad</span>
          </button>
        </div>
      )}
    </div>
  );
};
