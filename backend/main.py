from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
import shutil
import uuid
from typing import List
from datetime import datetime

from models import (
    TelemetryInput,
    TelemetryPoint,
    TelemetryResult,
    Alert,
    DashboardSummary,
    SimulatorTrigger,
    Incident,
    CreateIncidentInput,
    NodeDiagnostic,
    LoginInput,
    LoginResult,
    AdminUser
)
from database import db, MAX_CAPACITY_CM


app = FastAPI(
    title="Reservorio Vivo API",
    description="API REST del MVP de 24 horas - Rally LATAM 2026 (Reto 05)",
    version="1.0.0"
)

# Montar carpeta de archivos estáticos (para servir fotos subidas de reportes)
static_dir = os.path.join(os.path.dirname(__file__), "static")
app.mount("/static", StaticFiles(directory=static_dir), name="static")

# Servir la interfaz visual de pruebas en la ruta raíz '/'
@app.get("/", include_in_schema=False)
def serve_dashboard():
    static_file = os.path.join(static_dir, "index.html")
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
# 0. AUTENTICACIÓN ADMINISTRATIVA
# ---------------------------------------------------------------------------
@app.post("/api/v1/auth/login", response_model=LoginResult, tags=["Auth"])
def login(credentials: LoginInput):
    """Permite el acceso a la consola de administración con credenciales válidas."""
    # Validación simple para el hackathon (admin@reservoriovivo.ni / Rally2026*)
    if credentials.email == "admin@reservoriovivo.ni" and credentials.password == "Rally2026*":
        user = AdminUser(
            id="usr-01",
            name="Ing. Carlos Mendoza",
            email="admin@reservoriovivo.ni",
            role="ADMINISTRADOR_CUENCA",
            institution="Alcaldía de Managua / Protección Civil"
        )
        return LoginResult(
            access_token="session-token-rally-2026-admin",
            token_type="bearer",
            user=user
        )
    raise HTTPException(status_code=401, detail="Correo o contraseña incorrectos.")

@app.get("/api/v1/auth/me", response_model=AdminUser, tags=["Auth"])
def get_current_user():
    """Retorna los datos del administrador en sesión."""
    return AdminUser()

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
# 3. REPORTES CIUDADANOS & VISIÓN ARTIFICIAL (IDEA E)
# ---------------------------------------------------------------------------
@app.get("/api/v1/incidents", response_model=List[Incident], tags=["Reportes Ciudadanos"])
def list_incidents():
    """Listado de reportes ciudadanos de drenajes y sedimentación analizados por IA."""
    return db.incidents

@app.post("/api/v1/incidents", response_model=Incident, status_code=201, tags=["Reportes Ciudadanos"])
def report_incident(data: CreateIncidentInput):
    """Registra un reporte vecinal (JSON)."""
    incident = db.add_incident(
        reporter_name=data.reporter_name or "Vecino Sabana Grande",
        description=data.description,
        lat=data.latitude,
        lng=data.longitude,
        photo_url=data.photo_url or ""
    )
    return incident

@app.post("/api/v1/incidents/upload", response_model=Incident, status_code=201, tags=["Reportes Ciudadanos"])
async def upload_incident_photo(
    image: UploadFile = File(...),
    description: str = Form(...),
    reporter_name: str = Form("Vecino Sabana Grande"),
    latitude: float = Form(12.1249),
    longitude: float = Form(-86.1761)
):
    """Permite subir una foto real desde el celular/PC y procesarla con Visión Artificial."""
    uploads_dir = os.path.join(os.path.dirname(__file__), "static", "uploads")
    os.makedirs(uploads_dir, exist_ok=True)
    
    file_ext = os.path.splitext(image.filename)[1] or ".jpg"
    filename = f"report_{uuid.uuid4().hex[:8]}{file_ext}"
    file_path = os.path.join(uploads_dir, filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(image.file, buffer)

    photo_url = f"/static/uploads/{filename}"

    incident = db.add_incident(
        reporter_name=reporter_name,
        description=description,
        lat=latitude,
        lng=longitude,
        photo_url=photo_url
    )
    return incident

# ---------------------------------------------------------------------------
# 4. ADMINISTRACIÓN & DIAGNÓSTICO DE HARDWARE ESP32 (VISTA ADMIN)
# ---------------------------------------------------------------------------
@app.get("/api/v1/admin/nodes", response_model=List[NodeDiagnostic], tags=["Administración & Nodos"])
def get_all_nodes():
    """Retorna la lista de todos los reservorios/nodos monitoreados con su estado de hardware."""
    return db.nodes

@app.post("/api/v1/admin/nodes/{node_id}/select", tags=["Administración & Nodos"])
def select_active_node(node_id: str):
    """Selecciona el nodo que se visualiza en la consola."""
    match = next((n for n in db.nodes if n.id == node_id), None)
    if not match:
        raise HTTPException(status_code=404, detail="Nodo no encontrado.")
    db.selected_node_id = node_id
    return {
        "selected_node_id": node_id,
        "message": f"Nodo '{match.name}' seleccionado para monitoreo activo."
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

