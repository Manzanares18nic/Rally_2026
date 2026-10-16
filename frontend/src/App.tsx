import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  fetchDashboard,
  fetchTelemetry,
  triggerSimulatorScenario,
  sendWhatsAppAlert,
  type DashboardSummary,
  type TelemetryPoint,
  type WhatsAppAlertResponse,
} from './services/api';
import { Header } from './components/Header';
import { MetricCards } from './components/MetricCards';
import { TelemetryChart } from './components/TelemetryChart';
import { JurorSimulator, type ScenarioType } from './components/JurorSimulator';
import { WhatsAppModal } from './components/WhatsAppModal';
import { ApiConfigModal } from './components/ApiConfigModal';
import { CheckCircle, AlertCircle, WifiOff } from 'lucide-react';

export default function App() {
  // Application State
  const [dashboard, setDashboard] = useState<DashboardSummary>({
    reservoir_name: 'Reservorio Barrial Tiscapa - Sector Piloto',
    location: { lat: 12.135, lng: -86.270 },
    current_level_pct: 100.0,
    current_level_cm: 300.0,
    max_capacity_cm: 300.0,
    status: 'ROJO',
    rise_rate_pct_30m: 60.3,
    sensor_status: 'ONLINE',
    last_updated: new Date().toISOString(),
  });

  const [telemetry, setTelemetry] = useState<TelemetryPoint[]>([]);
  const [currentScenario, setCurrentScenario] = useState<ScenarioType>('CRECIDA_SUBITA');
  const [isBackendLive, setIsBackendLive] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isTriggeringScenario, setIsTriggeringScenario] = useState<boolean>(false);
  const [isSendingWhatsApp, setIsSendingWhatsApp] = useState<boolean>(false);

  // Modals & Notifications
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState<boolean>(false);
  const [whatsAppData, setWhatsAppData] = useState<WhatsAppAlertResponse | null>(null);
  const [isApiModalOpen, setIsApiModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Configurable base URL
  const [apiUrl, setApiUrl] = useState<string>(
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) ||
      'http://localhost:8000/api/v1'
  );

  const toastTimerRef = useRef<number | null>(null);

  const showToast = (message: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMessage(message);
    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // ---------------------------------------------------------------------------
  // Polling data function (Dashboard + Telemetry)
  // ---------------------------------------------------------------------------
  const pollData = useCallback(async () => {
    try {
      const [dashRes, telemRes] = await Promise.all([
        fetchDashboard(apiUrl),
        fetchTelemetry(30, apiUrl),
      ]);

      setDashboard(dashRes.data);
      if (telemRes.data && telemRes.data.length > 0) {
        setTelemetry(telemRes.data);
      }
      setIsBackendLive(dashRes.isLive);
    } catch (err) {
      console.warn('Polling error (using safe fallback):', err);
      setIsBackendLive(false);
    }
  }, [apiUrl]);

  // Initial load & Polling every 2 seconds (setInterval)
  useEffect(() => {
    // Initial fetch
    pollData();

    // 2-second interval
    const interval = setInterval(() => {
      pollData();
    }, 2000);

    return () => clearInterval(interval);
  }, [pollData]);

  // Manual Refresh
  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await pollData();
    setTimeout(() => setIsRefreshing(false), 500);
    showToast('Telemetría actualizada');
  };

  // ---------------------------------------------------------------------------
  // Juror Trigger handler
  // ---------------------------------------------------------------------------
  const handleTriggerScenario = async (scenario: ScenarioType) => {
    setIsTriggeringScenario(true);
    setCurrentScenario(scenario);

    try {
      const result = await triggerSimulatorScenario(scenario, apiUrl);
      if (result.dashboard) {
        setDashboard(result.dashboard);
      }
      showToast(`⚡ Escenario '${scenario}' activado`);
      // Trigger an immediate poll update
      setTimeout(() => pollData(), 300);
    } catch (err) {
      console.error('Trigger error:', err);
      showToast(`Escenario activado en simulador local`);
    } finally {
      setIsTriggeringScenario(false);
    }
  };

  // ---------------------------------------------------------------------------
  // WhatsApp Alert handler
  // ---------------------------------------------------------------------------
  const handleSendWhatsApp = async () => {
    setIsSendingWhatsApp(true);
    try {
      const result = await sendWhatsAppAlert('alt-01', apiUrl);
      setWhatsAppData(result);
      setIsWhatsAppModalOpen(true);

      // Requirement: abrir la URL 'whatsapp_direct_link' devuelta en una pestaña nueva con window.open()
      if (result.whatsapp_direct_link) {
        try {
          window.open(result.whatsapp_direct_link, '_blank', 'noopener,noreferrer');
        } catch (popupErr) {
          console.warn('Popup blocked, available inside modal:', popupErr);
        }
      }

      showToast('📲 Alerta WhatsApp despachada');
    } catch (err) {
      console.error('WhatsApp dispatch error:', err);
      showToast('Error al despachar alerta');
    } finally {
      setIsSendingWhatsApp(false);
    }
  };

  // Test backend connection for modal
  const handleTestBackend = async (): Promise<boolean> => {
    const res = await fetchDashboard(apiUrl);
    setIsBackendLive(res.isLive);
    return res.isLive;
  };

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 flex flex-col justify-between selection:bg-cyan-500 selection:text-black">
      {/* Background subtle telemetry grid effect */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(#38bdf8 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Main Container */}
      <main className="relative z-10 max-w-[1440px] w-full mx-auto px-4 py-4 md:py-6 space-y-4">
        {/* Offline Fallback Warning banner (compact & informative) */}
        {!isBackendLive && (
          <div className="w-full bg-[#1A1308] border border-[#4D330A] rounded-xl px-4 py-2 flex items-center justify-between text-xs text-amber-200">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0"></span>
              <p>
                <strong>Modo Simulación Fallback Activo:</strong> El backend FastAPI no está respondiendo en{' '}
                <code className="text-amber-300 font-mono bg-amber-950/70 px-1 py-0.5 rounded">
                  {apiUrl}
                </code>
                . Todas las métricas, gráficas y disparadores están operando con el simulador local 100% funcional.
              </p>
            </div>
            <button
              onClick={() => setIsApiModalOpen(true)}
              className="px-2.5 py-1 rounded-lg bg-amber-900/60 hover:bg-amber-800 text-amber-100 font-medium text-[11px] shrink-0 ml-3 transition-colors"
            >
              Conectar Backend
            </button>
          </div>
        )}

        {/* 1. Header */}
        <Header
          dashboard={dashboard}
          isBackendLive={isBackendLive}
          onOpenSettings={() => setIsApiModalOpen(true)}
          onRefresh={handleManualRefresh}
          isRefreshing={isRefreshing}
        />

        {/* 2. Top Metric Cards (4 Columns) */}
        <MetricCards
          dashboard={dashboard}
          currentScenario={currentScenario}
          onSendWhatsApp={handleSendWhatsApp}
          isSendingWhatsApp={isSendingWhatsApp}
        />

        {/* 3. Main Hydrometric Dashboard (Two Columns) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Column: Real-time Area Chart (approx 68% - col-span-8) */}
          <div className="lg:col-span-8">
            <TelemetryChart telemetry={telemetry} dashboard={dashboard} />
          </div>

          {/* Right Column: Juror Simulator (approx 32% - col-span-4) */}
          <div className="lg:col-span-4">
            <JurorSimulator
              currentScenario={currentScenario}
              onTriggerScenario={handleTriggerScenario}
              isLoading={isTriggeringScenario}
            />
          </div>
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="relative z-10 w-full max-w-[1440px] mx-auto px-4 py-4 text-center text-xs text-slate-400 font-mono flex flex-col sm:flex-row items-center justify-between border-t border-[#121B2F] mt-4">
        <span>Reservorio Barrial Tiscapa · Sistema de Alerta Temprana</span>
        <span className="text-slate-400">Rally LATAM 2026 — Reto 05</span>
      </footer>

      {/* WhatsApp Modal */}
      <WhatsAppModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        data={whatsAppData}
      />

      {/* API Config Modal */}
      <ApiConfigModal
        isOpen={isApiModalOpen}
        onClose={() => setIsApiModalOpen(false)}
        currentUrl={apiUrl}
        onSaveUrl={(newUrl) => {
          setApiUrl(newUrl);
          pollData();
        }}
        isLive={isBackendLive}
        onTestConnection={handleTestBackend}
      />

      {/* Interactive Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-3 duration-200">
          <div className="px-4 py-3 rounded-xl bg-[#0F172A] border border-[#233554] text-white text-xs font-mono shadow-2xl flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}
