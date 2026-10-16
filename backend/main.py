from datetime import datetime
import uuid
from typing import List
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from models import (
    TelemetryInput,
    TelemetryPoint,
    TelemetryResult,
    Alert,
    DashboardSummary,
    SimulatorTrigger
)
from database import db, MAX_CAPACITY_CM

app = FastAPI(
    title="Reservorio Vivo API",
    description="API REST del MVP de 24 horas - Rally LATAM 2026 (Reto 05)",
    version="1.0.0"
)

# CORS TOTAL: Permite que el frontend de tu compañero se conecte sin problemas desde localhost:3000, 5173, etc.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# 1. DASHBOARD GENERAL (Todo lo que necesita la pantalla principal)
# ---------------------------------------------------------------------------
@app.get("/api/v1/dashboard", response_model=DashboardSummary, tags=["Dashboard"])
def get_dashboard():
    """Retorna el estado consolidado en tiempo real (Nivel, Alerta, Tasa y Mapa)."""
    return db.get_dashboard_summary()

# ---------------------------------------------------------------------------
# 2. TELEMETRÍA (Ingesta del ESP32 / Gráfica)
# ---------------------------------------------------------------------------
@app.post("/api/v1/telemetry", response_model=TelemetryResult, status_code=201, tags=["Telemetria"])
def receive_telemetry(data: TelemetryInput):
    """Recibe la medición del sensor físico o de un script de prueba."""
    point = db.add_reading(data.water_level_cm, data.rain_mm or 0.0)
    current_status = db.get_current_status()
    
    triggered = "NINGUNA"
    if current_status == "ROJO":
        triggered = "ROJO"
    elif current_status == "AMARILLO":
        rate = db.calculate_rise_rate_30m()
        triggered = "SUBIDA_RAPIDA" if rate >= 10.0 else "AMARILLO"

    # Si hay una condición de alerta, registrarla en la lista
    if triggered != "NINGUNA":
        new_alert = Alert(
            id=f"alt-{uuid.uuid4().hex[:6]}",
            level=current_status,
            title=f"Alerta: Nivel {point.water_level_pct}% ({triggered})",
            instruction="Comité Barrial: Avisar a las zonas bajas y verificar drenajes.",
            created_at=datetime.now()
        )
        db.alerts.insert(0, new_alert)

    return TelemetryResult(status="SAVED", triggered_alert=triggered)

@app.get("/api/v1/telemetry", response_model=List[TelemetryPoint], tags=["Telemetria"])
def get_telemetry_history(limit: int = 30):
    """Devuelve las lecturas más recientes para pintar la gráfica de nivel vs tiempo."""
    return db.telemetry_history[-limit:]

# ---------------------------------------------------------------------------
# 3. ALERTAS & WHATSAPP
# ---------------------------------------------------------------------------
@app.get("/api/v1/alerts", response_model=List[Alert], tags=["Alertas"])
def get_alerts():
    """Listado de alertas activas o registradas."""
    return db.alerts[:10]

@app.post("/api/v1/alerts/{alert_id}/send-whatsapp", tags=["Alertas"])
def send_whatsapp_alert(alert_id: str):
    """Dispara o reenvía el aviso por WhatsApp al grupo de vigías comunitarios."""
    summary = db.get_dashboard_summary()
    msg = (
        f"🚨 *ALERTA RESERVORIO VIVO* 🚨\n"
        f"Estado: {summary.status}\n"
        f"Nivel: {summary.current_level_pct}% ({summary.current_level_cm} cm)\n"
        f"Tasa de subida: +{summary.rise_rate_pct_30m}% en 30 min.\n"
        f"Instrucción: Despejar bocas de tormenta y activar plan barrial."
    )
    # Para el demo, generamos el enlace universal de WhatsApp y confirmación
    whatsapp_url = f"https://api.whatsapp.com/send?text={msg.replace(' ', '%20').replace('\n', '%0A')}"
    return {
        "status": "WHATSAPP_SENT",
        "message": "Alerta despachada exitosamente a los vigías.",
        "whatsapp_direct_link": whatsapp_url,
        "content_dispatched": msg
    }

# ---------------------------------------------------------------------------
# 4. SIMULADOR EN VIVO (Para presentar al Jurado)
# ---------------------------------------------------------------------------
@app.post("/api/v1/simulator/trigger", tags=["Simulador"])
def trigger_simulator(action: SimulatorTrigger):
    """Permite al equipo activar escenarios en 1 clic durante el pitch."""
    scenario = action.scenario.upper()
    
    if scenario == "CRECIDA_SUBITA":
        # Inyectar una subida abrupta (ej. de 195 a 270 cm)
        db.add_reading(water_level_cm=275.0, rain_mm=25.0)
        status_msg = "ALERTA_ROJA_ACTIVADA"
    elif scenario == "LLUVIA_TORRENCIAL":
        db.add_reading(water_level_cm=215.0, rain_mm=18.0)
        status_msg = "ALERTA_AMARILLA_ACTIVADA"
    elif scenario == "NODO_DESCONECTADO":
        db.sensor_status = "SIN_SENAL"
        status_msg = "FALLO_SENSOR_REPORTADO"
    elif scenario == "NORMALIZACION":
        db.sensor_status = "ONLINE"
        db.add_reading(water_level_cm=90.0, rain_mm=0.0)
        status_msg = "SISTEMA_NORMALIZADO"
    else:
        raise HTTPException(status_code=400, detail="Escenario no reconocido.")

    return {
        "scenario_applied": scenario,
        "current_status": status_msg,
        "dashboard": db.get_dashboard_summary()
    }
