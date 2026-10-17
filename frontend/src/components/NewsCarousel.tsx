import React, { useState, useRef } from 'react';
import {
  Play,
  ChevronLeft,
  ChevronRight,
  X,
  ExternalLink,
  Video,
  Clock,
  Building2,
  Eye,
} from 'lucide-react';

export interface VideoItem {
  id: string;
  youtubeId: string;
  title: string;
  source: string;
  tag: string;
  duration: string;
  thumbnail: string;
  description: string;
  url: string;
}

const VIDEO_STORIES: VideoItem[] = [
  {
    id: 'vid-1',
    youtubeId: 'N2YCajbUNdM',
    title: 'Avanza el proyecto de Drenaje Pluvial en Managua',
    source: 'Viva Nicaragua Canal 13',
    tag: 'Obras de Mitigación',
    duration: '2:15 min',
    thumbnail: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=600&q=80',
    description:
      'Supervisión de obras de alcantarillado sanitario y canalización de cauces para reducir la vulnerabilidad y anegamientos en barrios críticos de Managua.',
    url: 'https://www.youtube.com/watch?v=N2YCajbUNdM',
  },
  {
    id: 'vid-2',
    youtubeId: 'HSrklig2I2s',
    title: 'Reservorio Superficial: Captación de Escorrentía',
    source: 'MAG Nicaragua',
    tag: 'Cosecha de Agua',
    duration: '3:40 min',
    thumbnail: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=600&q=80',
    description:
      'Técnicas de diseño, compactación y geomembranas en reservorios superficiales para almacenar agua pluvial y regular picos de escorrentía.',
    url: 'https://www.youtube.com/watch?v=HSrklig2I2s',
  },
  {
    id: 'vid-3',
    youtubeId: 'LlqNa5M0whs',
    title: 'Modelos de Reservorios y Control de Crecidas',
    source: 'MAG Nicaragua',
    tag: 'Ingeniería Hídrica',
    duration: '2:50 min',
    thumbnail: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=600&q=80',
    description:
      'Explicación práctica de las dimensiones, taludes de contención y capacidad de amortiguamiento hidráulico ante tormentas tropicales intensas.',
    url: 'https://www.youtube.com/watch?v=LlqNa5M0whs',
  },
  {
    id: 'vid-4',
    youtubeId: 'QBkwGCcY-fs',
    title: 'Mantenimiento y Limpieza de Sedimentos',
    source: 'MAG Nicaragua',
    tag: 'Desarenado',
    duration: '4:10 min',
    thumbnail: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80',
    description:
      'Recomendaciones para retiro de sedimentos, protección de bordes y preservación de obras de drenaje pluvial para evitar obstrucciones y desbordes.',
    url: 'https://www.youtube.com/watch?v=QBkwGCcY-fs',
  },
  {
    id: 'vid-5',
    youtubeId: 'N2YCajbUNdM',
    title: 'Sistemas de Alcantarillado y Drenaje Barrial',
    source: 'Canal 13 Managua',
    tag: 'Prevención Urbana',
    duration: '3:05 min',
    thumbnail: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=600&q=80',
    description:
      'Canalización pluvial y mitigación de desbordes en puntos vulnerables de la cuenca sur de Managua.',
    url: 'https://www.youtube.com/watch?v=N2YCajbUNdM',
  },
];

interface NewsCarouselProps {
  isDark: boolean;
}

export const NewsCarousel: React.FC<NewsCarouselProps> = ({ isDark }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -260, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 260, behavior: 'smooth' });
    }
  };

  return (
    <section className="space-y-3">
      {/* Título de la sección */}
      <div className="flex items-center justify-between px-1">
        <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          Carrusel Shorts YouTube
        </h3>
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Toca cualquier video para reproducir en grande
        </span>
      </div>

      {/* Contenedor del Carrusel idéntico a carrusel.jpg */}
      <div className="relative group/carousel">
        {/* Flecha Izquierda */}
        <button
          onClick={scrollLeft}
          aria-label="Anterior"
          className="absolute -left-3.5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105 border border-white/20 backdrop-blur-xs"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Fila de Tarjetas Verticales con Scroll Horizontal */}
        <div
          ref={scrollContainerRef}
          className="flex items-center gap-3.5 overflow-x-auto scrollbar-none scroll-smooth px-1 py-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {VIDEO_STORIES.map((vid) => (
            <div
              key={vid.id}
              onClick={() => setSelectedVideo(vid)}
              className="relative shrink-0 w-[175px] sm:w-[190px] md:w-[200px] h-[280px] sm:h-[300px] md:h-[320px] rounded-2xl overflow-hidden cursor-pointer shadow-md group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl bg-slate-900"
            >
              {/* Imagen de Fondo Vertical */}
              <img
                src={vid.thumbnail}
                alt={vid.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />

              {/* Degradado oscuro inferior como en carrusel.jpg */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/10" />

              {/* Botón Circular de Reproducción Centrado */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-white/90 group-hover:bg-white text-slate-900 flex items-center justify-center shadow-lg group-hover:scale-110 transition-all">
                  <Play className="w-5 h-5 fill-slate-900 ml-0.5" />
                </div>
              </div>

              {/* Título en la parte inferior */}
              <div className="absolute bottom-0 left-0 right-0 p-3.5 space-y-1">
                <p className="text-xs font-semibold text-white leading-snug line-clamp-2 drop-shadow-sm">
                  {vid.title}
                </p>
                <div className="flex items-center justify-between text-[10px] text-white/75 font-medium">
                  <span className="truncate max-w-[110px]">{vid.source}</span>
                  <span>{vid.duration}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Flecha Derecha */}
        <button
          onClick={scrollRight}
          aria-label="Siguiente"
          className="absolute -right-3.5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105 border border-white/20 backdrop-blur-xs"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* MODAL LIGHTBOX EN GRANDE CON DESENFOQUE DETRÁS (BACKDROP BLUR) */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className={`relative w-full max-w-3xl rounded-2xl border shadow-2xl overflow-hidden transition-all ${
              isDark
                ? 'bg-[#0f172a] border-slate-800 text-slate-100'
                : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            {/* Cabecera del Modal */}
            <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-700 text-white">
                  {selectedVideo.tag}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {selectedVideo.source}
                </span>
              </div>
              <button
                onClick={() => setSelectedVideo(null)}
                aria-label="Cerrar reproductor"
                className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Reproductor de Video en Grande */}
            <div className="relative w-full aspect-video bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}?autoplay=1&rel=0`}
                title={selectedVideo.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Información detallada del video en el modal */}
            <div className="p-5 space-y-3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 leading-snug">
                  {selectedVideo.title}
                </h4>

                <a
                  href={selectedVideo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
                >
                  <span>Abrir en YouTube</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {selectedVideo.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
