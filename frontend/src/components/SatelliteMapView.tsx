import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Layers, MapPin } from 'lucide-react';
import type { DashboardSummary } from '../services/api';

interface SatelliteMapProps {
  dashboard: DashboardSummary;
  isDark: boolean;
}

export const SatelliteMapView: React.FC<SatelliteMapProps> = ({ dashboard, isDark }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const alertCircleRef = useRef<L.Circle | null>(null);

  const { lat, lng } = dashboard.location;

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        attributionControl: false,
      }).setView([lat, lng], 16);

      // Capa satelital ESRI World Imagery
      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 19 }
      ).addTo(map);

      // Etiquetas de calles y pistas
      L.tileLayer(
        'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 19 }
      ).addTo(map);

      // Marcador central
      const marker = L.marker([lat, lng]).addTo(map);
      marker.bindPopup(`
        <div style="color: #0f172a; font-family: sans-serif; font-size: 12px;">
          <strong>${dashboard.reservoir_name}</strong><br/>
          <span>Punto de monitoreo de crecidas</span>
        </div>
      `);

      // Radio de afectación hidráulica
      const circle = L.circle([lat, lng], {
        color: '#2563eb',
        fillColor: '#2563eb',
        fillOpacity: 0.3,
        radius: 280,
      }).addTo(map);
      alertCircleRef.current = circle;

      // Franjas de bio-retención
      const g1 = L.circleMarker([12.1265, -86.1775], {
        radius: 7,
        color: '#059669',
        fillColor: '#10b981',
        fillOpacity: 0.9,
      }).addTo(map);
      g1.bindPopup('<div style="color:#0f172a;font-size:12px;"><b>Jardín de Bio-Retención Norte</b></div>');

      const g2 = L.circleMarker([12.1235, -86.1748], {
        radius: 7,
        color: '#059669',
        fillColor: '#10b981',
        fillOpacity: 0.9,
      }).addTo(map);
      g2.bindPopup('<div style="color:#0f172a;font-size:12px;"><b>Franja Filtrante Sur</b></div>');

      mapInstanceRef.current = map;
    }

    if (alertCircleRef.current) {
      let color = '#2563eb';
      let radius = 280;

      if (dashboard.status === 'ROJO') {
        color = '#dc2626';
        radius = 480;
      } else if (dashboard.status === 'AMARILLO') {
        color = '#d97706';
        radius = 380;
      }

      alertCircleRef.current.setStyle({ color, fillColor: color });
      alertCircleRef.current.setRadius(radius);
    }
  }, [lat, lng, dashboard.status, dashboard.reservoir_name]);

  return (
    <div className="space-y-4">
      <div
        className={`rounded-2xl border p-4 transition-all shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 ${
          isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Vista Satelital del Cauce La Maravilla
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Pista Sabana Grande, Distrito VI, Managua (12.1249° N, 86.1761° O)
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                dashboard.status === 'ROJO'
                  ? 'bg-red-500'
                  : dashboard.status === 'AMARILLO'
                  ? 'bg-amber-500'
                  : 'bg-blue-600'
              }`}
            />
            Zona de influencia directa
          </span>
          <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            Infraestructura verde
          </span>
        </div>
      </div>

      <div
        className={`relative w-full h-[520px] rounded-2xl border overflow-hidden shadow-xs ${
          isDark ? 'border-slate-800' : 'border-slate-200'
        }`}
      >
        <div ref={mapContainerRef} className="w-full h-full" />
      </div>
    </div>
  );
};
