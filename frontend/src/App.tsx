import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  fetchDashboard,
  fetchTelemetry,
  fetchIncidents,
  triggerSimulatorScenario,
  sendWhatsAppAlert,
  type DashboardSummary,
  type TelemetryPoint,
  type WhatsAppAlertResponse,
  type Incident,
} from './services/api';
import { Header } from './components/Header';
import { CommunityView } from './components/CommunityView';
import { CommunityForum } from './components/CommunityForum';
import { AdminDashboard } from './components/AdminDashboard';
import { GreenInfrastructureView } from './components/GreenInfrastructureView';
import { SatelliteMapView } from './components/SatelliteMapView';
import { WhatsAppModal } from './components/WhatsAppModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { IncidentReportModal } from './components/IncidentReportModal';
import { ProjectPitchModal } from './components/ProjectPitchModal';
import { type ScenarioType } from './components/JurorSimulator';

export default function App() {
  // Tema (Modo Claro / Oscuro)
  const [isDark, setIsDark] = useState<boolean>(() => {
    return localStorage.getItem('theme') !== 'light';
  });

  // Navegación principal: 'community' | 'forum' | 'green' | 'map' | 'admin'
  const [currentTab, setCurrentTab] = useState<'community' | 'forum' | 'green' | 'map' | 'admin'>('community');

  // Autenticación de Administrador
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return Boolean(localStorage.getItem('reservorio_admin_token'));
  });
  const [adminName, setAdminName] = useState<string | null>(() => {
    return localStorage.getItem('reservorio_admin_name');
  });

  // Datos en vivo del sistema
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

  // Nodo seleccionado y reportes ciudadanos
  const [selectedNode, setSelectedNode] = useState<{
    id: string;
    name: string;
    lat: number;
    lng: number;
  }>({
    id: 'node-01',
    name: 'Nodo 01: Cauce La Maravilla (Sabana Grande)',
    lat: 12.1249,
    lng: -86.1761,
  });
  const [incidents, setIncidents] = useState<Incident[]>([]);

  // Modales
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState<boolean>(false);
  const [whatsAppData, setWhatsAppData] = useState<WhatsAppAlertResponse | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [isPitchModalOpen, setIsPitchModalOpen] = useState<boolean>(false);
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

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Polling continuo
  const pollData = useCallback(async () => {
    try {
      const [dashRes, telemRes, incs] = await Promise.all([
        fetchDashboard(apiUrl),
        fetchTelemetry(30, apiUrl),
        fetchIncidents(apiUrl),
      ]);
      setDashboard(dashRes.data);
      if (telemRes.data && telemRes.data.length > 0) {
        setTelemetry(telemRes.data);
      }
      if (incs) {
        setIncidents(incs);
      }
      setIsBackendLive(dashRes.isLive);
    } catch {
      setIsBackendLive(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    pollData();
    const interval = setInterval(pollData, 1000);
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
      await pollData();
      showToast(`Escenario aplicado: ${scenario}`);
    } catch {
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
    } catch {
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
    setCurrentTab('admin');
    showToast(`Sesión iniciada: ${name}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('reservorio_admin_token');
    localStorage.removeItem('reservorio_admin_name');
    setIsAdminLoggedIn(false);
    setAdminName(null);
    setCurrentTab('community');
    showToast('Sesión cerrada');
  };

  const handleOpenLogin = () => {
    if (isAdminLoggedIn) {
      setCurrentTab('admin');
    } else {
      setIsLoginModalOpen(true);
    }
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${
        isDark ? 'bg-[#060b13] text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      <div className="max-w-5xl mx-auto px-4 py-5 space-y-5">
        {/* Encabezado con paleta verde/azul institucional */}
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
          onOpenPitch={() => setIsPitchModalOpen(true)}
        />

        {/* Barra de navegación por módulos temáticos */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2 flex-wrap gap-2">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-200/60 dark:bg-slate-800/60 text-xs">
            <button
              onClick={() => setCurrentTab('community')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                currentTab === 'community'
                  ? 'bg-white dark:bg-slate-900 text-[#00A8E8] shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Comunidad
            </button>

            <button
              onClick={() => setCurrentTab('forum')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                currentTab === 'forum'
                  ? 'bg-white dark:bg-slate-900 text-[#00A8E8] shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Foro Vecinal
            </button>

            <button
              onClick={() => setCurrentTab('green')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                currentTab === 'green'
                  ? 'bg-white dark:bg-slate-900 text-[#70C167] shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Infraestructura Verde
            </button>

            <button
              onClick={() => setCurrentTab('map')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                currentTab === 'map'
                  ? 'bg-white dark:bg-slate-900 text-[#00A8E8] shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Mapa Satelital
            </button>

            <button
              onClick={() => setCurrentTab('admin')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                currentTab === 'admin'
                  ? 'bg-white dark:bg-slate-900 text-[#00A8E8] shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <span>Monitoreo Técnico</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#00A8E8]/15 text-[#00A8E8] font-bold border border-[#00A8E8]/30">
                IoT
              </span>
            </button>
          </div>

          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            Cauce La Maravilla • Pista Sabana Grande
          </span>
        </div>

        {/* RENDERIZADO DEL MÓDULO ACTIVO */}
        {currentTab === 'community' && (
          <CommunityView
            dashboard={dashboard}
            onOpenReportModal={() => setIsReportModalOpen(true)}
            onSendWhatsApp={handleSendWhatsApp}
            isSendingWhatsApp={isSendingWhatsApp}
            onGoToMap={() => setCurrentTab('map')}
            onGoToForum={() => setCurrentTab('forum')}
            isDark={isDark}
          />
        )}

        {currentTab === 'forum' && <CommunityForum isDark={isDark} />}

        {currentTab === 'green' && <GreenInfrastructureView isDark={isDark} />}

        {currentTab === 'map' && (
          <SatelliteMapView
            dashboard={dashboard}
            isDark={isDark}
            selectedNodeCoords={{
              lat: selectedNode.lat,
              lng: selectedNode.lng,
              name: selectedNode.name,
            }}
            incidents={incidents}
          />
        )}

        {currentTab === 'admin' && (
          <AdminDashboard
            dashboard={dashboard}
            telemetry={telemetry}
            currentScenario={currentScenario}
            onTriggerScenario={handleTriggerScenario}
            isLoadingScenario={isTriggeringScenario}
            isDark={isDark}
            selectedNodeId={selectedNode.id}
            onSelectNode={(node) => {
              setSelectedNode(node);
              showToast(`Nodo seleccionado: ${node.name}`);
            }}
            onViewOnMap={() => setCurrentTab('map')}
            onSendCustomNotification={(msg) => {
              showToast('Alerta comunitaria despachada a la red de vigías');
            }}
          />
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
        onSuccess={(msg) => {
          showToast(msg);
          pollData();
        }}
      />

      <ProjectPitchModal
        isOpen={isPitchModalOpen}
        onClose={() => setIsPitchModalOpen(false)}
        isDark={isDark}
      />

      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs shadow-lg border border-slate-700">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
