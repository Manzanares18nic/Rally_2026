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
    lat: float = 12.1485
    lng: float = -86.2085
    neighborhood: str = "Barrio 31 de Diciembre"
    district: str = "Distrito VI, Managua"

class GreenModule(BaseModel):
    name: str
    lat: float
    lng: float
    type: str
    retention_desc: str

class DashboardSummary(BaseModel):
    reservoir_name: str = "Microrrepresa & Cauce 31 de Diciembre - Distrito VI Managua"
    location: Location = Location()
    current_level_pct: float
    current_level_cm: float
    max_capacity_cm: float = 300.0
    status: str  # VERDE, AMARILLO, ROJO, FALLO_SENSOR
    rise_rate_pct_30m: float = 0.0
    sensor_status: str  # ONLINE, SIN_SENAL
    green_modules: List[GreenModule] = []
    last_updated: datetime


# --- SIMULADOR ---
class SimulatorTrigger(BaseModel):
    scenario: str = Field(
        ..., 
        description="Escenario a simular",
        examples=["CRECIDA_SUBITA", "LLUVIA_TORRENCIAL", "NODO_DESCONECTADO", "NORMALIZACION"]
    )
