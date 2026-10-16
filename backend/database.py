"""
Almacenamiento ultra-rápido en memoria con SQLite / persistencia simple para hackathon de 24 horas.
"""
from datetime import datetime, timedelta
from typing import List, Dict, Any
from models import TelemetryPoint, Alert, DashboardSummary, Location, GreenModule

# Capacidad máxima del reservorio piloto en cm
MAX_CAPACITY_CM = 300.0

# Umbrales
UMBRAL_AMARILLO_PCT = 60.0
UMBRAL_ROJO_PCT = 85.0
UMBRAL_TASA_SUBIDA_RAPIDA_PCT = 10.0  # Si sube más de 10% en 30 minutos

class SimpleDB:
    def __init__(self):
        self.telemetry_history: List[TelemetryPoint] = []
        self.alerts: List[Alert] = []
        self.sensor_status: str = "ONLINE"
        self.last_reading_time: datetime = datetime.now()
        
        # Inicializar con algunos datos de muestra para que el frontend no arranque vacío
        self._seed_initial_data()

    def _seed_initial_data(self):
        base_time = datetime.now() - timedelta(minutes=60)
        # 12 lecturas cada 5 minutos
        initial_levels = [80, 85, 90, 95, 100, 110, 125, 140, 155, 170, 185, 195]
        for i, cm in enumerate(initial_levels):
            ts = base_time + timedelta(minutes=i * 5)
            pct = round((cm / MAX_CAPACITY_CM) * 100, 1)
            self.telemetry_history.append(
                TelemetryPoint(
                    timestamp=ts,
                    water_level_pct=pct,
                    water_level_cm=float(cm),
                    rain_mm=round(i * 0.8, 1)
                )
            )
        self.last_reading_time = datetime.now()

    def add_reading(self, water_level_cm: float, rain_mm: float) -> TelemetryPoint:
        now = datetime.now()
        pct = round((water_level_cm / MAX_CAPACITY_CM) * 100, 1)
        point = TelemetryPoint(
            timestamp=now,
            water_level_pct=pct,
            water_level_cm=water_level_cm,
            rain_mm=rain_mm
        )
        self.telemetry_history.append(point)
        # Mantener últimos 100 puntos en memoria
        if len(self.telemetry_history) > 100:
            self.telemetry_history.pop(0)
        self.last_reading_time = now
        self.sensor_status = "ONLINE"
        return point

    def calculate_rise_rate_30m(self) -> float:
        """Calcula la tasa de variación en los últimos 30 minutos."""
        if len(self.telemetry_history) < 2:
            return 0.0
        
        now = datetime.now()
        cutoff = now - timedelta(minutes=30)
        recent_points = [p for p in self.telemetry_history if p.timestamp >= cutoff]
        
        if len(recent_points) < 2:
            # Comparar el más reciente con el primero que tengamos si son pocos
            first = self.telemetry_history[0]
            latest = self.telemetry_history[-1]
            return round(latest.water_level_pct - first.water_level_pct, 1)
            
        first = recent_points[0]
        latest = recent_points[-1]
        return round(latest.water_level_pct - first.water_level_pct, 1)

    def get_current_status(self) -> str:
        if self.sensor_status == "SIN_SENAL":
            return "FALLO_SENSOR"
            
        if not self.telemetry_history:
            return "VERDE"
            
        latest = self.telemetry_history[-1]
        rate = self.calculate_rise_rate_30m()
        
        # Regla 1: Nivel absoluto rojo
        if latest.water_level_pct >= UMBRAL_ROJO_PCT:
            return "ROJO"
        # Regla 2: Tasa de subida rápida o nivel amarillo
        if rate >= UMBRAL_TASA_SUBIDA_RAPIDA_PCT or latest.water_level_pct >= UMBRAL_AMARILLO_PCT:
            return "AMARILLO"
            
        return "VERDE"

    def get_dashboard_summary(self) -> DashboardSummary:
        latest = self.telemetry_history[-1] if self.telemetry_history else TelemetryPoint(
            timestamp=datetime.now(), water_level_pct=0.0, water_level_cm=0.0, rain_mm=0.0
        )
        rate = self.calculate_rise_rate_30m()
        status = self.get_current_status()
        
        green_modules = [
            GreenModule(
                name="Jardín de Lluvia y Bio-Retención Norte",
                lat=12.1500,
                lng=-86.2095,
                type="JARDIN_LLUVIA",
                retention_desc="Retiene hasta 45,000 L de escorrentía barrial directa"
            ),
            GreenModule(
                name="Franja Filtrante Calle Principal",
                lat=12.1470,
                lng=-86.2070,
                type="FRANJA_FILTRANTE",
                retention_desc="Disminuye en 38% la velocidad de entrada de sedimentos al cauce"
            )
        ]

        return DashboardSummary(
            reservoir_name="Microrrepresa & Cauce 31 de Diciembre - Distrito VI Managua",
            location=Location(
                lat=12.1485,
                lng=-86.2085,
                neighborhood="Barrio 31 de Diciembre",
                district="Distrito VI, Managua"
            ),
            current_level_pct=latest.water_level_pct,
            current_level_cm=latest.water_level_cm,
            max_capacity_cm=MAX_CAPACITY_CM,
            status=status,
            rise_rate_pct_30m=rate,
            sensor_status=self.sensor_status,
            green_modules=green_modules,
            last_updated=latest.timestamp
        )


# Instancia única en memoria para el servidor
db = SimpleDB()
