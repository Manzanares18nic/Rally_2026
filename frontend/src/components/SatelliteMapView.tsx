import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Satellite, ShieldAlert, Layers, MapPin } from 'lucide-react';
import type { DashboardSummary } from '../services/api';

interface SatelliteMapProps {
  dashboard: DashboardSummary;
}

export const SatelliteMapView: React.FC<SatelliteMapProps> = ({ dashboard }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const alertCircleRef = useRef<L.Circle | null>(null);
  const centerMarkerRef = useRef<L.Marker | null>(null);

  const { lat, lng } = dashboard.location;

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // 1. Inicializar mapa Leaflet
      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        attributionControl: false,
      }).setView([lat, lng], 16);

      // 2. Capa satelital ESRI World Imagery (Real, nítida y gratuita)
      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 19 }
      ).addTo(map);

      // 3. Capa de nombres de calles y pistas de Managua
      L.tileLayer(
        'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 19 }
      ).addTo(map);

      // 4. Marcador central del Cauce
      const marker = L.marker([lat, lng]).addTo(map);
      marker.bindPopup(`
        <div style="color: #0f172a; font-family: sans-serif; font-size: 12px; line-height: 1.4;">
          <strong style="font-size: 13px; color: #0284c7;">${dashboard.reservoir_name}</strong><br/>
          <span style="color: #64748b;">Punto Crítico SINAPRED (12.1249° N, 86.1761° O)</span><br/>
          <span>Capacidad máxima: <b>${dashboard.max_capacity_cm} cm</b></span>
        </div>
      `);
      centerMarkerRef.current = marker;

      // 5. Círculo reactivo de radio de inundación
      const circle = L.circle([lat, lng], {
        color: '#10b981',
        fillColor: '#10b981',
        fillOpacity: 0.35,
        radius: 280,
      }).addTo(map);
      alertCircleRef.current = circle;

      // 6. Marcadores de Infraestructura Verde periférica (Idea B)
      const greenMod1 = L.circleMarker([12.1265, -86.1775], {
        radius: 8,
        color: '#059669',
        fillColor: '#34d399',
        fillOpacity: 0.9,
      }).addTo(map);
      greenMod1.bindPopup(
        '<div style="color:#0f172a;font-size:12px;"><b>Jardín de Lluvia Sabana Grande</b><br/>Bio-retención: 45,000 L de escorrentía amortiguada.</div>'
      );

      const greenMod2 = L.circleMarker([12.1235, -86.1748], {
        radius: 8,
        color: '#059669',
        fillColor: '#34d399',
        fillOpacity: 0.9,
      }).addTo(map);
      greenMod2.bindPopup(
        '<div style="color:#0f172a;font-size:12px;"><b>Franja Bio-Filtrante Sur</b><br/>Reduce 38% de sedimentos y retarda el pico de crecida.</div>'
      );

      mapInstanceRef.current = map;
    }

    // Actualizar estilo del círculo según el semáforo en vivo
    if (alertCircleRef.current) {
      let color = '#10b981';
      let radius = 280;

      if (dashboard.status === 'ROJO') {
        color = '#ef4444';
        radius = 500;
      } else if (dashboard.status === 'AMARILLO') {
        color = '#f59e0b';
        radius = 380;
      } else if (dashboard.status === 'FALLO_SENSOR') {
        color = '#a855f7';
        radius = 200;
      }

      alertCircleRef.current.setStyle({ color, fillColor: color });
      alertCircleRef.current.setRadius(radius);
    }
  }, [lat, lng, dashboard.status, dashboard.reservoir_name, dashboard.max_capacity_cm]);

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Barra de estado geoespacial */}
      <div className="bg-[#0D1424] border border-[#1E2A44] rounded-2xl p-4 md:p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
            <Satellite className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Cartografía Satelital en Tiempo Real
              <span className="text-[10px] font-mono bg-blue-950 border border-blue-700/50 text-blue-300 px-2 py-0.5 rounded-full">
                WGS84 • SINAPRED
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Sector: Cauce Natural La Maravilla y Pista Sabana Grande (Distrito VI, Managua)
            </p>
          </div>
        </div>

        {/* Leyenda sobria y funcional */}
        <div className="flex items-center gap-4 text-xs font-mono bg-[#090D18] border border-[#162138] px-3.5 py-2 rounded-xl">
          <span className="flex items-center gap-1.5 text-slate-300">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                dashboard.status === 'ROJO'
                  ? 'bg-red-500 animate-ping'
                  : dashboard.status === 'AMARILLO'
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
            ></span>
            Radio de Afectación ({dashboard.status === 'ROJO' ? '500m' : '280m'})
          </span>
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            Infraestructura Verde (Idea B)
          </span>
        </div>
      </div>

      {/* Contenedor del Mapa Satelital */}
      <div className="relative w-full h-[580px] rounded-2xl border border-[#1E2A44] overflow-hidden shadow-2xl bg-[#090D18]">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Overlay informativo flotante en esquina */}
        <div className="absolute bottom-4 left-4 z-[1000] bg-[#0D1424]/90 backdrop-blur-md border border-[#1E2A44] p-3.5 rounded-xl shadow-xl max-w-xs text-xs space-y-1.5 font-sans">
          <div className="flex items-center gap-2 text-white font-bold">
            <MapPin className="w-4 h-4 text-cyan-400" />
            <span>Zona Crítica de Anegamiento</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Área de estrangulamiento hidráulico identificada en los estudios de vulnerabilidad de Managua. Los sensores del ESP32 monitorean el nivel acústico bajo el paso vehicular.
          </p>
          <div className="pt-1.5 border-t border-[#1E2A44] flex justify-between text-[10px] font-mono text-slate-400">
            <span>Lat: {lat}</span>
            <span>Lng: {lng}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
