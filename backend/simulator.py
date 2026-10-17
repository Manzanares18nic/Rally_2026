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
        self.scenario: str = "NORMAL"  # NORMAL, LLUVIA_MODERADA, CRECIDA_SUBITA, NODO_DESCONECTADO, VACIADO
        self.interval_seconds: float = 1.0
        self.worker_thread: threading.Thread = None
        
        # Estado interno de la simulación
        self.current_water_level_cm: float = 110.0  # ~37% capacidad
        self.rain_intensity_mm: float = 0.0

    def start(self):
        if self.is_running:
            return
        self.is_running = True
        self.worker_thread = threading.Thread(target=self._run_loop, daemon=True)
        self.worker_thread.start()
        print("✅ [Simulador] Hilo de simulación rápida iniciado en segundo plano (1.0s).")

    def stop(self):
        self.is_running = False

    def set_scenario(self, scenario_name: str):
        self.scenario = scenario_name.upper()
        
        if self.scenario == "NORMAL":
            self.current_water_level_cm = 105.0
            self.rain_intensity_mm = 0.0
            db.sensor_status = "ONLINE"
        elif self.scenario == "LLUVIA_MODERADA":
            self.rain_intensity_mm = 6.5
            if self.current_water_level_cm > 200.0:
                self.current_water_level_cm = 120.0
            db.sensor_status = "ONLINE"
        elif self.scenario == "CRECIDA_SUBITA":
            # Tormenta violenta que provoca crecida rápida y visible en pocos segundos
            self.rain_intensity_mm = 32.0
            if self.current_water_level_cm > 230.0:
                self.current_water_level_cm = 85.0
            db.sensor_status = "ONLINE"
        elif self.scenario == "NODO_DESCONECTADO":
            db.sensor_status = "SIN_SENAL"
        elif self.scenario == "VACIADO":
            self.rain_intensity_mm = 0.0
            if self.current_water_level_cm < 170.0:
                self.current_water_level_cm = 265.0
            db.sensor_status = "ONLINE"

    def _run_loop(self):
        while self.is_running:
            if db.sensor_status == "SIN_SENAL":
                # Nodo caído: no genera lecturas
                time.sleep(self.interval_seconds)
                continue

            # Lógica física acelerada para demostración en vivo (Pitch de jurados)
            if self.scenario == "CRECIDA_SUBITA":
                # Sube drásticamente (~5% por ciclo) para verse subir en vivo
                increment = random.uniform(13.0, 20.0)
                self.current_water_level_cm = min(MAX_CAPACITY_CM * 0.96, self.current_water_level_cm + increment)
            elif self.scenario == "LLUVIA_MODERADA":
                # Sube moderadamente (~2% por ciclo)
                increment = random.uniform(5.0, 8.5)
                self.current_water_level_cm = min(MAX_CAPACITY_CM * 0.72, self.current_water_level_cm + increment)
            elif self.scenario == "VACIADO":
                # Drenaje e infiltración verde rápida: desciende en vivo
                decrement = random.uniform(14.0, 21.0)
                self.current_water_level_cm = max(35.0, self.current_water_level_cm - decrement)
            else:
                # Normal: oscilación mínima natural (+/- 0.8 cm)
                self.current_water_level_cm += random.uniform(-0.8, 0.8)
                self.current_water_level_cm = max(60.0, min(120.0, self.current_water_level_cm))

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
