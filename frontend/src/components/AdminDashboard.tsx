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
    'Alerta Preventiva SINAPRED: Monitoreo activo en cuenca Sabana Grande ante núcleo de tormenta.'
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
      photo: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=600&q=80',
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
      photo: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=600&q=80',
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
      photo: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=600&q=80',
    },
  ];

  // Componentes electrónicos reales del Kit de Monitoreo Abierto
  const hardwareComponents = [
    {
      name: 'Microcontrolador ESP32-WROOM-32D',
      role: 'Procesamiento en borde y cálculo de tasa de subida',
      specs: 'Dual Core 240 MHz, Wi-Fi, Bluetooth BLE, ultra bajo consumo en Deep Sleep.',
      image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=500&q=80',
      badge: 'Cerebro IoT',
    },
    {
      name: 'Sensor Ultrasónico Impermeable JSN-SR04T',
      role: 'Medición acústica de distancia a la lámina de agua',
      specs: 'Sonda estanca IP67, alcance de 20 a 600 cm, resistente a humedad, lodo y vapores corrosivos.',
      image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=500&q=80',
      badge: 'Sensado Estanco IP67',
    },
    {
      name: 'Pluviómetro de Balancín Calibrado',
      role: 'Registro de precipitación acumulada en milímetros',
      specs: 'Resolución de 0.2 mm por balanceo, colector cónico con filtro contra insectos y hojas.',
      image: 'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?auto=format&fit=crop&w=500&q=80',
      badge: 'Pluviometría',
    },
    {
      name: 'Módulo de Alimentación Solar + Batería Li-ion 18650',
      role: 'Autonomía energética continua sin red eléctrica',
      specs: 'Panel monocristalino 6V 3W, circuito de carga TP4056 con protección contra sobretensión.',
      image: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=500&q=80',
      badge: 'Energía Solar',
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
          <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Puesto de Mando y Telemetría Multicuenca (Alcaldía / SINAPRED)
          </span>
        </div>

        {/* Selector de reservorios de Managua */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <label className="text-[11px] text-slate-500 dark:text-slate-400 shrink-0">
            Nodo en análisis:
          </label>
          <select
            value={selectedNodeId}
            onChange={(e) => handleNodeChange(e.target.value)}
            className="w-full md:w-auto px-3 py-1.5 text-xs font-medium rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-600"
          >
            {networkNodes.map((node) => (
              <option key={node.id} value={node.id} className="dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                {node.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Sub-navegación administrativa */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 flex-wrap">
        <button
          onClick={() => setActiveAdminSubTab('overview')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors ${
            activeAdminSubTab === 'overview'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-600'
              : 'text-slate-600 dark:text-slate-400 border border-transparent'
          }`}
        >
          Diagnóstico y Gráfica
        </button>

        <button
          onClick={() => setActiveAdminSubTab('hardware')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors ${
            activeAdminSubTab === 'hardware'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-600'
              : 'text-slate-600 dark:text-slate-400 border border-transparent'
          }`}
        >
          Hardware y Sensores ESP32
        </button>

        <button
          onClick={() => setActiveAdminSubTab('network')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors ${
            activeAdminSubTab === 'network'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-600'
              : 'text-slate-600 dark:text-slate-400 border border-transparent'
          }`}
        >
          Red de Nodos y Fotos de Sitio
        </button>

        <button
          onClick={() => setActiveAdminSubTab('broadcast')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors ${
            activeAdminSubTab === 'broadcast'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-600'
              : 'text-slate-600 dark:text-slate-400 border border-transparent'
          }`}
        >
          Difusión de Notificaciones Masivas
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
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                <BatteryCharging className="w-3.5 h-3.5 text-emerald-600" />
                <span>Energía y Batería</span>
              </div>
              <p className="text-lg font-bold mt-1 text-slate-900 dark:text-slate-100">
                {activeNode.battery}
              </p>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block mt-0.5">
                {activeNode.voltage} • Panel solar activo
              </span>
            </div>

            <div
              className={`p-3.5 rounded-2xl border transition-all ${
                isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                <span>Enlace LoRa / GSM</span>
              </div>
              <p className="text-lg font-bold mt-1 text-slate-900 dark:text-slate-100">
                {activeNode.signal.split(' ')[0]}
              </p>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                Radio de largo alcance resiliente
              </span>
            </div>

            <div
              className={`p-3.5 rounded-2xl border transition-all ${
                isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                <Cpu className="w-3.5 h-3.5 text-emerald-600" />
                <span>Sensor Estanco</span>
              </div>
              <p className="text-xs font-bold mt-1 text-slate-900 dark:text-slate-100 truncate">
                {activeNode.sensor}
              </p>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block mt-0.5">
                Compensado por temperatura
              </span>
            </div>

            <div
              className={`p-3.5 rounded-2xl border transition-all ${
                isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                <Radio className="w-3.5 h-3.5 text-emerald-600" />
                <span>Salud Acústica</span>
              </div>
              <p className="text-xs font-bold mt-1 text-slate-900 dark:text-slate-100 truncate">
                {activeNode.anomalies}
              </p>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                Muestreo cada 3 segundos
              </span>
            </div>
          </div>

          {/* Gráfica y Simulador en 2 columnas */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-7">
              <TelemetryChart telemetry={telemetry} dashboard={dashboard} isDark={isDark} />
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
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Arquitectura de Hardware Abierto del Nodo de Telemetría
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Diseño de bajo costo y alta durabilidad para resistir ambientes tropicales húmedos e inundaciones. Costo aproximado por nodo: &lt; $45 USD con repuestos comerciales en ferreterías y tiendas locales de Managua.
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
                  <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-700 text-white shadow-sm">
                    {hw.badge}
                  </span>
                </div>
                <div className="p-4 space-y-2">
                  <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">{hw.name}</h4>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                    {hw.role}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    {hw.specs}
                  </p>
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
                n.id === selectedNodeId ? 'ring-2 ring-emerald-600' : ''
              } ${isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'}`}
            >
              <div className="relative h-40 w-full overflow-hidden bg-slate-800">
                <img src={n.photo} alt={n.name} className="w-full h-full object-cover" />
                <span
                  className={`absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    n.status === 'Activo'
                      ? 'bg-emerald-600 text-white'
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
                    <strong className="text-emerald-700 dark:text-emerald-400">{n.waterLevel}</strong>
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
                  className="w-full mt-2 py-1.5 text-xs font-medium rounded-xl border border-emerald-600 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors flex items-center justify-center gap-1.5"
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
          className={`rounded-2xl border p-6 transition-all shadow-xs max-w-2xl mx-auto ${
            isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center gap-2 mb-3">
            <Bell className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
              Despacho de Alertas Comunitarias
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
            Emite una instrucción inmediata a los comités vecinales y vigías de Sabana Grande mediante los canales de WhatsApp y altavoz comunitario.
          </p>

          <textarea
            rows={3}
            value={broadcastText}
            onChange={(e) => setBroadcastText(e.target.value)}
            className="w-full p-3 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-600"
          />

          <button
            onClick={() => onSendCustomNotification(broadcastText)}
            className="mt-3 w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Emitir Alerta a la Red de Vigías</span>
          </button>
        </div>
      )}
    </div>
  );
};
