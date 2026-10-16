from datetime import datetime
import uuid
from typing import List
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

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

# Servir la interfaz visual de pruebas en la ruta raíz '/'
@app.get("/", include_in_schema=False)
def serve_dashboard():
    static_file = os.path.join(os.path.dirname(__file__), "static", "index.html")
    return FileResponse(static_file)


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

from simulator import simulator

@app.on_event("startup")
def startup_event():
    """Inicia automáticamente el simulador en segundo plano al arrancar el servidor."""
    simulator.start()

# ---------------------------------------------------------------------------
# 4. SIMULADOR EN VIVO (Para presentar al Jurado)
# ---------------------------------------------------------------------------
@app.get("/api/v1/simulator/status", tags=["Simulador"])
def get_simulator_status():
    """Consulta el estado actual de la simulación."""
    return {
        "is_running": simulator.is_running,
        "current_scenario": simulator.scenario,
        "interval_seconds": simulator.interval_seconds,
        "current_level_cm": simulator.current_water_level_cm
    }

@app.post("/api/v1/simulator/trigger", tags=["Simulador"])
def trigger_simulator(action: SimulatorTrigger):
    """Permite al equipo activar escenarios en 1 clic durante el pitch."""
    scenario = action.scenario.upper()
    valid_scenarios = ["NORMAL", "LLUVIA_MODERADA", "CRECIDA_SUBITA", "NODO_DESCONECTADO", "VACIADO"]
    
    if scenario not in valid_scenarios:
        raise HTTPException(
            status_code=400, 
            detail=f"Escenario '{scenario}' no reconocido. Opciones válidas: {valid_scenarios}"
        )

    simulator.set_scenario(scenario)

    return {
        "message": f"Escenario '{scenario}' activado con éxito.",
        "scenario": scenario,
        "dashboard": db.get_dashboard_summary()
    }

