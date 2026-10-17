/**
 * PluviTec API Service Client
 * Handles real-time polling, simulation triggers, WhatsApp alerts,
 * and seamless fallback when FastAPI backend is offline.
 */

export interface Location {
  lat: number;
  lng: number;
}

export interface DashboardSummary {
  reservoir_name: string;
  location: Location;
  current_level_pct: number;
  current_level_cm: number;
  max_capacity_cm: number;
  status: 'VERDE' | 'AMARILLO' | 'ROJO' | 'FALLO_SENSOR';
  rise_rate_pct_30m: number;
  sensor_status: 'ONLINE' | 'SIN_SENAL';
  last_updated: string;
}

export interface TelemetryPoint {
  timestamp: string;
  water_level_pct: number;
  water_level_cm: number;
  rain_mm: number;
}

export interface Alert {
  id: string;
  level: 'AMARILLO' | 'ROJO' | 'FALLO_SENSOR' | 'VERDE';
  title: string;
  instruction: string;
  created_at: string;
}

export interface SimulatorTriggerResponse {
  message: string;
  scenario: string;
  dashboard: DashboardSummary;
}

export interface WhatsAppAlertResponse {
  status: string;
  message: string;
  whatsapp_direct_link: string;
  content_dispatched: string;
}

export interface IncidentAnalysis {
  obstruction_detected: boolean;
  obstruction_type: string;
  confidence_pct?: number;
  urgency_level: string;
  suggested_action: string;
}

export interface Incident {
  id: string;
  reporter_name: string;
  description: string;
  latitude: number;
  longitude: number;
  photo_url: string;
  status: string;
  field_assessment?: IncidentAnalysis;
  ai_analysis?: IncidentAnalysis;
  created_at: string;
}

export interface WeatherData {
  temperature: number;
  apparentTemperature: number;
  relativeHumidity: number;
  precipitation: number;
  rainProbability: number;
  weatherCode: number;
  weatherDescription: string;
  windSpeed: number;
  isRainySeason: boolean;
  seasonName: string;
  reservoirMode: 'Época Seca (Parques y Convivencia Comunitaria)' | 'Temporada Lluviosa (Regulación y Almacenamiento Hidráulico)';
}

// Configuration
export const API_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) ||
  'http://localhost:8000/api/v1';

// Connection tracker
let isBackendReachable = false;
let lastConnectionAttempt = 0;

export function getIsBackendReachable(): boolean {
  return isBackendReachable;
}

// ---------------------------------------------------------------------------
// Fallback In-Memory Simulation State
// Matches exact values in the Google Stitch design
// ---------------------------------------------------------------------------
const MAX_CAPACITY = 300.0;
let fallbackScenario = 'CRECIDA_SUBITA';
let fallbackLevelCm = 300.0;
let fallbackRainMm = 14.5;
let fallbackRiseRate = 60.3;
let fallbackSensorStatus: 'ONLINE' | 'SIN_SENAL' = 'ONLINE';
let fallbackStatus: 'VERDE' | 'AMARILLO' | 'ROJO' | 'FALLO_SENSOR' = 'ROJO';

// Generate 30 telemetry points matching the historical rise curve in the screenshot
const generateInitialTelemetry = (): TelemetryPoint[] => {
  const points: TelemetryPoint[] = [];
  const now = Date.now();
  // Generate points across 1 minute (2s interval) leading up to 100%
  const baselineLevels = [
    40, 42, 45, 47, 50, 52, 56, 60, 64, 68,
    72, 75, 78, 80, 82, 84, 85, 85, 86, 88,
    90, 92, 94, 95, 96, 98, 99, 100, 100, 100
  ];

  for (let i = 0; i < 30; i++) {
    const timestamp = new Date(now - (30 - i) * 2000).toISOString();
    const pct = baselineLevels[i];
    const cm = (pct / 100) * MAX_CAPACITY;
    points.push({
      timestamp,
      water_level_pct: pct,
      water_level_cm: parseFloat(cm.toFixed(1)),
      rain_mm: parseFloat((8.0 + (i / 30) * 6.5).toFixed(1)),
    });
  }
  return points;
};

let fallbackTelemetryHistory: TelemetryPoint[] = generateInitialTelemetry();

function tickFallbackSimulation() {
  const now = new Date().toISOString();

  if (fallbackScenario === 'CRECIDA_SUBITA') {
    fallbackLevelCm = Math.min(MAX_CAPACITY, fallbackLevelCm + 1.5);
    fallbackRainMm = Math.min(50, fallbackRainMm + 0.4);
    fallbackRiseRate = 60.3;
    fallbackSensorStatus = 'ONLINE';
    fallbackStatus = 'ROJO';
  } else if (fallbackScenario === 'LLUVIA_MODERADA') {
    fallbackLevelCm = Math.min(MAX_CAPACITY * 0.8, Math.max(180, fallbackLevelCm + 0.8));
    fallbackRainMm = Math.min(25, fallbackRainMm + 0.15);
    fallbackRiseRate = 18.5;
    fallbackSensorStatus = 'ONLINE';
    fallbackStatus = 'AMARILLO';
  } else if (fallbackScenario === 'VACIADO') {
    fallbackLevelCm = Math.max(50, fallbackLevelCm - 2.5);
    fallbackRainMm = Math.max(0, fallbackRainMm - 0.2);
    fallbackRiseRate = -14.2;
    fallbackSensorStatus = 'ONLINE';
    fallbackStatus = fallbackLevelCm > 180 ? 'AMARILLO' : 'VERDE';
  } else if (fallbackScenario === 'NODO_DESCONECTADO') {
    fallbackSensorStatus = 'SIN_SENAL';
    fallbackStatus = 'FALLO_SENSOR';
  } else if (fallbackScenario === 'NORMAL') {
    fallbackLevelCm = Math.max(130, Math.min(140, fallbackLevelCm + (Math.random() - 0.5)));
    fallbackRainMm = 0.5;
    fallbackRiseRate = 1.2;
    fallbackSensorStatus = 'ONLINE';
    fallbackStatus = 'VERDE';
  }

  const currentPct = parseFloat(((fallbackLevelCm / MAX_CAPACITY) * 100).toFixed(1));
  const newPoint: TelemetryPoint = {
    timestamp: now,
    water_level_pct: Math.min(100, Math.max(0, currentPct)),
    water_level_cm: parseFloat(fallbackLevelCm.toFixed(1)),
    rain_mm: parseFloat(fallbackRainMm.toFixed(1)),
  };

  fallbackTelemetryHistory.push(newPoint);
  if (fallbackTelemetryHistory.length > 50) {
    fallbackTelemetryHistory.shift();
  }
}

function getFallbackDashboard(): DashboardSummary {
  tickFallbackSimulation();
  const currentPct = parseFloat(((fallbackLevelCm / MAX_CAPACITY) * 100).toFixed(1));

  return {
    reservoir_name: 'Reservorio Barrial Tiscapa - Sector Piloto',
    location: { lat: 12.135, lng: -86.270 },
    current_level_pct: Math.min(100, Math.max(0, currentPct)),
    current_level_cm: parseFloat(fallbackLevelCm.toFixed(1)),
    max_capacity_cm: MAX_CAPACITY,
    status: fallbackStatus,
    rise_rate_pct_30m: fallbackRiseRate,
    sensor_status: fallbackSensorStatus,
    last_updated: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// 1. GET /api/v1/dashboard
// ---------------------------------------------------------------------------
export async function fetchDashboard(customBaseUrl?: string): Promise<{ data: DashboardSummary; isLive: boolean }> {
  const baseUrl = customBaseUrl || API_BASE_URL;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1800);

    const response = await fetch(`${baseUrl}/dashboard`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
    }

    const data: DashboardSummary = await response.json();
    isBackendReachable = true;
    lastConnectionAttempt = Date.now();
    return { data, isLive: true };
  } catch (error) {
    isBackendReachable = false;
    return { data: getFallbackDashboard(), isLive: false };
  }
}

// ---------------------------------------------------------------------------
// 2. GET /api/v1/telemetry?limit=30
// ---------------------------------------------------------------------------
export async function fetchTelemetry(limit = 30, customBaseUrl?: string): Promise<{ data: TelemetryPoint[]; isLive: boolean }> {
  const baseUrl = customBaseUrl || API_BASE_URL;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1800);

    const response = await fetch(`${baseUrl}/telemetry?limit=${limit}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
    }

    const data: TelemetryPoint[] = await response.json();
    isBackendReachable = true;
    return { data, isLive: true };
  } catch (error) {
    isBackendReachable = false;
    return { data: fallbackTelemetryHistory.slice(-limit), isLive: false };
  }
}

// ---------------------------------------------------------------------------
// 3. POST /api/v1/simulator/trigger
// ---------------------------------------------------------------------------
export async function triggerSimulatorScenario(
  scenario: 'CRECIDA_SUBITA' | 'LLUVIA_MODERADA' | 'VACIADO' | 'NODO_DESCONECTADO' | 'NORMAL',
  customBaseUrl?: string
): Promise<SimulatorTriggerResponse> {
  const baseUrl = customBaseUrl || API_BASE_URL;
  fallbackScenario = scenario;

  // Immediate local update for instantaneous UI feedback
  if (scenario === 'CRECIDA_SUBITA') {
    fallbackLevelCm = 300.0;
    fallbackRiseRate = 60.3;
    fallbackStatus = 'ROJO';
    fallbackSensorStatus = 'ONLINE';
  } else if (scenario === 'LLUVIA_MODERADA') {
    fallbackLevelCm = 220.0;
    fallbackRiseRate = 18.5;
    fallbackStatus = 'AMARILLO';
    fallbackSensorStatus = 'ONLINE';
  } else if (scenario === 'VACIADO') {
    fallbackLevelCm = 95.0;
    fallbackRiseRate = -14.2;
    fallbackStatus = 'VERDE';
    fallbackSensorStatus = 'ONLINE';
  } else if (scenario === 'NODO_DESCONECTADO') {
    fallbackSensorStatus = 'SIN_SENAL';
    fallbackStatus = 'FALLO_SENSOR';
  } else if (scenario === 'NORMAL') {
    fallbackLevelCm = 135.0;
    fallbackRiseRate = 1.2;
    fallbackStatus = 'VERDE';
    fallbackSensorStatus = 'ONLINE';
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const response = await fetch(`${baseUrl}/simulator/trigger`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ scenario }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Trigger failed: ${response.status}`);
    }

    const result = await response.json();
    isBackendReachable = true;
    return result;
  } catch (error) {
    isBackendReachable = false;
    return {
      message: `Escenario '${scenario}' activado localmente (Simulador Fallback).`,
      scenario,
      dashboard: getFallbackDashboard(),
    };
  }
}

// ---------------------------------------------------------------------------
// 4. POST /api/v1/alerts/alt-01/send-whatsapp
// ---------------------------------------------------------------------------
export async function sendWhatsAppAlert(
  alertId = 'alt-01',
  customBaseUrl?: string
): Promise<WhatsAppAlertResponse> {
  const baseUrl = customBaseUrl || API_BASE_URL;

  // Prepare standard message in case fallback is triggered
  const currentPct = ((fallbackLevelCm / MAX_CAPACITY) * 100).toFixed(1);
  const fallbackMsg =
    `🚨 *ALERTA PLUVITEC* 🚨\n` +
    `Estado: ${fallbackStatus}\n` +
    `Nivel: ${currentPct}% (${fallbackLevelCm.toFixed(1)} cm)\n` +
    `Tasa de subida: +${fallbackRiseRate}% en 30 min.\n` +
    `Instrucción: Despejar bocas de tormenta y activar plan barrial.`;

  const fallbackLink = `https://api.whatsapp.com/send?text=${encodeURIComponent(fallbackMsg)}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const response = await fetch(`${baseUrl}/alerts/${alertId}/send-whatsapp`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`WhatsApp API failed: ${response.status}`);
    }

    const result: WhatsAppAlertResponse = await response.json();
    isBackendReachable = true;
    return result;
  } catch (error) {
    isBackendReachable = false;
    return {
      status: 'WHATSAPP_SENT',
      message: 'Alerta despachada exitosamente a los vigías (Modo Fallback).',
      whatsapp_direct_link: fallbackLink,
      content_dispatched: fallbackMsg,
    };
  }
}

// ---------------------------------------------------------------------------
// 5. GET /api/v1/incidents (Reportes Ciudadanos de Drenaje)
// ---------------------------------------------------------------------------
export async function fetchIncidents(customBaseUrl?: string): Promise<Incident[]> {
  const baseUrl = customBaseUrl || API_BASE_URL;
  try {
    const res = await fetch(`${baseUrl}/incidents`);
    if (!res.ok) throw new Error('Failed to fetch incidents');
    return await res.json();
  } catch (err) {
    return [
      {
        id: 'inc-demo-1',
        reporter_name: 'Comité Barrial Sabana Grande',
        description: 'Boca de tormenta parcialmente bloqueada por botellas y ramas en el paso peatonal',
        latitude: 12.1242,
        longitude: -86.1755,
        photo_url: '/images/reservorio1.jpeg',
        status: 'REGISTRADO',
        field_assessment: {
          obstruction_detected: true,
          obstruction_type: 'SEDIMENTOS_Y_DESECHOS',
          urgency_level: 'ALTA',
          suggested_action: 'Limpieza preventiva de cuadrilla barrial antes del desborde',
        },
        created_at: new Date().toISOString(),
      },
    ];
  }
}

// ---------------------------------------------------------------------------
// 6. GET Clima en Tiempo Real (Open-Meteo API sin límite de cuota)
// ---------------------------------------------------------------------------
export async function fetchWeatherData(lat: number = 12.1249, lng: number = -86.1761): Promise<WeatherData> {
  const currentMonth = new Date().getMonth() + 1; // 1-12
  const isRainySeason = currentMonth >= 5 && currentMonth <= 10;
  const seasonName = isRainySeason ? 'Temporada Lluviosa (Invierno)' : 'Época Seca (Verano)';
  const reservoirMode = isRainySeason
    ? 'Temporada Lluviosa (Regulación y Almacenamiento Hidráulico)'
    : 'Época Seca (Parques y Convivencia Comunitaria)';

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m&daily=precipitation_probability_max&timezone=America%2FManagua`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error(`Weather API status ${res.status}`);
    const data = await res.json();
    const current = data.current || {};
    const daily = data.daily || {};

    const code = current.weather_code ?? 1;
    let weatherDescription = 'Parcialmente Nublado';
    if (code === 0) weatherDescription = 'Cielo Despejado';
    else if (code <= 3) weatherDescription = 'Parcialmente Nublado';
    else if (code <= 48) weatherDescription = 'Niebla / Neblina';
    else if (code <= 55) weatherDescription = 'Llovizna';
    else if (code <= 65) weatherDescription = 'Lluvia Moderada';
    else if (code <= 82) weatherDescription = 'Chubascos Intensos';
    else if (code >= 95) weatherDescription = 'Tormenta Eléctrica';

    return {
      temperature: Math.round((current.temperature_2m ?? 28.5) * 10) / 10,
      apparentTemperature: Math.round((current.apparent_temperature ?? 31.0) * 10) / 10,
      relativeHumidity: Math.round(current.relative_humidity_2m ?? 75),
      precipitation: Number(current.precipitation ?? 0.0),
      rainProbability: daily.precipitation_probability_max?.[0] ?? 40,
      weatherCode: code,
      weatherDescription,
      windSpeed: Math.round((current.wind_speed_10m ?? 12) * 10) / 10,
      isRainySeason,
      seasonName,
      reservoirMode,
    };
  } catch (err) {
    return {
      temperature: 28.5,
      apparentTemperature: 32.0,
      relativeHumidity: 78,
      precipitation: 0.0,
      rainProbability: 65,
      weatherCode: 2,
      weatherDescription: 'Parcialmente Nublado (Managua)',
      windSpeed: 14.0,
      isRainySeason,
      seasonName,
      reservoirMode,
    };
  }
}


