"""
Módulo de Simulación Autónoma en Tiempo Real para Reservorio Vivo.
Simula el comportamiento de un sensor IoT (ESP32) enviando lecturas al reservorio
según diferentes escenarios hidrológicos para la demostración en vivo.
"""
import time
import threading
import random
from datetime import datetime
from database import db, MAX_CAPACITY_CM
from models import Alert
import uuid

class SensorSimulator:
    def __init__(self):
        self.is_running: bool = False
        self.scenario: str = "NORMAL"  # NORMAL, LLUVIA_LIGERA, CRECIDA_SUBITA, NODO_DESCONECTADO
        self.interval_seconds: float = 3.0
        self.worker_thread: threading.Thread = None
        
        # Estado interno de la simulación
        self.current_water_level_cm: float = 120.0  # 40% capacidad
        self.rain_intensity_mm: float = 0.0

    def start(self):
        if self.is_running:
            return
        self.is_running = True
        self.worker_thread = threading.Thread(target=self._run_loop, daemon=True)
        self.worker_thread.start()
        print("✅ [Simulador] Hilo de simulación iniciado en segundo plano.")

    def stop(self):
        self.is_running = False

    def set_scenario(self, scenario_name: str):
        self.scenario = scenario_name.upper()
        
        if self.scenario == "NORMAL":
            self.current_water_level_cm = 110.0
            self.rain_intensity_mm = 0.0
            db.sensor_status = "ONLINE"
        elif self.scenario == "LLUVIA_MODERADA":
            self.rain_intensity_mm = 5.0
            db.sensor_status = "ONLINE"
        elif self.scenario == "CRECIDA_SUBITA":
            # Tormenta violenta que provoca crecida rápida
            self.rain_intensity_mm = 28.0
            db.sensor_status = "ONLINE"
        elif self.scenario == "NODO_DESCONECTADO":
            db.sensor_status = "SIN_SENAL"
        elif self.scenario == "VACIADO":
            self.rain_intensity_mm = 0.0
            db.sensor_status = "ONLINE"

    def _run_loop(self):
        while self.is_running:
            if db.sensor_status == "SIN_SENAL":
                # Nodo caído: no genera lecturas
                time.sleep(self.interval_seconds)
                continue

            # Lógica física según escenario
            if self.scenario == "CRECIDA_SUBITA":
                # Sube drásticamente entre 6 y 12 cm por ciclo (subida rápida evidente en demo)
                increment = random.uniform(7.0, 12.0)
                self.current_water_level_cm = min(MAX_CAPACITY_CM, self.current_water_level_cm + increment)
            elif self.scenario == "LLUVIA_MODERADA":
                # Sube moderadamente entre 1.5 y 3.5 cm
                increment = random.uniform(1.5, 3.5)
                self.current_water_level_cm = min(MAX_CAPACITY_CM, self.current_water_level_cm + increment)
            elif self.scenario == "VACIADO":
                # Drenaje o infiltración verde: baja el nivel
                decrement = random.uniform(3.0, 6.0)
                self.current_water_level_cm = max(20.0, self.current_water_level_cm - decrement)
            else:
                # Normal: oscilación mínima natural (+/- 0.5 cm)
                self.current_water_level_cm += random.uniform(-0.5, 0.5)
                self.current_water_level_cm = max(30.0, min(150.0, self.current_water_level_cm))

            # Registrar lectura en la base de datos
            point = db.add_reading(
                water_level_cm=round(self.current_water_level_cm, 1),
                rain_mm=round(self.rain_intensity_mm, 1)
            )

            # Verificar reglas y disparar alertas automáticas
            current_status = db.get_current_status()
            rate = db.calculate_rise_rate_30m()

            if current_status == "ROJO":
                # Si no hay alerta roja reciente, agregarla
                if not db.alerts or db.alerts[0].level != "ROJO":
                    db.alerts.insert(0, Alert(
                        id=f"alt-{uuid.uuid4().hex[:6]}",
                        level="ROJO",
                        title=f"🚨 ALERTA ROJA: Nivel crítico ({point.water_level_pct}%)",
                        instruction="Evacuar viviendas inmediatas al reservorio y activar altavoz.",
                        created_at=datetime.now()
                    ))
            elif current_status == "AMARILLO":
                if not db.alerts or db.alerts[0].level not in ["AMARILLO", "ROJO"]:
                    reason = f"Tasa de subida acelerada (+{rate}% en 30m)" if rate >= 10.0 else f"Nivel elevado ({point.water_level_pct}%)"
                    db.alerts.insert(0, Alert(
                        id=f"alt-{uuid.uuid4().hex[:6]}",
                        level="AMARILLO",
                        title=f"⚠️ ALERTA AMARILLA: {reason}",
                        instruction="Vigías: monitorear drenajes y canaletas preventivas.",
                        created_at=datetime.now()
                    ))

            time.sleep(self.interval_seconds)

# Instancia global del simulador
simulator = SensorSimulator()
