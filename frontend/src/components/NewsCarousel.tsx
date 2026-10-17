import React, { useState, useEffect } from 'react';
import {
  Play,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Newspaper,
  Calendar,
  Eye,
  CheckCircle2,
} from 'lucide-react';

export interface NewsItem {
  id: string;
  youtubeId: string;
  title: string;
  source: string;
  category: string;
  badge: string;
  description: string;
  thumbnail: string;
  url: string;
  duration?: string;
}

const NEWS_VIDEOS: NewsItem[] = [
  {
    id: 'news-1',
    youtubeId: 'N2YCajbUNdM',
    title: 'Avanza el proyecto de Drenaje Pluvial y Alcantarillado en Managua',
    source: 'Viva Nicaragua Canal 13',
    category: 'Obras de Mitigación',
    badge: 'Infraestructura Urbana',
    description:
      'Supervisión de obras de alcantarillado sanitario y canalización de cauces para reducir la vulnerabilidad y anegamientos en barrios críticos de Managua.',
    thumbnail: 'https://i.ytimg.com/vi/N2YCajbUNdM/hqdefault.jpg',
    url: 'https://www.youtube.com/watch?v=N2YCajbUNdM',
    duration: '2:15 min',
  },
  {
    id: 'news-2',
    youtubeId: 'HSrklig2I2s',
    title: 'Reservorio Superficial: Captación y Manejo de Escorrentía',
    source: 'MAG Nicaragua (Ministerio Agropecuario)',
    category: 'Ingeniería Hídrica',
    badge: 'Cosecha de Agua',
    description:
      'Técnicas de diseño, compactación y geomembranas en reservorios superficiales para almacenar agua pluvial y regular picos de escorrentía.',
    thumbnail: 'https://i.ytimg.com/vi/HSrklig2I2s/hqdefault.jpg',
    url: 'https://www.youtube.com/watch?v=HSrklig2I2s',
    duration: '3:40 min',
  },
  {
    id: 'news-3',
    youtubeId: 'LlqNa5M0whs',
    title: 'Modelos de Reservorios y Control de Crecidas Pluviales',
    source: 'MAG Nicaragua',
    category: 'Gestión de Cuencas',
    badge: 'Prevención Pluvial',
    description:
      'Explicación práctica de las dimensiones, taludes de contención y capacidad de amortiguamiento hidráulico ante tormentas tropicales intensas.',
    thumbnail: 'https://i.ytimg.com/vi/LlqNa5M0whs/hqdefault.jpg',
    url: 'https://www.youtube.com/watch?v=LlqNa5M0whs',
    duration: '2:50 min',
  },
  {
    id: 'news-4',
    youtubeId: 'QBkwGCcY-fs',
    title: 'Mantenimiento Preventivo y Limpieza de Sedimentos en Reservorios',
    source: 'MAG Nicaragua',
    category: 'Mantenimiento Crítico',
    badge: 'Desarenado y Cuidados',
    description:
      'Recomendaciones para retiro de sedimentos, protección de bordes y preservación de obras de drenaje pluvial para evitar obstrucciones y desbordes.',
    thumbnail: 'https://i.ytimg.com/vi/QBkwGCcY-fs/hqdefault.jpg',
    url: 'https://www.youtube.com/watch?v=QBkwGCcY-fs',
    duration: '4:10 min',
  },
];

interface NewsCarouselProps {
  isDark: boolean;
}

export const NewsCarousel: React.FC<NewsCarouselProps> = ({ isDark }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAutoPlay, setIsAutoPlay] = useState(false);

  const currentNews = NEWS_VIDEOS[currentIndex];

  const handlePrev = () => {
    setIsPlaying(false);
    setCurrentIndex((prev) => (prev === 0 ? NEWS_VIDEOS.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setIsPlaying(false);
    setCurrentIndex((prev) => (prev === NEWS_VIDEOS.length - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    if (!isAutoPlay || isPlaying) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev === NEWS_VIDEOS.length - 1 ? 0 : prev + 1));
    }, 6000);
    return () => clearInterval(interval);
  }, [isAutoPlay, isPlaying]);

  return (
    <section
      className={`rounded-2xl border p-5 md:p-6 transition-all shadow-xs ${
        isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
      }`}
    >
      {/* Header del Carrusel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Newspaper className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
              Noticias y Educación Comunitaria sobre Drenajes y Reservorios
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Videos oficiales sobre obras pluviales, manejo de cuencas y mantenimiento preventivo en Nicaragua
            </p>
          </div>
        </div>

        {/* Controles de Navegación */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mr-2">
            {currentIndex + 1} de {NEWS_VIDEOS.length}
          </span>
          <button
            onClick={handlePrev}
            aria-label="Noticia anterior"
            className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNext}
            aria-label="Noticia siguiente"
            className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tarjeta del Video Principal en Carrusel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
        {/* Contenedor del Reproductor / Miniatura Interactiva */}
        <div className="lg:col-span-7">
          <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black shadow-md border border-slate-800">
            {isPlaying ? (
              <iframe
                src={`https://www.youtube.com/embed/${currentNews.youtubeId}?autoplay=1&rel=0`}
                title={currentNews.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="relative w-full h-full group cursor-pointer" onClick={() => setIsPlaying(true)}>
                <img
                  src={currentNews.thumbnail}
                  alt={currentNews.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Botón de reproducción grande */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-emerald-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-emerald-600 transition-all">
                    <Play className="w-6 h-6 fill-white ml-0.5" />
                  </div>
                </div>

                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
                  <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs font-semibold text-[11px]">
                    {currentNews.duration}
                  </span>
                  <span className="text-[11px] text-white/80 group-hover:text-white flex items-center gap-1 font-medium">
                    <Eye className="w-3.5 h-3.5" />
                    Reproducir en la app
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Información y descripción de la noticia */}
        <div className="lg:col-span-5 space-y-3.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              {currentNews.badge}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {currentNews.source}
            </span>
          </div>

          <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-snug">
            {currentNews.title}
          </h4>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {currentNews.description}
          </p>

          <div className="pt-2 flex items-center gap-3">
            {!isPlaying ? (
              <button
                onClick={() => setIsPlaying(true)}
                className="py-2 px-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Ver video aquí</span>
              </button>
            ) : (
              <button
                onClick={() => setIsPlaying(false)}
                className="py-2 px-3.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors"
              >
                <span>Cerrar reproductor</span>
              </button>
            )}

            <a
              href={currentNews.url}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <span>Abrir en YouTube</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Miniaturas inferiores para saltar directamente */}
      <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {NEWS_VIDEOS.map((item, idx) => (
          <button
            key={item.id}
            onClick={() => {
              setIsPlaying(false);
              setCurrentIndex(idx);
            }}
            className={`p-2 rounded-xl text-left border transition-all flex flex-col justify-between ${
              currentIndex === idx
                ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-xs ring-1 ring-emerald-500/30'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-transparent'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                Noticia 0{idx + 1}
              </span>
              {currentIndex === idx && (
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
              )}
            </div>
            <p className="text-[11px] font-medium text-slate-800 dark:text-slate-200 line-clamp-1">
              {item.title}
            </p>
          </button>
        ))}
      </div>
    </section>
  );
};
