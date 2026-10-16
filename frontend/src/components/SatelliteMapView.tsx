import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Layers, MapPin, ZoomIn, Camera } from 'lucide-react';
import type { DashboardSummary, Incident } from '../services/api';

interface SatelliteMapProps {
  dashboard: DashboardSummary;
  isDark: boolean;
  selectedNodeCoords?: { lat: number; lng: number; name: string };
  incidents?: Incident[];
}

export const SatelliteMapView: React.FC<SatelliteMapProps> = ({
  dashboard,
  isDark,
  selectedNodeCoords,
  incidents = [],
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const alertCircleRef = useRef<L.Circle | null>(null);
  const centerMarkerRef = useRef<L.Marker | null>(null);
  const incidentsLayerRef = useRef<L.LayerGroup | null>(null);

  const targetLat = selectedNodeCoords ? selectedNodeCoords.lat : dashboard.location.lat;
  const targetLng = selectedNodeCoords ? selectedNodeCoords.lng : dashboard.location.lng;
  const targetName = selectedNodeCoords ? selectedNodeCoords.name : dashboard.reservoir_name;

  // Custom node icon
  const createNodeIcon = () => {
    return L.divIcon({
      className: 'custom-node-icon',
      html: `
        <div style="display:flex; align-items:center; justify-content:center; width:34px; height:34px; border-radius:50%; background:#047857; color:white; box-shadow:0 0 16px rgba(4,120,87,0.7); border:3px solid #ffffff;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 34],
      popupAnchor: [0, -34],
    });
  };

  // Custom incident icon
  const createIncidentIcon = (urgency: string) => {
    const bg = urgency === 'CRITICA' ? '#dc2626' : urgency === 'ALTA' ? '#ea580c' : '#d97706';
    return L.divIcon({
      className: 'custom-incident-icon',
      html: `
        <div style="display:flex; align-items:center; justify-content:center; width:30px; height:30px; border-radius:50%; background:${bg}; color:white; box-shadow:0 0 12px ${bg}; border:2.5px solid #ffffff;">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
        </div>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 30],
      popupAnchor: [0, -30],
    });
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        attributionControl: false,
      }).setView([targetLat, targetLng], 16);

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

      // Marcador central del nodo
      const marker = L.marker([targetLat, targetLng], { icon: createNodeIcon() }).addTo(map);
      marker.bindPopup(`
        <div style="color: #0f172a; font-family: sans-serif; font-size: 12px; line-height: 1.4;">
          <span style="display:inline-block; padding: 2px 6px; background:#047857; color:white; border-radius: 4px; font-size:10px; font-weight:600; margin-bottom:4px;">NODO TELEMÉTRICO ACTIVO</span><br/>
          <strong style="font-size:13px;">${targetName}</strong><br/>
          <span style="color:#475569;">Sensor Ultrasónico IP67 + Panel Solar</span>
        </div>
      `);
      centerMarkerRef.current = marker;

      // Radio de afectación hidráulica
      const circle = L.circle([targetLat, targetLng], {
        color: '#059669',
        fillColor: '#10b981',
        fillOpacity: 0.25,
        radius: 280,
      }).addTo(map);
      alertCircleRef.current = circle;

      // Módulos de bio-retención e infraestructura verde
      const g1 = L.circleMarker([12.1265, -86.1775], {
        radius: 8,
        color: '#059669',
        fillColor: '#34d399',
        fillOpacity: 0.9,
      }).addTo(map);
      g1.bindPopup(`
        <div style="color:#0f172a; font-family:sans-serif; font-size:12px; line-height:1.4;">
          <span style="display:inline-block; padding: 2px 6px; background:#059669; color:white; border-radius: 4px; font-size:10px; font-weight:600; margin-bottom:4px;">INFRAESTRUCTURA VERDE</span><br/>
          <strong style="font-size:13px;">Jardín de Bio-Retención Norte</strong><br/>
          <span style="color:#475569;">Infiltra y retiene 45,000 L de escorrentía pluvial.</span>
        </div>
      `);

      const g2 = L.circleMarker([12.1235, -86.1748], {
        radius: 8,
        color: '#059669',
        fillColor: '#34d399',
        fillOpacity: 0.9,
      }).addTo(map);
      g2.bindPopup(`
        <div style="color:#0f172a; font-family:sans-serif; font-size:12px; line-height:1.4;">
          <span style="display:inline-block; padding: 2px 6px; background:#059669; color:white; border-radius: 4px; font-size:10px; font-weight:600; margin-bottom:4px;">INFRAESTRUCTURA VERDE</span><br/>
          <strong style="font-size:13px;">Franja Bio-Filtrante Sur</strong><br/>
          <span style="color:#475569;">Retarda el pico de crecida (+42 min) y reduce sedimentos en 68%.</span>
        </div>
      `);

      // Grupo de incidentes ciudadanos
      const incidentsGroup = L.layerGroup().addTo(map);
      incidentsLayerRef.current = incidentsGroup;

      mapInstanceRef.current = map;
    } else {
      // Paneo suave cuando cambia de nodo seleccionado
      mapInstanceRef.current.flyTo([targetLat, targetLng], 16, { duration: 1.5 });
      if (centerMarkerRef.current) {
        centerMarkerRef.current.setLatLng([targetLat, targetLng]);
        centerMarkerRef.current.setPopupContent(`
          <div style="color: #0f172a; font-family: sans-serif; font-size: 12px; line-height: 1.4;">
            <span style="display:inline-block; padding: 2px 6px; background:#047857; color:white; border-radius: 4px; font-size:10px; font-weight:600; margin-bottom:4px;">NODO TELEMÉTRICO ACTIVO</span><br/>
            <strong style="font-size:13px;">${targetName}</strong><br/>
            <span style="color:#475569;">Puesto de monitoreo hidrométrico en tiempo real</span>
          </div>
        `);
      }
      if (alertCircleRef.current) {
        alertCircleRef.current.setLatLng([targetLat, targetLng]);
      }
    }

    // Actualizar color y radio según el nivel de riesgo
    if (alertCircleRef.current) {
      let color = '#059669';
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
  }, [targetLat, targetLng, targetName, dashboard.status]);

  // Actualizar marcadores de incidentes ciudadanos en el mapa
  useEffect(() => {
    if (!incidentsLayerRef.current) return;

    incidentsLayerRef.current.clearLayers();

    incidents.forEach((inc) => {
      const urgency = inc.ai_analysis?.urgency_level || 'ALTA';
      const icon = createIncidentIcon(urgency);

      const marker = L.marker([inc.latitude, inc.longitude], { icon });

      // Preparar URL de imagen (si es relativa, apuntar a localhost:8000)
      let photoSrc = inc.photo_url || '';
      if (photoSrc.startsWith('/')) {
        photoSrc = `http://localhost:8000${photoSrc}`;
      }

      const popupHtml = `
        <div style="color: #0f172a; font-family: sans-serif; font-size: 12px; max-width: 250px; line-height: 1.4;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 6px;">
            <span style="padding: 2px 6px; background: #ea580c; color: white; border-radius: 4px; font-size: 9px; font-weight: 700;">
              REPORTE CIUDADANO (IA)
            </span>
            <span style="font-size:10px; color:#64748b; font-weight:600;">
              ${inc.ai_analysis?.confidence_pct || 94}% confianza
            </span>
          </div>

          ${
            photoSrc
              ? `<div style="width:100%; height:110px; border-radius:8px; overflow:hidden; margin-bottom:6px; background:#000;">
                   <img src="${photoSrc}" alt="Reporte" style="width:100%; height:100%; object-fit:cover;" />
                 </div>`
              : ''
          }

          <strong style="font-size:12px; display:block; margin-bottom:2px;">${inc.description}</strong>
          <span style="font-size:10px; color:#64748b; display:block;">Reportado por: ${inc.reporter_name}</span>

          <div style="margin-top:6px; padding:6px; background:#f8fafc; border-radius:6px; border:1px solid #e2e8f0; font-size:10px; color:#334155;">
            <strong>Acción sugerida:</strong> ${inc.ai_analysis?.suggested_action || 'Inspección de cuadrilla'}
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);
      incidentsLayerRef.current?.addLayer(marker);
    });
  }, [incidents]);

  return (
    <div className="space-y-4">
      <div
        className={`rounded-2xl border p-4 transition-all shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 ${
          isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>Vista Satelital: {targetName}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Coordenadas: {targetLat.toFixed(4)}° N, {targetLng.toFixed(4)}° O (WGS84 • SINAPRED)
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs flex-wrap">
          <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                dashboard.status === 'ROJO'
                  ? 'bg-red-500'
                  : dashboard.status === 'AMARILLO'
                  ? 'bg-amber-500'
                  : 'bg-emerald-600'
              }`}
            />
            Área de influencia hidráulica
          </span>

          <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            Bio-retención
          </span>

          <span className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
            Reportes Ciudadanos (IA)
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
