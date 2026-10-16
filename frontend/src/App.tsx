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
import { CommunityView } from './components/CommunityView';
import { TelemetryChart } from './components/TelemetryChart';
import { JurorSimulator, type ScenarioType } from './components/JurorSimulator';
import { SatelliteMapView } from './components/SatelliteMapView';
import { WhatsAppModal } from './components/WhatsAppModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { IncidentReportModal } from './components/IncidentReportModal';

export default function App() {
  // Theme State (Dark / Light)
  const [isDark, setIsDark] = useState<boolean>(() => {
    return localStorage.getItem('theme') !== 'light';
  });

  // Role View: 'community' (default) | 'admin'
  const [currentRole, setCurrentRole] = useState<'community' | 'admin'>('community');
  // Sub-tab when in Admin view: 'telemetry' | 'map'
  const [adminTab, setAdminTab] = useState<'telemetry' | 'map'>('telemetry');

  // Admin Auth State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return Boolean(localStorage.getItem('reservorio_admin_token'));
  });
  const [adminName, setAdminName] = useState<string | null>(() => {
    return localStorage.getItem('reservorio_admin_name');
  });

  // Application Data State
  const [dashboard, setDashboard] = useState<DashboardSummary>({
    reservoir_name: 'Cauce La Maravilla & Pista Sabana Grande',
    location: { lat: 12.1249, lng: -86.1761 },
    current_level_pct: 40.0,
    current_level_cm: 120.0,
    max_capacity_cm: 300.0,
    status: 'VERDE',
    rise_rate_pct_30m: 0.0,
    sensor_status: 'ONLINE',
    last_updated: new Date().toISOString(),
  });

  const [telemetry, setTelemetry] = useState<TelemetryPoint[]>([]);
  const [currentScenario, setCurrentScenario] = useState<ScenarioType>('NORMAL');
  const [isBackendLive, setIsBackendLive] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isTriggeringScenario, setIsTriggeringScenario] = useState<boolean>(false);
  const [isSendingWhatsApp, setIsSendingWhatsApp] = useState<boolean>(false);

  // Modals
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState<boolean>(false);
  const [whatsAppData, setWhatsAppData] = useState<WhatsAppAlertResponse | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const apiUrl =
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) ||
    'http://localhost:8000/api/v1';

  const toastTimerRef = useRef<number | null>(null);

  const showToast = (message: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMessage(message);
    toastTimerRef.current = window.setTimeout(() => setToastMessage(null), 3000);
  };

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      localStorage.setItem('theme', next ? 'dark' : 'light');
      return next;
    });
  };

  // Sync theme with DOM document
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Polling data
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
    } catch {
      setIsBackendLive(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    pollData();
    const interval = setInterval(pollData, 2500);
    return () => clearInterval(interval);
  }, [pollData]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await pollData();
    setTimeout(() => setIsRefreshing(false), 400);
  };

  const handleTriggerScenario = async (scenario: ScenarioType) => {
    setIsTriggeringScenario(true);
    setCurrentScenario(scenario);
    try {
      const res = await triggerSimulatorScenario(scenario, apiUrl);
      setDashboard(res.dashboard);
      showToast(`Escenario aplicado: ${scenario}`);
    } catch (err: any) {
      showToast('Error al aplicar escenario');
    } finally {
      setIsTriggeringScenario(false);
    }
  };

  const handleSendWhatsApp = async () => {
    setIsSendingWhatsApp(true);
    try {
      const res = await sendWhatsAppAlert('alert-latest', apiUrl);
      setWhatsAppData(res);
      setIsWhatsAppModalOpen(true);
    } catch (err: any) {
      showToast('No se pudo enviar alerta');
    } finally {
      setIsSendingWhatsApp(false);
    }
  };

  const handleLoginSuccess = (token: string, name: string) => {
    localStorage.setItem('reservorio_admin_token', token);
    localStorage.setItem('reservorio_admin_name', name);
    setIsAdminLoggedIn(true);
    setAdminName(name);
    setCurrentRole('admin');
    showToast(`Sesión iniciada como ${name}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('reservorio_admin_token');
    localStorage.removeItem('reservorio_admin_name');
    setIsAdminLoggedIn(false);
    setAdminName(null);
    setCurrentRole('community');
    showToast('Sesión de administrador cerrada');
  };

  const handleOpenLogin = () => {
    if (isAdminLoggedIn) {
      setCurrentRole('admin');
    } else {
      setIsLoginModalOpen(true);
    }
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${
        isDark ? 'bg-[#090d16] text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      <div className="max-w-5xl mx-auto px-4 py-5 space-y-5">
        {/* Header Superior Sobrio */}
        <Header
          dashboard={dashboard}
          isBackendLive={isBackendLive}
          onRefresh={handleManualRefresh}
          isRefreshing={isRefreshing}
          isAdminLoggedIn={isAdminLoggedIn}
          adminName={adminName}
          onOpenLogin={handleOpenLogin}
          onLogout={handleLogout}
          isDark={isDark}
          onToggleTheme={toggleTheme}
        />

        {/* Selector de Vista: Vecinos vs Administrador */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-200/60 dark:bg-slate-800/60 text-xs">
            <button
              onClick={() => setCurrentRole('community')}
              className={`px-3.5 py-1.5 rounded-lg font-medium transition-all ${
                currentRole === 'community'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Vista Comunitaria
            </button>

            {isAdminLoggedIn && (
              <button
                onClick={() => setCurrentRole('admin')}
                className={`px-3.5 py-1.5 rounded-lg font-medium transition-all ${
                  currentRole === 'admin'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                Panel de Monitoreo Técnico
              </button>
            )}
          </div>

          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            Cauce La Maravilla • Sabana Grande
          </span>
        </div>

        {/* CONTENIDO SEGÚN EL ROL SELECCIONADO */}
        {currentRole === 'community' ? (
          /* 1. VISTA DE LA COMUNIDAD: LIMPIA, DIRECTA, PREVENTIVA */
          <CommunityView
            dashboard={dashboard}
            onOpenReportModal={() => setIsReportModalOpen(true)}
            onSendWhatsApp={handleSendWhatsApp}
            isSendingWhatsApp={isSendingWhatsApp}
            onGoToMap={() => {
              if (isAdminLoggedIn) {
                setCurrentRole('admin');
                setAdminTab('map');
              } else {
                setIsReportModalOpen(true);
              }
            }}
            isDark={isDark}
          />
        ) : (
          /* 2. VISTA TÉCNICA / ADMINISTRADOR: TELEMETRÍA, GRÁFICAS Y SIMULADOR */
          <div className="space-y-4">
            {/* Sub-navegación técnica */}
            <div className="flex gap-2">
              <button
                onClick={() => setAdminTab('telemetry')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                  adminTab === 'telemetry'
                    ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-600 text-blue-700 dark:text-blue-300'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                Telemetría y Gráficas
              </button>
              <button
                onClick={() => setAdminTab('map')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                  adminTab === 'map'
                    ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-600 text-blue-700 dark:text-blue-300'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                Cartografía Satelital
              </button>
            </div>

            {adminTab === 'telemetry' ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-7">
                  <TelemetryChart telemetry={telemetry} dashboard={dashboard} isDark={isDark} />
                </div>
                <div className="lg:col-span-5">
                  <JurorSimulator
                    currentScenario={currentScenario}
                    onTriggerScenario={handleTriggerScenario}
                    isLoading={isTriggeringScenario}
                    isDark={isDark}
                  />
                </div>
              </div>
            ) : (
              <SatelliteMapView dashboard={dashboard} isDark={isDark} />
            )}
          </div>
        )}
      </div>

      {/* Modales */}
      <WhatsAppModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        data={whatsAppData}
      />

      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        apiUrl={apiUrl}
        isDark={isDark}
      />

      <IncidentReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        apiUrl={apiUrl}
        isDark={isDark}
        onSuccess={showToast}
      />

      {/* Toast discreto */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs shadow-lg border border-slate-700">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
