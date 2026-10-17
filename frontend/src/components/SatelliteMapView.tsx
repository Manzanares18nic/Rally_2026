import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Layers, MapPin, ZoomIn, Camera, X, Maximize2 } from 'lucide-react';
import type { DashboardSummary, Incident } from '../services/api';

interface SatelliteMapProps {
  dashboard: DashboardSummary;
  isDark: boolean;
  selectedNodeCoords?: { lat: number; lng: number; name: string };
  incidents?: Incident[];
}

// Red de Nodos de Managua con coordenadas y radios de influencia
const ALL_NETWORK_NODES = [
  {
    id: 'node-01',
    name: 'Nodo 01: Cauce La Maravilla (Sabana Grande)',
    lat: 12.1249,
    lng: -86.1761,
    radius: 280,
    color: '#047857',
    sensor: 'Ultrasónico JSN-SR04T IP67 + Panel Solar',
    photo: '/images/reservorio1.jpeg',
    status: 'ONLINE',
  },
  {
    id: 'node-02',
    name: 'Nodo 02: Microrrepresa Barrial 31 de Diciembre',
    lat: 12.1485,
    lng: -86.2085,
    radius: 240,
    color: '#0284c7',
    sensor: 'Ultrasónico Sellado + Pluviómetro de Balancín',
    photo: '/images/reservorio2.jpeg',
    status: 'ONLINE',
  },
  {
    id: 'node-03',
    name: 'Nodo 03: Drenaje Laguneta Tiscapa Norte',
    lat: 12.1350,
    lng: -86.2700,
    radius: 260,
    color: '#d97706',
    sensor: 'Ultrasónico + Enlace GSM SIM800L (Batería 18%)',
    photo: '/images/reservorio3.jpg',
    status: 'ALERTA',
  },
];

// Puntos fotográficos fijos de referencia en la cuenca
const SITE_PHOTO_POINTS = [
  {
    id: 'site-photo-1',
    title: 'Puente Peatonal y Cauce La Maravilla',
    description: 'Punto de confluencia de escorrentía donde se instaló el nodo de medición acústica.',
    lat: 12.1255,
    lng: -86.1768,
    photoUrl: '/images/reservorio1.jpeg',
    tag: 'Infraestructura',
  },
  {
    id: 'site-photo-2',
    title: 'Desagüe y Franja Bio-Filtrante Sur',
    description: 'Margen estabilizado con vegetación para retardar el pico de inundación en la Pista.',
    lat: 12.1238,
    lng: -86.1752,
    photoUrl: '/images/reservorio2.jpeg',
    tag: 'Bio-Retención',
  },
  {
    id: 'site-photo-3',
    title: 'Compuerta y Vertedor de Alivio Sabana Grande',
    description: 'Estructura de descarga controlada para evitar el colapso del terraplén vial.',
    lat: 12.1262,
    lng: -86.1782,
    photoUrl: '/images/reservorio3.jpg',
    tag: 'Aliviadero',
  },
];

export const SatelliteMapView: React.FC<SatelliteMapProps> = ({
  dashboard,
  isDark,
  selectedNodeCoords,
  incidents = [],
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const nodeMarkersRef = useRef<L.Marker[]>([]);
  const nodeCirclesRef = useRef<L.Circle[]>([]);
  const incidentsLayerRef = useRef<L.LayerGroup | null>(null);
  const lastIncidentsCountRef = useRef<number>(-1);

  // Estado para visualizador de foto en grande (modal lightbox con desenfoque)
  const [modalPhoto, setModalPhoto] = useState<{ url: string; title: string; desc?: string } | null>(null);

  const targetLat = selectedNodeCoords ? selectedNodeCoords.lat : dashboard.location.lat;
  const targetLng = selectedNodeCoords ? selectedNodeCoords.lng : dashboard.location.lng;
  const targetName = selectedNodeCoords ? selectedNodeCoords.name : dashboard.reservoir_name;

  // Custom node icon
  const createNodeIcon = (color = '#047857', isSelected = false) => {
    return L.divIcon({
      className: 'custom-node-icon',
      html: `
        <div style="display:flex; align-items:center; justify-content:center; width:${isSelected ? 38 : 32}px; height:${isSelected ? 38 : 32}px; border-radius:50%; background:${color}; color:white; box-shadow:0 0 ${isSelected ? 18 : 10}px ${color}; border:${isSelected ? 3.5 : 2.5}px solid #ffffff;">
          <svg width="${isSelected ? 20 : 16}" height="${isSelected ? 20 : 16}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
        </div>
      `,
      iconSize: [isSelected ? 38 : 32, isSelected ? 38 : 32],
      iconAnchor: [isSelected ? 19 : 16, isSelected ? 38 : 32],
      popupAnchor: [0, -32],
    });
  };

  // Custom photo point icon
  const createPhotoIcon = () => {
    return L.divIcon({
      className: 'custom-photo-icon',
      html: `
        <div style="display:flex; align-items:center; justify-content:center; width:30px; height:30px; border-radius:50%; background:#059669; color:white; box-shadow:0 0 12px rgba(5,150,105,0.7); border:2.5px solid #ffffff; cursor:pointer;">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
        </div>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 30],
      popupAnchor: [0, -30],
    });
  };

  // Custom incident icon
  const createIncidentIcon = (urgency: string) => {
    const bg = urgency === 'CRITICA' ? '#dc2626' : urgency === 'ALTA' ? '#ea580c' : '#d97706';
    return L.divIcon({
      className: 'custom-incident-icon',
      html: `
        <div style="display:flex; align-items:center; justify-content:center; width:30px; height:30px; border-radius:50%; background:${bg}; color:white; box-shadow:0 0 12px ${bg}; border:2.5px solid #ffffff; cursor:pointer;">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 9v4"/><path d="M12 17h.01"/><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/></svg>
        </div>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 30],
      popupAnchor: [0, -30],
    });
  };

  // Inicialización del Mapa
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        attributionControl: false,
        closePopupOnClick: false, // NO cerrar al hacer clic en el mapa
      }).setView([targetLat, targetLng], 15);

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

      // 1. RENDERIZAR TODOS LOS RADIOS Y NODOS SIMULTÁNEAMENTE
      ALL_NETWORK_NODES.forEach((node) => {
        const isSelected = Math.abs(node.lat - targetLat) < 0.001 && Math.abs(node.lng - targetLng) < 0.001;

        // Círculo de influencia hidráulica
        const circle = L.circle([node.lat, node.lng], {
          color: node.color,
          fillColor: node.color,
          fillOpacity: isSelected ? 0.28 : 0.16,
          radius: node.radius,
          weight: isSelected ? 3 : 1.5,
        }).addTo(map);
        nodeCirclesRef.current.push(circle);

        // Marcador del nodo
        const marker = L.marker([node.lat, node.lng], {
          icon: createNodeIcon(node.color, isSelected),
        }).addTo(map);

        marker.bindPopup(
          `
          <div style="color: #0f172a; font-family: sans-serif; font-size: 12px; line-height: 1.4; min-width: 200px;">
            <span style="display:inline-block; padding: 2px 6px; background:${node.color}; color:white; border-radius: 4px; font-size:10px; font-weight:700; margin-bottom:4px;">
              ${node.status === 'ONLINE' ? 'NODO HIDROMÉTRICO ACTIVO' : 'NODO EN ALERTA'}
            </span><br/>
            <strong style="font-size:13px;">${node.name}</strong><br/>
            <span style="color:#475569; font-size:11px;">${node.sensor}</span>
            <div style="margin-top:6px; border-radius:6px; overflow:hidden; height:85px; background:#000;">
              <img src="${node.photo}" alt="${node.name}" style="width:100%; height:100%; object-fit:cover;" />
            </div>
            <div style="margin-top:4px; font-size:10px; color:#059669; font-weight:600;">
              Radio de cobertura: ${node.radius} metros
            </div>
          </div>
        `,
          {
            autoClose: false,
            closeOnClick: false,
            closeButton: true,
          }
        );

        nodeMarkersRef.current.push(marker);
      });

      // 2. RENDERIZAR PUNTOS FOTOGRÁFICOS DE SITIO
      SITE_PHOTO_POINTS.forEach((pt) => {
        const pMarker = L.marker([pt.lat, pt.lng], { icon: createPhotoIcon() }).addTo(map);
        pMarker.bindPopup(
          `
          <div style="color: #0f172a; font-family: sans-serif; font-size: 12px; line-height: 1.4; max-width: 240px;">
            <span style="display:inline-block; padding: 2px 6px; background:#059669; color:white; border-radius: 4px; font-size:10px; font-weight:700; margin-bottom:4px;">
              FOTOGRAFÍA DEL SITIO
            </span><br/>
            <strong style="font-size:12px;">${pt.title}</strong><br/>
            <p style="color:#475569; font-size:11px; margin: 4px 0;">${pt.description}</p>
            <div style="border-radius:8px; overflow:hidden; height:110px; background:#000; margin-top:4px;">
              <img src="${pt.photoUrl}" alt="${pt.title}" style="width:100%; height:100%; object-fit:cover;" />
            </div>
          </div>
        `,
          {
            autoClose: false,
            closeOnClick: false,
            closeButton: true,
          }
        );
      });

      // 3. CAPA DE INCIDENTES CIUDADANOS
      const incidentsGroup = L.layerGroup().addTo(map);
      incidentsLayerRef.current = incidentsGroup;

      mapInstanceRef.current = map;
    } else {
      // Paneo suave cuando cambia de nodo seleccionado sin destruir el mapa ni cerrar popups
      mapInstanceRef.current.flyTo([targetLat, targetLng], 15.5, { duration: 1.5 });
    }
  }, [targetLat, targetLng]);

  // Actualizar marcadores de incidentes ciudadanos solo si cambia la cantidad (evita parpadeo cada 2.5s)
  useEffect(() => {
    if (!incidentsLayerRef.current) return;

    if (lastIncidentsCountRef.current === incidents.length) {
      return; // No volver a vaciar las capas si es el mismo set
    }
    lastIncidentsCountRef.current = incidents.length;

    incidentsLayerRef.current.clearLayers();

    incidents.forEach((inc) => {
      const urgency = inc.ai_analysis?.urgency_level || 'ALTA';
      const icon = createIncidentIcon(urgency);

      const marker = L.marker([inc.latitude, inc.longitude], { icon });

      let photoSrc = inc.photo_url || '';
      if (photoSrc.startsWith('/')) {
        photoSrc = `http://localhost:8000${photoSrc}`;
      }

      const popupHtml = `
        <div style="color: #0f172a; font-family: sans-serif; font-size: 12px; max-width: 250px; line-height: 1.4;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 6px;">
            <span style="padding: 2px 6px; background: #ea580c; color: white; border-radius: 4px; font-size: 9px; font-weight: 700;">
              REPORTE CIUDADANO
            </span>
            <span style="font-size:10px; color:#ea580c; font-weight:700;">
              Prioridad Alta
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
            <strong>Acción recomendada:</strong> ${inc.ai_analysis?.suggested_action || 'Inspección de cuadrilla municipal'}
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        autoClose: false,
        closeOnClick: false,
        closeButton: true,
      });

      incidentsLayerRef.current?.addLayer(marker);
    });
  }, [incidents]);

  return (
    <div className="space-y-4">
      {/* Barra de información del mapa con el Logo oficial */}
      <div
        className={`rounded-2xl border p-4 transition-all shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 ${
          isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex items-center gap-3">
          <img
            src="/images/logo.jpeg"
            alt="Logo PluviTec"
            className="w-10 h-10 rounded-xl object-cover border border-[#00A8E8]/40 shadow-xs shrink-0"
          />
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>Red Multicuenca: {targetName}</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Coordenadas: {targetLat.toFixed(4)}° N, {targetLng.toFixed(4)}° O (WGS84 • ESRI Satélite HD)
            </p>
          </div>
        </div>

        {/* Leyenda de la Red de Nodos y Fotos */}
        <div className="flex items-center gap-3 text-xs flex-wrap">
          <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
            Nodo Sabana Grande
          </span>

          <span className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
            Nodo 31 Diciembre
          </span>

          <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            Nodo Tiscapa
          </span>

          <span className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
            Reportes Ciudadanos
          </span>
        </div>
      </div>

      {/* Contenedor del Mapa Satelital */}
      <div
        className={`relative w-full h-[540px] rounded-2xl border overflow-hidden shadow-xs ${
          isDark ? 'border-slate-800' : 'border-slate-200'
        }`}
      >
        <div ref={mapContainerRef} className="w-full h-full" />
      </div>

      {/* Galería de Fotografías del Sitio */}
      <div
        className={`rounded-2xl border p-4 ${
          isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
        } shadow-xs space-y-3`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Fotografías Reales de la Cuenca y Puntos de Intervención
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Toca cualquier foto para ampliarla
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {SITE_PHOTO_POINTS.map((pt) => (
            <div
              key={pt.id}
              onClick={() => setModalPhoto({ url: pt.photoUrl, title: pt.title, desc: pt.description })}
              className="relative h-36 rounded-xl overflow-hidden cursor-pointer group shadow-xs border border-slate-200 dark:border-slate-800"
            >
              <img
                src={pt.photoUrl}
                alt={pt.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-2 left-2 right-2 flex justify-between items-end text-white text-xs">
                <div>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-700">
                    {pt.tag}
                  </span>
                  <p className="font-semibold text-xs mt-1 truncate">{pt.title}</p>
                </div>
                <Maximize2 className="w-3.5 h-3.5 opacity-80 group-hover:opacity-100" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL LIGHTBOX DE FOTO AMPLIADA CON DESENFOQUE DETRÁS */}
      {modalPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className={`relative w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden transition-all ${
              isDark
                ? 'bg-[#0f172a] border-slate-800 text-slate-100'
                : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-800">
              <h4 className="font-bold text-sm">{modalPhoto.title}</h4>
              <button
                onClick={() => setModalPhoto(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="relative w-full max-h-[70vh] bg-black overflow-hidden flex items-center justify-center">
              <img
                src={modalPhoto.url}
                alt={modalPhoto.title}
                className="w-full h-auto max-h-[70vh] object-contain"
              />
            </div>
            {modalPhoto.desc && (
              <div className="p-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800">
                {modalPhoto.desc}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
