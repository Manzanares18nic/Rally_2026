"""
Almacenamiento ultra-rápido en memoria con SQLite / persistencia simple para hackathon de 24 horas.
"""
from datetime import datetime, timedelta
from typing import List, Dict, Any
from models import (
    TelemetryPoint, Alert, DashboardSummary, Location, GreenModule, Incident, VisionAIAnalysis,
    NodeDiagnostic, HardwareDetails, NodeLocation
)

import uuid

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
        self.incidents: List[Incident] = []
        self.selected_node_id: str = "node-maravilla-01"
        self.sensor_status: str = "ONLINE"
        self.last_reading_time: datetime = datetime.now()
        
        # Nodos monitoreados en Managua (Multi-reservorios)
        self.nodes: List[NodeDiagnostic] = [
            NodeDiagnostic(
                id="node-maravilla-01",
                name="Cauce La Maravilla & Pista Sabana Grande",
                location=NodeLocation(lat=12.1249, lng=-86.1761, district="Distrito VI, Managua"),
                status="ONLINE",
                hardware=HardwareDetails(
                    board_type="ESP32-WROOM-32D (Dual Core 240MHz)",
                    sensor_ultrasonic="JSN-SR04T Waterproof (IP67)",
                    battery_voltage_v=4.12,
                    battery_pct=94.0,
                    solar_panel_charging=True,
                    signal_rssi_dbm=-72,
                    signal_quality="EXCELENTE",
                    firmware_version="v1.4.2-rally",
                    sampling_interval_sec=3
                ),
                has_anomalies=False,
                anomaly_description="Lecturas acústicas estables sin rebote falso",
                last_packet_time=datetime.now()
            ),
            NodeDiagnostic(
                id="node-31dic-02",
                name="Microrrepresa & Cauce 31 de Diciembre",
                location=NodeLocation(lat=12.1485, lng=-86.2085, district="Distrito VI, Managua"),
                status="ONLINE",
                hardware=HardwareDetails(
                    board_type="ESP32 LoRaWAN 915MHz",
                    sensor_ultrasonic="JSN-SR04T Waterproof (IP67)",
                    battery_voltage_v=3.85,
                    battery_pct=78.0,
                    solar_panel_charging=True,
                    signal_rssi_dbm=-84,
                    signal_quality="BUENA",
                    firmware_version="v1.4.0-rally",
                    sampling_interval_sec=5
                ),
                has_anomalies=False,
                anomaly_description="Telemetría normal",
                last_packet_time=datetime.now() - timedelta(minutes=1)
            ),
            NodeDiagnostic(
                id="node-tiscapa-03",
                name="Drenaje Laguneta Tiscapa Norte",
                location=NodeLocation(lat=12.1350, lng=-86.2700, district="Distrito I, Managua"),
                status="SIN_SENAL",
                hardware=HardwareDetails(
                    board_type="ESP32 + SIM800L GSM",
                    sensor_ultrasonic="JSN-SR04T Waterproof (IP67)",
                    battery_voltage_v=3.42,
                    battery_pct=15.0,
                    solar_panel_charging=False,
                    signal_rssi_dbm=-105,
                    signal_quality="DEFICIENTE",
                    firmware_version="v1.3.9-rally",
                    sampling_interval_sec=10
                ),
                has_anomalies=True,
                anomaly_description="Batería baja y pérdida de enlace GSM (> 40 min)",
                last_packet_time=datetime.now() - timedelta(minutes=42)
            )
        ]

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

        # Reporte ciudadano inicial para demo
        self.incidents.append(
            Incident(
                id=f"inc-{uuid.uuid4().hex[:6]}",
                reporter_name="Comité Barrial Sabana Grande",
                description="Boca de tormenta parcialmente bloqueada por botellas y ramas en el paso peatonal",
                latitude=12.1242,
                longitude=-86.1755,
                photo_url="https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=400&q=80",
                status="VERIFICADO_POR_IA",
                ai_analysis=VisionAIAnalysis(
                    obstruction_detected=True,
                    obstruction_type="SEDIMENTOS_Y_RESIDUOS_PLASTICOS",
                    confidence_pct=94.5,
                    urgency_level="ALTA",
                    suggested_action="Limpieza preventiva de cuadrilla barrial antes del desborde"
                ),
                created_at=datetime.now() - timedelta(minutes=45)
            )
        )

    def add_incident(self, reporter_name: str, description: str, lat: float, lng: float, photo_url: str) -> Incident:
        new_inc = Incident(
            id=f"inc-{uuid.uuid4().hex[:6]}",
            reporter_name=reporter_name or "Vecino de la Comunidad",
            description=description,
            latitude=lat,
            longitude=lng,
            photo_url=photo_url or "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=400&q=80",
            status="VERIFICADO_POR_IA",
            ai_analysis=VisionAIAnalysis(
                obstruction_detected=True,
                obstruction_type="SEDIMENTOS_Y_RESIDUOS_SOLIDOS",
                confidence_pct=92.8,
                urgency_level="ALTA",
                suggested_action="Cuadrilla de desarenado y retiro de desechos requerida"
            ),
            created_at=datetime.now()
        )
        self.incidents.insert(0, new_inc)
        return new_inc


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
                name="Jardín de Lluvia y Bio-Retención Sabana Grande",
                lat=12.1265,
                lng=-86.1775,
                type="JARDIN_LLUVIA",
                retention_desc="Retiene hasta 45,000 L de escorrentía superficial de la Pista Sabana Grande"
            ),
            GreenModule(
                name="Franja Filtrante Márgenes del Cauce La Maravilla",
                lat=12.1235,
                lng=-86.1748,
                type="FRANJA_FILTRANTE",
                retention_desc="Amortigua el pico de crecida y filtra sedimentos antes del estrangulamiento"
            )
        ]

        return DashboardSummary(
            reservoir_name="Cauce La Maravilla & Pista Sabana Grande - Distrito VI Managua",
            location=Location(
                lat=12.1249,
                lng=-86.1761,
                neighborhood="Sector Cauce La Maravilla",
                district="Distrito VI, Pista Sabana Grande, Managua"
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
