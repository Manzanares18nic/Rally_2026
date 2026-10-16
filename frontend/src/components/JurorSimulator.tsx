import React from 'react';
import {
  Sliders,
  CloudRain,
  Sprout,
  AlertOctagon,
  CheckCircle2,
  BellRing,
  Info,
  Loader2,
} from 'lucide-react';

export type ScenarioType =
  | 'CRECIDA_SUBITA'
  | 'LLUVIA_MODERADA'
  | 'VACIADO'
  | 'NODO_DESCONECTADO'
  | 'NORMAL';

interface JurorSimulatorProps {
  currentScenario: ScenarioType;
  onTriggerScenario: (scenario: ScenarioType) => void;
  isLoading: boolean;
}

export const JurorSimulator: React.FC<JurorSimulatorProps> = ({
  currentScenario,
  onTriggerScenario,
  isLoading,
}) => {
  const getScenarioStatusBadge = () => {
    switch (currentScenario) {
      case 'CRECIDA_SUBITA':
        return {
          text: 'Crecida Súbita Activa',
          className: 'bg-[#2E1216] border-[#5E1E26] text-[#F87171]',
        };
      case 'LLUVIA_MODERADA':
        return {
          text: 'Lluvia Moderada Activa',
          className: 'bg-[#33220D] border-[#66461A] text-[#FBBF24]',
        };
      case 'VACIADO':
        return {
          text: 'Drenaje Activo',
          className: 'bg-[#0B261D] border-[#15543C] text-[#34D399]',
        };
      case 'NODO_DESCONECTADO':
        return {
          text: 'Nodo Desconectado',
          className: 'bg-[#291738] border-[#552778] text-[#C084FC]',
        };
      case 'NORMAL':
      default:
        return {
          text: 'Sistema Estable',
          className: 'bg-[#10243D] border-[#1E3A63] text-[#38BDF8]',
        };
    }
  };

  const statusBadge = getScenarioStatusBadge();

  const scenarios: {
    id: ScenarioType;
    title: string;
    subtitle: string;
    badge: string;
    badgeStyle: string;
    icon: React.ReactNode;
    iconBg: string;
  }[] = [
    {
      id: 'CRECIDA_SUBITA',
      title: 'Crecida Súbita',
      subtitle: 'Tormenta violenta (+10 cm/ciclo)',
      badge: 'CRÍTICO',
      badgeStyle: 'bg-[#321217] border-[#631E26] text-[#F87171]',
      icon: <BellRing className="w-4 h-4 text-[#F87171]" />,
      iconBg: 'bg-[#281116] border-[#4F1921]',
    },
    {
      id: 'LLUVIA_MODERADA',
      title: 'Lluvia Moderada',
      subtitle: 'Crecida sostenida (+2 cm/ciclo)',
      badge: 'ALERTA',
      badgeStyle: 'bg-[#33220D] border-[#66461A] text-[#FBBF24]',
      icon: <CloudRain className="w-4 h-4 text-[#FBBF24]" />,
      iconBg: 'bg-[#281A0B] border-[#523715]',
    },
    {
      id: 'VACIADO',
      title: 'Drenaje / Infraestructura Verde',
      subtitle: 'Simula retención y vaciado',
      badge: 'RESILIENCIA',
      badgeStyle: 'bg-[#0B261D] border-[#15543C] text-[#34D399]',
      icon: <Sprout className="w-4 h-4 text-[#34D399]" />,
      iconBg: 'bg-[#091F18] border-[#114230]',
    },
    {
      id: 'NODO_DESCONECTADO',
      title: 'Falla: Sensor Caído',
      subtitle: 'Alerta de nodo sin datos',
      badge: 'DIAGNÓSTICO',
      badgeStyle: 'bg-[#291738] border-[#552778] text-[#C084FC]',
      icon: <AlertOctagon className="w-4 h-4 text-[#C084FC]" />,
      iconBg: 'bg-[#20122C] border-[#421E5E]',
    },
    {
      id: 'NORMAL',
      title: 'Normalizar Sistema',
      subtitle: 'Estado estable',
      badge: 'RESET',
      badgeStyle: 'bg-[#10243D] border-[#1E3A63] text-[#38BDF8]',
      icon: <CheckCircle2 className="w-4 h-4 text-[#38BDF8]" />,
      iconBg: 'bg-[#0D1D32] border-[#183050]',
    },
  ];

  return (
    <div className="bg-[#0D1424] border border-[#1E2A44] rounded-2xl p-5 shadow-2xl flex flex-col justify-between hover:border-[#2A3B5E] transition-all">
      <div>
        {/* Header */}
        <div className="flex items-center gap-3 pb-3 border-b border-[#1A253D]">
          <div className="w-9 h-9 rounded-xl bg-purple-950/60 border border-purple-800/40 flex items-center justify-center text-purple-400">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Disparador para Jurado
            </h2>
            <p className="text-xs text-slate-400">
              Demuestra al evaluador cómo reacciona el sistema ante eventos extremos sin hardware físico.
            </p>
          </div>
        </div>

        {/* Simulation Status Row */}
        <div className="flex items-center justify-between py-3 border-b border-[#162035]">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
            Simulación:
          </span>
          <span
            className={`px-3 py-1 rounded-lg border text-xs font-bold font-mono tracking-wide ${statusBadge.className}`}
          >
            {statusBadge.text}
          </span>
        </div>

        {/* Scenario Buttons List */}
        <div className="space-y-2.5 pt-3.5">
          {scenarios.map((sc) => {
            const isActive = currentScenario === sc.id;
            return (
              <button
                key={sc.id}
                onClick={() => onTriggerScenario(sc.id)}
                disabled={isLoading}
                className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between group cursor-pointer ${
                  isActive
                    ? 'bg-[#141C31] border-cyan-500/80 shadow-[0_0_15px_rgba(6,182,212,0.15)] ring-1 ring-cyan-400/40'
                    : 'bg-[#0F172A]/70 border-[#1E2A44] hover:bg-[#15213D] hover:border-[#2D3E64]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${sc.iconBg}`}
                  >
                    {sc.icon}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white tracking-wide group-hover:text-cyan-300 transition-colors">
                      {sc.title}
                    </h3>
                    <p className="text-[11px] text-slate-400">{sc.subtitle}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase border ${sc.badgeStyle}`}
                  >
                    {sc.badge}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between pt-4 mt-4 border-t border-[#162035] text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-cyan-400" />
          <span>Simulador Virtual (24h Ready)</span>
        </div>
        <span className="text-slate-400">v1.2-alpha</span>
      </div>
    </div>
  );
};
