import React, { useState, useEffect } from 'react';
import {
  Sprout,
  Droplets,
  Clock,
  TrendingDown,
  Sun,
  CloudRain,
  Wind,
  Thermometer,
  ShieldCheck,
  CheckCircle2,
  Layers,
  Trees,
  Compass,
  Waves,
  Calendar,
  Sparkles,
  Maximize2,
} from 'lucide-react';
import { fetchWeatherData, type WeatherData } from '../services/api';

interface GreenInfrastructureProps {
  isDark: boolean;
}

export const GreenInfrastructureView: React.FC<GreenInfrastructureProps> = ({ isDark }) => {
  // Estado climatológico en tiempo real (Open-Meteo)
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState<boolean>(true);

  // Selector de temporada interactivo: 'SECA' | 'LLUVIOSA'
  const currentMonth = new Date().getMonth() + 1; // 1-12
  const isDefaultRainy = currentMonth >= 5 && currentMonth <= 10;
  const [activeSeason, setActiveSeason] = useState<'SECA' | 'LLUVIOSA'>(
    isDefaultRainy ? 'LLUVIOSA' : 'SECA'
  );

  // Modal para ver foto ampliada
  const [selectedPhoto, setSelectedPhoto] = useState<{ url: string; caption: string } | null>(null);

  useEffect(() => {
    let mounted = true;
    fetchWeatherData(12.1249, -86.1761)
      .then((data) => {
        if (mounted) {
          setWeather(data);
          setIsLoadingWeather(false);
        }
      })
      .catch(() => {
        if (mounted) setIsLoadingWeather(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2">
      {/* 1. Barra de Clima en Tiempo Real (Open-Meteo API) */}
      <section
        className={`rounded-2xl border p-4 md:p-5 transition-all shadow-xs ${
          isDark
            ? 'bg-slate-900/80 border-slate-800 text-slate-200'
            : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 shrink-0">
              {activeSeason === 'LLUVIOSA' ? (
                <CloudRain className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Sun className="w-5 h-5 text-amber-500" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Climatología en Vivo • Open-Meteo (Managua, Sabana Grande)
                </span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <h2 className="text-sm md:text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                {weather?.weatherDescription || 'Monitoreo Climatológico Activo'}
              </h2>
            </div>
          </div>

          {/* Métricas meteorológicas */}
          <div className="flex items-center gap-4 flex-wrap text-xs">
            <div className="flex items-center gap-1.5">
              <Thermometer className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span className="text-slate-500 dark:text-slate-400">Temp:</span>
              <strong className="text-slate-800 dark:text-slate-100">
                {weather ? `${weather.temperature}°C` : '28.5°C'}
              </strong>
            </div>

            <div className="flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="text-slate-500 dark:text-slate-400">Humedad:</span>
              <strong className="text-slate-800 dark:text-slate-100">
                {weather ? `${weather.relativeHumidity}%` : '78%'}
              </strong>
            </div>

            <div className="flex items-center gap-1.5">
              <CloudRain className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span className="text-slate-500 dark:text-slate-400">Prob. Lluvia hoy:</span>
              <strong className="text-emerald-700 dark:text-emerald-400 font-bold">
                {weather ? `${weather.rainProbability}%` : '65%'}
              </strong>
            </div>

            <div className="flex items-center gap-1.5">
              <Wind className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-slate-500 dark:text-slate-400">Viento:</span>
              <strong className="text-slate-800 dark:text-slate-100">
                {weather ? `${weather.windSpeed} km/h` : '12 km/h'}
              </strong>
            </div>
          </div>
        </div>

        {/* Selector interactivo de temporada para visualizar el comportamiento del reservorio */}
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Simular Comportamiento Estacional del Reservorio:
            </span>
          </div>

          <div className="inline-flex rounded-xl p-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
            <button
              onClick={() => setActiveSeason('SECA')}
              className={`px-3.5 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                activeSeason === 'SECA'
                  ? 'bg-[#70C167] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>Época Seca (Parques y Convivencia)</span>
            </button>

            <button
              onClick={() => setActiveSeason('LLUVIOSA')}
              className={`px-3.5 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                activeSeason === 'LLUVIOSA'
                  ? 'bg-[#00A8E8] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <CloudRain className="w-3.5 h-3.5" />
              <span>Temporada Lluviosa (Regulación Hidráulica)</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. Concepto Arquitectónico Central (Solución Solicitada) */}
      <section
        className={`rounded-2xl border p-6 md:p-8 transition-all shadow-xs relative overflow-hidden ${
          isDark
            ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border-[#00A8E8]/30 text-slate-200'
            : 'bg-gradient-to-br from-sky-50/60 via-white to-emerald-50/40 border-[#00A8E8]/20 text-slate-800'
        }`}
      >
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-[#70C167]/15 text-[#70C167] shrink-0">
            <Sprout className="w-7 h-7" />
          </div>
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#00A8E8]/10 text-[#00A8E8] text-[11px] font-semibold uppercase tracking-wider border border-[#00A8E8]/20">
              <Sparkles className="w-3 h-3" />
              <span>Solución Arquitectónica e Hidráulica • Reservorio Multifuncional</span>
            </div>

            <h3 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Espacios Adaptativos según las Condiciones Climáticas
            </h3>

            {/* Texto exacto del concepto */}
            <div className="p-4 rounded-xl bg-white/70 dark:bg-black/40 border border-emerald-500/20 text-sm leading-relaxed text-slate-700 dark:text-slate-200 shadow-2xs">
              <p>
                <strong>La solución arquitectónica aprovecha los reservorios como espacios que cumplen funciones diferentes según las condiciones climáticas.</strong>
              </p>
              <p className="mt-2.5">
                Durante la <strong>época seca</strong>, funcionan como <em>parques, canchas deportivas, jardines, plazas, áreas de descanso y espacios para actividades comunitarias</em>. La incorporación de árboles, vegetación adaptada al clima local, superficies permeables, materiales de menor impacto ambiental y zonas de sombra contribuye a mejorar las condiciones del entorno y favorecer el confort térmico.
              </p>
              <p className="mt-2.5">
                Durante la <strong>temporada lluviosa</strong>, estos espacios priorizan la <em>captación, retención y regulación del agua pluvial</em> mediante depresiones del terreno, canales de conducción y áreas de almacenamiento. El diseño incorpora <em>salidas reguladas y aliviaderos de emergencia</em>, dimensionados de acuerdo con las condiciones hidráulicas del lugar, para facilitar el manejo del excedente de agua.
              </p>
            </div>
          </div>
        </div>

        {/* Métricas clave de rendimiento */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-5 border-t border-emerald-800/20">
          <div className="p-3 rounded-xl bg-white/50 dark:bg-black/30 border border-slate-200/50 dark:border-slate-800">
            <p className="text-[11px] opacity-75 font-medium flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-emerald-600" />
              <span>Capacidad de Amortiguamiento</span>
            </p>
            <p className="text-xl font-bold mt-1 text-emerald-700 dark:text-emerald-300">
              73,000 Litros
            </p>
            <p className="text-[10px] opacity-70 mt-0.5">Retención por evento de tormenta</p>
          </div>

          <div className="p-3 rounded-xl bg-white/50 dark:bg-black/30 border border-slate-200/50 dark:border-slate-800">
            <p className="text-[11px] opacity-75 font-medium flex items-center gap-1.5">
              <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
              <span>Reducción de Caudal Pico</span>
            </p>
            <p className="text-xl font-bold mt-1 text-emerald-700 dark:text-emerald-300">
              -34% de Golpe
            </p>
            <p className="text-[10px] opacity-70 mt-0.5">Evita colapso del puente vehicular</p>
          </div>

          <div className="p-3 rounded-xl bg-white/50 dark:bg-black/30 border border-slate-200/50 dark:border-slate-800">
            <p className="text-[11px] opacity-75 font-medium flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Tiempo de Reacción Ganado</span>
            </p>
            <p className="text-xl font-bold mt-1 text-emerald-700 dark:text-emerald-300">
              +42 Minutos
            </p>
            <p className="text-[10px] opacity-70 mt-0.5">Margen seguro para evacuación vecinal</p>
          </div>
        </div>
      </section>

      {/* 3. Detalle de la Fase Seleccionada (Época Seca vs Temporada Lluviosa) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            {activeSeason === 'SECA' ? (
              <>
                <Sun className="w-4 h-4 text-amber-500" />
                <span>Fase Activa: Época Seca (Noviembre a Abril) • Espacio Urbano y Recreación</span>
              </>
            ) : (
              <>
                <CloudRain className="w-4 h-4 text-emerald-600" />
                <span>Fase Activa: Temporada Lluviosa (Mayo a Octubre) • Mitigación y Regulación</span>
              </>
            )}
          </h3>
          <span className="text-[11px] text-slate-500">
            {activeSeason === 'SECA' ? '6 meses de aprovechamiento social' : '6 meses de protección hidrológica'}
          </span>
        </div>

        {activeSeason === 'SECA' ? (
          /* Módulos de Época Seca */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              className={`rounded-2xl border p-5 transition-all ${
                isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <div className="relative h-44 rounded-xl overflow-hidden mb-4 group cursor-pointer"
                onClick={() => setSelectedPhoto({ url: '/images/reservorio2.jpeg', caption: 'Reservorio en época seca: Áreas de convivencia comunitaria, sombra y superficies permeables' })}>
                <img
                  src="/images/reservorio2.jpeg"
                  alt="Reservorio en época seca"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-xs text-white text-[11px] flex items-center gap-1.5 opacity-90 group-hover:opacity-100">
                    <Maximize2 className="w-3 h-3" /> Ver diseño en sitio
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  Espacio Público y Convivencia
                </span>
                <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Parques, Canchas Deportivas y Plazas Comunitarias
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  El lecho escalonado del reservorio funciona como cancha multideportiva (fútbol sala y vóleibol) y plaza para actividades comunitarias, asambleas vecinales y ferias del barrio Sabana Grande durante los meses sin precipitaciones.
                </p>
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Uso Comunitario:</span>
                    <strong className="text-slate-800 dark:text-slate-200">100% Accesible</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Población Beneficiada:</span>
                    <strong className="text-emerald-700 dark:text-emerald-400">+1,400 Familias</strong>
                  </div>
                </div>
              </div>
            </div>

            <div
              className={`rounded-2xl border p-5 transition-all ${
                isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <div className="relative h-44 rounded-xl overflow-hidden mb-4 group cursor-pointer"
                onClick={() => setSelectedPhoto({ url: '/images/reservorio1.jpeg', caption: 'Vegetación nativa de sombra, adoquín ecológico y microclima en Sabana Grande' })}>
                <img
                  src="/images/reservorio1.jpeg"
                  alt="Vegetación y microclima"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-xs text-white text-[11px] flex items-center gap-1.5 opacity-90 group-hover:opacity-100">
                    <Maximize2 className="w-3 h-3" /> Ver talud vegetado
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Infraestructura Verde y Confort Térmico
                </span>
                <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Árboles Nativos, Superficies Permeables y Sombra
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Incorporación de árboles autóctonos adaptados al clima de Managua (Madroño, Jiñocuabo y Cortez Amarillo) y adoquines permeables de bajo impacto ambiental. Crean áreas de descanso sombreadas y reducen la temperatura superficial hasta en 4.5°C.
                </p>
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Confort Térmico:</span>
                    <strong className="text-emerald-700 dark:text-emerald-400">-4.5°C Isla de calor</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Permeabilidad de Suelo:</span>
                    <strong className="text-slate-800 dark:text-slate-200">88% Infiltración</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Módulos de Temporada Lluviosa */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              className={`rounded-2xl border p-5 transition-all ${
                isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <div className="relative h-44 rounded-xl overflow-hidden mb-4 group cursor-pointer"
                onClick={() => setSelectedPhoto({ url: '/images/reservorio3.jpg', caption: 'Vaso de almacenamiento, bio-zanjas y aliviadero hidráulico regulado' })}>
                <img
                  src="/images/reservorio3.jpg"
                  alt="Vaso de almacenamiento pluvial"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-xs text-white text-[11px] flex items-center gap-1.5 opacity-90 group-hover:opacity-100">
                    <Maximize2 className="w-3 h-3" /> Ver vaso hidráulico
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Hidráulica de Drenaje Sostenible
                </span>
                <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Depresiones del Terreno y Canales de Conducción
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Depresiones topográficas escalonadas que reciben el agua de la Pista Sabana Grande mediante bio-canales con pasto vetiver. Ralentizan la velocidad de la escorrentía, retienen sedimentos y evitan que la basura ingrese de golpe al cauce.
                </p>
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Retención de Sedimentos:</span>
                    <strong className="text-emerald-700 dark:text-emerald-400">Hasta 72%</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Capacidad de Vaso:</span>
                    <strong className="text-slate-800 dark:text-slate-200">18,500 m³</strong>
                  </div>
                </div>
              </div>
            </div>

            <div
              className={`rounded-2xl border p-5 transition-all ${
                isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <div className="relative h-44 rounded-xl overflow-hidden mb-4 group cursor-pointer"
                onClick={() => setSelectedPhoto({ url: '/images/reservorio1.jpeg', caption: 'Salidas reguladas y aliviadero de emergencia en Sabana Grande' })}>
                <img
                  src="/images/reservorio1.jpeg"
                  alt="Aliviaderos y compuertas"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-xs text-white text-[11px] flex items-center gap-1.5 opacity-90 group-hover:opacity-100">
                    <Maximize2 className="w-3 h-3" /> Ver aliviadero de emergencia
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                  Seguridad Hidráulica Crítica
                </span>
                <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Salidas Reguladas y Aliviaderos de Emergencia
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Estructuras de descarga calibradas según la capacidad del cauce receptor. Las salidas reguladas dosifican el flujo continuo, mientras el aliviadero de emergencia evacúa de manera segura los excesos hídricos de huracanes o tormentas torrenciales.
                </p>
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Cálculo Hidráulico:</span>
                    <strong className="text-emerald-700 dark:text-emerald-400">Periodo Retorno 50 Años</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Protección Aguas Abajo:</span>
                    <strong className="text-slate-800 dark:text-slate-200">Riesgo 0 Desborde</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 4. Catálogo de Especies Bioclimáticas y Materiales Sostenibles */}
      <section
        className={`rounded-2xl border p-5 md:p-6 transition-all shadow-xs ${
          isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex items-center gap-2 mb-4">
          <Trees className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            Especies Nativas y Materiales Adaptados a Managua
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
              Vegetación Bio-Filtrante
            </span>
            <p className="font-bold text-slate-900 dark:text-slate-100 mt-1">
              Pasto Vetiver y Zacate Limón
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Raíces densas de hasta 3 metros que fijan los taludes del cauce y absorben metales y sedimentos.
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
              Árboles de Sombra y Clima Local
            </span>
            <p className="font-bold text-slate-900 dark:text-slate-100 mt-1">
              Madroño y Jiñocuabo
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Especies de bajo requerimiento hídrico en sequía que maximizan el confort térmico y la cobertura aérea.
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
              Superficies Permeables
            </span>
            <p className="font-bold text-slate-900 dark:text-slate-100 mt-1">
              Adoquín Ecológico y Grava Volcánica
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Permite la recarga directa del acuífero de Managua sin generar charcos ni proliferación de zancudos.
            </p>
          </div>
        </div>
      </section>

      {/* Modal de Fotografía Ampliada */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative max-w-3xl w-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedPhoto.url}
              alt="Reservorio en Sabana Grande"
              className="w-full max-h-[70vh] object-cover"
            />
            <div className="p-4 bg-slate-950 flex items-center justify-between">
              <p className="text-xs text-slate-300">{selectedPhoto.caption}</p>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
