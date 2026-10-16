import React from 'react';
import { Sprout, Droplets, Clock, TrendingDown, ArrowUpRight, CheckCircle2 } from 'lucide-react';

interface GreenInfrastructureProps {
  isDark: boolean;
}

export const GreenInfrastructureView: React.FC<GreenInfrastructureProps> = ({ isDark }) => {
  const interventions = [
    {
      title: 'Jardín de Lluvia y Bio-Retención Norte',
      location: 'Márgenes del Cauce La Maravilla • Sector Sabana Grande',
      type: 'Bio-retención Vegetada con Especies Nativas',
      capacity: '45,000 Litros',
      runoffReduction: '38.5%',
      peakDelay: '42 minutos',
      status: 'Operativo con telemetría',
      image:
        'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=700&q=80',
      description:
        'Capas de grava filtrante, arena y vegetación de raíces profundas que retienen la escorrentía de la Pista Sabana Grande antes de que llegue al cauce.',
    },
    {
      title: 'Franja Filtrante y Talud Permeable Sur',
      location: 'Tramo de estrangulamiento del puente vehicular',
      type: 'Franja Bio-Filtrante con vetiver y piedra caliza',
      capacity: '28,000 Litros',
      runoffReduction: '29.0%',
      peakDelay: '25 minutos',
      status: 'Operativo',
      image:
        'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=700&q=80',
      description:
        'Disminuye la velocidad del torrente pluvial y atrapa sedimentos y plásticos, evitando que se formen tapones hidráulicos bajo el puente.',
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2">
      {/* Banner de propósito de Infraestructura Verde */}
      <section
        className={`rounded-2xl border p-6 transition-all ${
          isDark
            ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-100'
            : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
        }`}
      >
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-emerald-700/20 text-emerald-600 dark:text-emerald-400 shrink-0">
            <Sprout className="w-7 h-7" />
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              Eje Central del Proyecto • Idea B (Reto 05)
            </span>
            <h2 className="text-lg md:text-xl font-bold mt-1">
              Infraestructura Verde con Medición de Desempeño
            </h2>
            <p className="text-xs mt-2 leading-relaxed opacity-90 max-w-3xl">
              Los reservorios solos no resuelven las inundaciones de Managua si el agua llega de golpe y con basura. 
              <strong> Reservorio Vivo</strong> implementa jardines de lluvia y franjas filtrantes que retienen agua donde cae. Los sensores miden cuántos litros retienen y cuánto retrasan el pico de crecida.
            </p>
          </div>
        </div>

        {/* Métricas consolidadas de impacto ambiental */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-5 border-t border-emerald-800/20">
          <div className="p-3 rounded-xl bg-white/40 dark:bg-black/20">
            <p className="text-[11px] opacity-75 font-medium flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-emerald-600" />
              <span>Agua infiltrada / retenida</span>
            </p>
            <p className="text-xl font-bold mt-1 text-emerald-700 dark:text-emerald-300">
              73,000 Litros
            </p>
            <p className="text-[10px] opacity-70 mt-0.5">Por evento de lluvia intensa</p>
          </div>

          <div className="p-3 rounded-xl bg-white/40 dark:bg-black/20">
            <p className="text-[11px] opacity-75 font-medium flex items-center gap-1.5">
              <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
              <span>Reducción de escorrentía</span>
            </p>
            <p className="text-xl font-bold mt-1 text-emerald-700 dark:text-emerald-300">
              -34% Promedio
            </p>
            <p className="text-[10px] opacity-70 mt-0.5">Medido por sensores de entrada y salida</p>
          </div>

          <div className="p-3 rounded-xl bg-white/40 dark:bg-black/20">
            <p className="text-[11px] opacity-75 font-medium flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Retardo del pico de crecida</span>
            </p>
            <p className="text-xl font-bold mt-1 text-emerald-700 dark:text-emerald-300">
              +42 Minutos
            </p>
            <p className="text-[10px] opacity-70 mt-0.5">Tiempo valioso ganado para el barrio</p>
          </div>
        </div>
      </section>

      {/* Módulos implementados con fotografías reales */}
      <section className="space-y-4">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
          Intervenciones Bioclimáticas Activas en Sabana Grande
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {interventions.map((item, idx) => (
            <div
              key={idx}
              className={`rounded-2xl border overflow-hidden shadow-xs flex flex-col justify-between transition-all ${
                isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <div className="relative h-44 w-full overflow-hidden bg-slate-900">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-xs text-white text-[10px] font-medium px-2.5 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>{item.status}</span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    {item.type}
                  </span>
                  <h4 className="text-base font-bold mt-1 text-slate-900 dark:text-slate-100">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {item.location}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2.5 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Capacidad:</span>
                    <strong className="text-emerald-700 dark:text-emerald-400">{item.capacity}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Tiempo ganado:</span>
                    <strong className="text-slate-800 dark:text-slate-200">{item.peakDelay}</strong>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
