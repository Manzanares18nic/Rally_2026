import React, { useState, useEffect } from 'react';
import { Play, Check, Zap, ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react';

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
  isDark: boolean;
}

export const JurorSimulator: React.FC<JurorSimulatorProps> = ({
  currentScenario,
  onTriggerScenario,
  isLoading,
  isDark,
}) => {
  const [autoPitchMode, setAutoPitchMode] = useState<boolean>(false);
  const [pitchPhase, setPitchPhase] = useState<'subiendo' | 'bajando'>('subiendo');

  // Ciclo automático para el pitch de jurados: sube y baja de manera continua
  useEffect(() => {
    if (!autoPitchMode) return;

    let mounted = true;
    const interval = setInterval(() => {
      if (!mounted) return;
      setPitchPhase((prev) => {
        const next = prev === 'subiendo' ? 'bajando' : 'subiendo';
        onTriggerScenario(next === 'subiendo' ? 'CRECIDA_SUBITA' : 'VACIADO');
        return next;
      });
    }, 9000); // Alterna cada 9 segundos para un ciclo fluido y constante

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [autoPitchMode, onTriggerScenario]);

  const scenarios: { id: ScenarioType; title: string; desc: string; icon: any; color: string }[] = [
    {
      id: 'CRECIDA_SUBITA',
      title: '⚡ Crecida Súbita (Tormenta Intensa)',
      desc: 'El agua sube rápidamente hasta el 90-95% disparando Alerta Roja.',
      icon: ArrowUpRight,
      color: '#D81B60',
    },
    {
      id: 'VACIADO',
      title: '🌊 Vaciado y Drenaje por Infraestructura Verde',
      desc: 'El agua desciende rápidamente amortiguada por el reservorio bio-retenedor.',
      icon: ArrowDownRight,
      color: '#70C167',
    },
    {
      id: 'LLUVIA_MODERADA',
      title: '🌧️ Lluvia Constante',
      desc: 'Subida gradual con activación de nivel preventivo amarillo.',
      icon: ArrowUpRight,
      color: '#00A8E8',
    },
    {
      id: 'NORMAL',
      title: '🟢 Régimen Normal y Estable',
      desc: 'Restablece el flujo regular del cauce sin alertas.',
      icon: Check,
      color: '#70C167',
    },
    {
      id: 'NODO_DESCONECTADO',
      title: '⚠️ Fallo o Pérdida de Enlace IoT',
      desc: 'Simula pérdida de señal o batería baja en el nodo ESP32.',
      icon: Zap,
      color: '#f59e0b',
    },
  ];

  return (
    <div
      className={`rounded-2xl border p-5 transition-all shadow-xs ${
        isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
      }`}
    >
      <div className="pb-3 mb-3 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center flex-wrap gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
              Simulador Hidráulico de Pitch
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#00A8E8]/15 text-[#00A8E8] border border-[#00A8E8]/30">
              Alta Velocidad (1s)
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Muestra al jurado en vivo cómo sube y baja el nivel del reservorio.
          </p>
        </div>

        {/* Botón de Ciclo Automático continuo para el Pitch */}
        <button
          onClick={() => {
            const next = !autoPitchMode;
            setAutoPitchMode(next);
            if (next) {
              setPitchPhase('subiendo');
              onTriggerScenario('CRECIDA_SUBITA');
            }
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs ${
            autoPitchMode
              ? 'bg-[#00A8E8] text-white shadow-md animate-pulse ring-2 ring-[#00A8E8]/40'
              : 'bg-[#00A8E8]/10 text-[#00A8E8] hover:bg-[#00A8E8]/20 border border-[#00A8E8]/30'
          }`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${autoPitchMode ? 'animate-spin' : ''}`} />
          <span>
            {autoPitchMode
              ? `Auto-Pitch Activo (${pitchPhase === 'subiendo' ? '⬆ Subiendo' : '⬇ Bajando'})`
              : 'Iniciar Ciclo Auto-Pitch'}
          </span>
        </button>
      </div>

      <div className="space-y-2 mt-3">
        {scenarios.map((sc) => {
          const isSelected = currentScenario === sc.id;
          const Icon = sc.icon;
          return (
            <button
              key={sc.id}
              onClick={() => {
                setAutoPitchMode(false);
                onTriggerScenario(sc.id);
              }}
              disabled={isLoading}
              className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between ${
                isSelected
                  ? 'border-[#00A8E8] bg-[#00A8E8]/10 text-slate-900 dark:text-slate-100 font-medium shadow-xs ring-1 ring-[#00A8E8]'
                  : isDark
                  ? 'border-slate-800 hover:border-slate-700 bg-slate-900/50 text-slate-300'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/70 text-slate-700'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <div
                  className="p-1.5 rounded-lg shrink-0 mt-0.5"
                  style={{ backgroundColor: `${sc.color}20`, color: sc.color }}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                    {sc.title}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{sc.desc}</p>
                </div>
              </div>
              {isSelected ? (
                <Check className="w-4 h-4 text-[#00A8E8] shrink-0 ml-2" />
              ) : (
                <Play className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-2" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
