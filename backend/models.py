from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field

# --- AUTENTICACIÓN ADMINISTRATIVA ---
class LoginInput(BaseModel):
    email: str = Field(..., example="admin@reservoriovivo.ni")
    password: str = Field(..., example="Rally2026*")

class AdminUser(BaseModel):
    id: str = "usr-01"
    name: str = "Ing. Carlos Mendoza"
    email: str = "admin@reservoriovivo.ni"
    role: str = "ADMINISTRADOR_CUENCA"
    institution: str = "Alcaldía de Managua / Protección Civil"

class LoginResult(BaseModel):
    access_token: str = "session-token-rally-2026-admin"
    token_type: str = "bearer"
    user: AdminUser

# --- TELEMETRÍA ---

class TelemetryInput(BaseModel):
    water_level_cm: float = Field(..., description="Nivel actual medido en centímetros", example=195.0)
    rain_mm: Optional[float] = Field(0.0, description="Lluvia acumulada en milímetros", example=8.5)
    battery_pct: Optional[float] = Field(100.0, description="Porcentaje de batería del nodo", example=92.0)

class TelemetryPoint(BaseModel):
    timestamp: datetime
    water_level_pct: float
    water_level_cm: float
    rain_mm: float

class TelemetryResult(BaseModel):
    status: str = "SAVED"
    triggered_alert: str = "NINGUNA"  # NINGUNA, AMARILLO, ROJO, SUBIDA_RAPIDA

# --- ALERTAS ---
class Alert(BaseModel):
    id: str
    level: str  # AMARILLO, ROJO, FALLO_SENSOR
    title: str
    instruction: str
    created_at: datetime

# --- DASHBOARD GENERAL ---
class Location(BaseModel):
    lat: float = 12.1249
    lng: float = -86.1761
    neighborhood: str = "Sector Cauce La Maravilla"
    district: str = "Distrito VI, Pista Sabana Grande, Managua"

class GreenModule(BaseModel):
    name: str
    lat: float
    lng: float
    type: str
    retention_desc: str

class DashboardSummary(BaseModel):
    reservoir_name: str = "Cauce La Maravilla & Pista Sabana Grande - Distrito VI Managua"
    location: Location = Location()
    current_level_pct: float
    current_level_cm: float
    max_capacity_cm: float = 300.0
    status: str  # VERDE, AMARILLO, ROJO, FALLO_SENSOR
    rise_rate_pct_30m: float = 0.0
    sensor_status: str  # ONLINE, SIN_SENAL
    green_modules: List[GreenModule] = []
    last_updated: datetime



# --- REPORTES CIUDADANOS DE DRENAJE ---
class VisionAIAnalysis(BaseModel):
    obstruction_detected: bool = True
    obstruction_type: str = "SEDIMENTOS_Y_RESIDUOS"
    confidence_pct: float = 95.0
    urgency_level: str = "ALTA"  # MEDIA, ALTA, CRITICA
    suggested_action: str = "Despachar cuadrilla de desarenado antes del pico de tormenta"

class CreateIncidentInput(BaseModel):
    reporter_name: Optional[str] = "Vecino Sector Sabana Grande"
    description: str
    latitude: float
    longitude: float
    photo_url: Optional[str] = "/images/reservorio1.jpeg"

class Incident(BaseModel):
    id: str
    reporter_name: str
    description: str
    latitude: float
    longitude: float
    photo_url: str
    status: str = "REGISTRADO"  # PENDIENTE, REGISTRADO, ATENDIDO
    ai_analysis: VisionAIAnalysis = VisionAIAnalysis()
    created_at: datetime

# --- DIAGNÓSTICO DE HARDWARE ESP32 (VISTA ADMIN) ---
class HardwareDetails(BaseModel):
    board_type: str = "ESP32-WROOM-32D (Dual Core 240MHz)"
    sensor_ultrasonic: str = "JSN-SR04T Waterproof (IP67)"
    battery_voltage_v: float = 4.12
    battery_pct: float = 94.0
    solar_panel_charging: bool = True
    signal_rssi_dbm: int = -72
    signal_quality: str = "EXCELENTE"
    firmware_version: str = "v1.4.2-rally"
    sampling_interval_sec: int = 3

class NodeLocation(BaseModel):
    lat: float
    lng: float
    district: str

class NodeDiagnostic(BaseModel):
    id: str
    name: str
    location: NodeLocation
    status: str  # ONLINE, SIN_SENAL, ANOMALIA_DETECTADA
    hardware: HardwareDetails
    has_anomalies: bool = False
    anomaly_description: str = "Lecturas acústicas estables sin rebote falso"
    last_packet_time: datetime

# --- SIMULADOR ---
class SimulatorTrigger(BaseModel):
    scenario: str = Field(
        ..., 
        description="Escenario a simular",
        examples=["CRECIDA_SUBITA", "LLUVIA_TORRENCIAL", "NODO_DESCONECTADO", "NORMALIZACION"]
    )


