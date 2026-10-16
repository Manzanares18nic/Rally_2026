import React, { useState } from 'react';
import {
  Radio,
  BatteryCharging,
  Wifi,
  Cpu,
  Bell,
  Send,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Flame,
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
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  dashboard,
  telemetry,
  currentScenario,
  onTriggerScenario,
  isLoadingScenario,
  isDark,
  onSendCustomNotification,
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState('node-01');
  const [activeAdminSubTab, setActiveAdminSubTab] = useState<'overview' | 'nodes' | 'broadcast'>('overview');
  const [broadcastText, setBroadcastText] = useState(
    'Alerta Preventiva SINAPRED: Monitoreo activo en cuenca Sabana Grande ante núcleo de tormenta.'
  );

  // Red de Nodos de Managua (Acceso multicuenca)
  const networkNodes = [
    {
      id: 'node-01',
      name: 'Nodo 01: Cauce La Maravilla (Sabana Grande)',
      basin: 'Microcuenca Este • Distrito VI',
      status: 'Activo',
      sensor: 'Ultrasónico JSN-SR04T IP67',
      battery: '94%',
      voltage: '4.12 V',
      signal: '-72 dBm (LoRaWAN)',
      waterLevel: `${dashboard.current_level_pct.toFixed(0)}%`,
      anomalies: 'Sin anomalías acústicas',
      photo:
        'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'node-02',
      name: 'Nodo 02: Microrrepresa Barrial 31 de Diciembre',
      basin: 'Cuenca Larreynaga • Distrito VI',
      status: 'Activo',
      sensor: 'Ultrasónico + Pluviómetro',
      battery: '78%',
      voltage: '3.85 V',
      signal: '-84 dBm (LoRaWAN)',
      waterLevel: '35%',
      anomalies: 'Sedimentación en fondo detectada',
      photo:
        'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'node-03',
      name: 'Nodo 03: Drenaje Laguneta Tiscapa Norte',
      basin: 'Subcuenca Central • Distrito I',
      status: 'Alerta',
      sensor: 'Ultrasónico + GSM SIM800L',
      battery: '18%',
      voltage: '3.45 V',
      signal: '-105 dBm (Débil)',
      waterLevel: '62%',
      anomalies: 'Batería baja / Pérdida intermitente de paquetes',
      photo:
        'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=600&q=80',
    },
  ];

  const activeNode = networkNodes.find((n) => n.id === selectedNodeId) || networkNodes[0];

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
            onChange={(e) => setSelectedNodeId(e.target.value)}
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
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
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
          onClick={() => setActiveAdminSubTab('nodes')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors ${
            activeAdminSubTab === 'nodes'
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
          {/* Tarjetas de Diagnóstico de Hardware ESP32 del nodo activo */}
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
                {activeNode.voltage} • Panel solar cargando
              </span>
            </div>

            <div
              className={`p-3.5 rounded-2xl border transition-all ${
                isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                <span>Conectividad de Radio</span>
              </div>
              <p className="text-lg font-bold mt-1 text-slate-900 dark:text-slate-100">
                {activeNode.signal}
              </p>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                Enlace resiliente sin internet
              </span>
            </div>

            <div
              className={`p-3.5 rounded-2xl border transition-all ${
                isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                <Cpu className="w-3.5 h-3.5 text-emerald-600" />
                <span>Sensor Ultrasónico</span>
              </div>
              <p className="text-xs font-bold mt-1 text-slate-900 dark:text-slate-100 truncate">
                {activeNode.sensor}
              </p>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block mt-0.5">
                Respuesta acústica calibrada
              </span>
            </div>

            <div
              className={`p-3.5 rounded-2xl border transition-all ${
                isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                <Radio className="w-3.5 h-3.5 text-emerald-600" />
                <span>Salud del Nodo</span>
              </div>
              <p className="text-xs font-bold mt-1 text-slate-900 dark:text-slate-100 truncate">
                {activeNode.anomalies}
              </p>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                Frecuencia de muestreo: 3 seg
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

      {/* 2. VISTA DE NODOS DE LA RED Y FOTOGRAFÍAS REALES DEL SITIO */}
      {activeAdminSubTab === 'nodes' && (
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
                  onClick={() => setSelectedNodeId(n.id)}
                  className="w-full mt-2 py-1.5 text-xs font-medium rounded-xl border border-emerald-600 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                >
                  {n.id === selectedNodeId ? 'Monitoreando este sitio' : 'Seleccionar este sitio'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. VISTA DE DIFUSIÓN DE ALERTAS MASIVAS */}
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
            onClick={() => {
              onSendCustomNotification(broadcastText);
            }}
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
