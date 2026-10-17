"""
Módulo de Simulación Autónoma en Tiempo Real para Reservorio Vivo.
Simula el comportamiento de un sensor IoT (ESP32) enviando lecturas al reservorio
según diferentes escenarios hidrológicos para la demostración en vivo.
"""
import time
import threading
import random
from datetime import datetime, timedelta
from database import db, MAX_CAPACITY_CM
from models import Alert, TelemetryPoint
import uuid

class SensorSimulator:
    def __init__(self):
        self.is_running: bool = False
        self.scenario: str = "NORMAL"  # NORMAL, LLUVIA_MODERADA, CRECIDA_SUBITA, NODO_DESCONECTADO, VACIADO
        self.interval_seconds: float = 0.8  # Ritmo ideal de 800ms para observar la subida segundo a segundo
        self.worker_thread: threading.Thread = None
        
        # Estado interno de la simulación
        self.current_water_level_cm: float = 95.0  # ~31% capacidad (Día normal)
        self.rain_intensity_mm: float = 0.0

    def start(self):
        if self.is_running:
            return
        self.is_running = True
        self.worker_thread = threading.Thread(target=self._run_loop, daemon=True)
        self.worker_thread.start()
        print("✅ [Simulador] Hilo de simulación rápida iniciado en segundo plano (0.8s).")

    def stop(self):
        self.is_running = False

    def set_scenario(self, scenario_name: str):
        self.scenario = scenario_name.upper()
        now = datetime.now()
        
        if self.scenario == "NORMAL":
            self.current_water_level_cm = 95.0
            self.rain_intensity_mm = 0.0
            db.sensor_status = "ONLINE"
            db.add_reading(water_level_cm=self.current_water_level_cm, rain_mm=self.rain_intensity_mm)

        elif self.scenario == "LLUVIA_MODERADA":
            self.rain_intensity_mm = 16.0
            self.current_water_level_cm = 95.0
            db.sensor_status = "ONLINE"
            db.add_reading(water_level_cm=self.current_water_level_cm, rain_mm=self.rain_intensity_mm)

        elif self.scenario == "CRECIDA_SUBITA":
            # Tormenta fuerte: inicia desde nivel bajo (60 cm / 20%) para ver el agua subir drásticamente
            self.rain_intensity_mm = 45.0
            self.current_water_level_cm = 60.0
            db.sensor_status = "ONLINE"
            # Reiniciar historial para que la gráfica pinte la curva subiendo desde abajo en tiempo real
            db.telemetry_history = [
                TelemetryPoint(
                    timestamp=now - timedelta(seconds=(15 - i) * 2),
                    water_level_pct=round((max(45.0, 60.0 - (15 - i) * 1.0) / MAX_CAPACITY_CM) * 100, 1),
                    water_level_cm=round(max(45.0, 60.0 - (15 - i) * 1.0), 1),
                    rain_mm=round(self.rain_intensity_mm, 1)
                )
                for i in range(15)
            ]
            db.add_reading(water_level_cm=self.current_water_level_cm, rain_mm=self.rain_intensity_mm)

        elif self.scenario == "NODO_DESCONECTADO":
            db.sensor_status = "SIN_SENAL"

        elif self.scenario == "VACIADO":
            # Vaciado: inicia alto (275 cm / 92%) para ver el agua drenar y descender visiblemente
            self.rain_intensity_mm = 0.0
            self.current_water_level_cm = 275.0
            db.sensor_status = "ONLINE"
            db.telemetry_history = [
                TelemetryPoint(
                    timestamp=now - timedelta(seconds=(15 - i) * 2),
                    water_level_pct=round((min(MAX_CAPACITY_CM * 0.95, 275.0 + (15 - i) * 0.5) / MAX_CAPACITY_CM) * 100, 1),
                    water_level_cm=round(min(MAX_CAPACITY_CM * 0.95, 275.0 + (15 - i) * 0.5), 1),
                    rain_mm=0.0
                )
                for i in range(15)
            ]
            db.add_reading(water_level_cm=self.current_water_level_cm, rain_mm=self.rain_intensity_mm)

    def _run_loop(self):
        while self.is_running:
            if db.sensor_status == "SIN_SENAL":
                # Nodo caído: no genera lecturas
                time.sleep(self.interval_seconds)
                continue

            # Dinámica acelerada de subida y bajada en vivo para demostraciones
            if self.scenario == "CRECIDA_SUBITA":
                # Sube de forma clara y progresiva (~3.5% a 5% por ciclo)
                increment = random.uniform(10.0, 16.0)
                self.current_water_level_cm = min(MAX_CAPACITY_CM * 0.96, self.current_water_level_cm + increment)
            elif self.scenario == "LLUVIA_MODERADA":
                # Sube moderadamente (~2% a 3% por ciclo)
                increment = random.uniform(5.5, 9.0)
                self.current_water_level_cm = min(MAX_CAPACITY_CM * 0.70, self.current_water_level_cm + increment)
            elif self.scenario == "VACIADO":
                # Drenaje verde rápido: desciende continuamente (~4% por ciclo)
                decrement = random.uniform(11.0, 17.0)
                self.current_water_level_cm = max(55.0, self.current_water_level_cm - decrement)
            else:
                # Normal / Día soleado: oscilación suave alrededor de 95cm sin lluvia
                self.rain_intensity_mm = 0.0
                self.current_water_level_cm += random.uniform(-0.6, 0.6)
                self.current_water_level_cm = max(85.0, min(105.0, self.current_water_level_cm))

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
                        title=f"🚨 Alerta de Crecida: Cuidar a las familias",
                        instruction="El agua sube rápido. Por favor alejarse de las orillas del cauce y resguardar a niños y adultos mayores.",
                        created_at=datetime.now()
                    ))
            elif current_status == "AMARILLO":
                if not db.alerts or db.alerts[0].level not in ["AMARILLO", "ROJO"]:
                    db.alerts.insert(0, Alert(
                        id=f"alt-{uuid.uuid4().hex[:6]}",
                        level="AMARILLO",
                        title="⚠️ Aviso Preventivo: Lluvia en el sector",
                        instruction="Está lloviendo en la parte alta. Mantener limpias las rejillas y evitar botar basura.",
                        created_at=datetime.now()
                    ))

            time.sleep(self.interval_seconds)

# Instancia global del simulador
simulator = SensorSimulator()
