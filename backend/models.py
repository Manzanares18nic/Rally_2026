from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field

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



# --- REPORTES CIUDADANOS & VISIÓN ARTIFICIAL (IDEA E) ---
class VisionAIAnalysis(BaseModel):
    obstruction_detected: bool = True
    obstruction_type: str = "SEDIMENTOS_Y_RESIDUOS_PLASTICOS"
    confidence_pct: float = 94.2
    urgency_level: str = "ALTA"  # MEDIA, ALTA, CRITICA
    suggested_action: str = "Despachar cuadrilla de desarenado antes del pico de tormenta"

class CreateIncidentInput(BaseModel):
    reporter_name: Optional[str] = "Vecino Sector Sabana Grande"
    description: str
    latitude: float
    longitude: float
    photo_url: Optional[str] = "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=400&q=80"

class Incident(BaseModel):
    id: str
    reporter_name: str
    description: str
    latitude: float
    longitude: float
    photo_url: str
    status: str = "VERIFICADO_POR_IA"  # PENDIENTE, VERIFICADO_POR_IA, ATENDIDO
    ai_analysis: VisionAIAnalysis
    created_at: datetime

# --- SIMULADOR ---
class SimulatorTrigger(BaseModel):
    scenario: str = Field(
        ..., 
        description="Escenario a simular",
        examples=["CRECIDA_SUBITA", "LLUVIA_TORRENCIAL", "NODO_DESCONECTADO", "NORMALIZACION"]
    )

