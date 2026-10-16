# ⚡ Stack y Arquitectura MVP (24 Horas) - Reservorio Vivo

> **Objetivo**: Un prototipo 100% funcional y demostrable en 1 día para el Rally LATAM 2026.  
> Sin sobreingeniería, sin microservicios, enfocado en lo que el jurado evaluará.

---

## 🎯 ¿Qué hace el MVP en el Demo?

1. **Monitorea en tiempo real**: Muestra el nivel actual del reservorio en un mapa y una gráfica interactiva.
2. **Alerta inteligente**: Detecta subida rápida de agua (+% en 30 min) y no solo un nivel fijo.
3. **Fallo visible**: Si el sensor se desconecta o no manda datos, la pantalla muestra alarma de sensor caído.
4. **Alerta WhatsApp**: Botón para disparar mensaje real a WhatsApp con instrucciones claras para los vecinos.
5. **Simulador en 1 clic**: Para la presentación al jurado, simula tormenta o crecida súbita al instante.

---

## 🛠️ Stack Tecnológico Ultra-Rápido

| Componente | Tecnología | ¿Por qué para 24h? |
|---|---|---|
| **Backend** | **Python (FastAPI)** | Se levanta en minutos, auto-documenta Swagger en `/docs` y es muy fácil de codificar. |
| **Base de Datos** | **SQLite** (o memoria con volcado a JSON) | Cero configuración de servidores, corre en cualquier máquina al instante. |
| **Frontend** | **React + Vite + Tailwind CSS** | Interfaz moderna en una sola pantalla (*Single Page Dashboard*) con mapa Leaflet. |
| **Alertas** | **Webhook de WhatsApp / Twilio sandbox / Enlace directo `wa.me`** | Muestra el mensaje en vivo en el celular sin pagar suscripciones. |
| **Hardware / Demo** | **ESP32 simulado o físico con script en Python** | Si no hay hardware listo, el script inyecta datos por HTTP en segundos. |

---

## 🚀 Endpoints Esenciales (Solo 5)

- `GET /api/v1/dashboard`: Devuelve nivel actual, estado (Verde/Amarillo/Rojo), tasa de subida y coordenadas del mapa.
- `POST /api/v1/telemetry`: Recibe lectura del ESP32 (`{ water_level_cm, rain_mm }`).
- `GET /api/v1/telemetry`: Devuelve los últimos 30 puntos para dibujar la gráfica de nivel vs tiempo.
- `POST /api/v1/alerts/{id}/send-whatsapp`: Despacha la alerta a WhatsApp.
- `POST /api/v1/simulator/trigger`: Botón del demo que cambia el escenario (crecida súbita, lluvia o desconexión).

---

## 👥 Reparto del Equipo para el Rally (1 Día)

- **Computación 1 (Backend)**: Programar la API en FastAPI con las fórmulas de nivel y tasa de subida.
- **Computación 2 (Frontend)**: Diseñar el dashboard (semáforo de alerta, gráfica y mapa).
- **Computación 3 (Simulador & Integración)**: Crear el script de simulación para el jurado y la conexión a WhatsApp.
- **Electrónica**: Probar el sensor ultrasónico con ESP32 enviando POST a la API local.
- **Arquitectura**: Diseñar la lámina/render de la infraestructura verde (jardines de lluvia) para el pitch.
- **Sistemas**: Redactar el guion del video pitch (2:30 min) y el informe ejecutivo.
