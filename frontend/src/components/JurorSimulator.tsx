import React, { useState, useEffect } from 'react';
import { Play, Check, RefreshCw } from 'lucide-react';

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
    }, 9000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [autoPitchMode, onTriggerScenario]);

  const scenarios: { id: ScenarioType; title: string; desc: string }[] = [
    {
      id: 'CRECIDA_SUBITA',
      title: 'Lluvia fuerte y crecida rápida',
      desc: 'El agua sube con rapidez para ver la alerta roja de precaución comunitaria.',
    },
    {
      id: 'VACIADO',
      title: 'El agua baja y se absorbe',
      desc: 'El reservorio drena ordenadamente y las áreas verdes filtran el agua.',
    },
    {
      id: 'LLUVIA_MODERADA',
      title: 'Lluvia suave a moderada',
      desc: 'El nivel sube poco a poco avisando con precaución amarilla preventiva.',
    },
    {
      id: 'NORMAL',
      title: 'Día soleado y despejado (Normal)',
      desc: 'Nivel seguro y tranquilo en el cauce sin riesgo alguno para las familias.',
    },
    {
      id: 'NODO_DESCONECTADO',
      title: 'Aviso de batería o mantenimiento',
      desc: 'Muestra cómo el sistema avisa si un sensor necesita revisión o recarga solar.',
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
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
            Probar situaciones del agua
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Observa cómo responde el sistema y los avisos cuando llueve o baja el agua.
          </p>
        </div>

        {/* Botón de Ciclo Automático sobrio */}
        <button
          onClick={() => {
            const next = !autoPitchMode;
            setAutoPitchMode(next);
            if (next) {
              setPitchPhase('subiendo');
              onTriggerScenario('CRECIDA_SUBITA');
            }
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
            autoPitchMode
              ? 'bg-[#00A8E8] text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${autoPitchMode ? 'animate-spin' : ''}`} />
          <span>{autoPitchMode ? 'Ciclo automático activo' : 'Ciclo automático'}</span>
        </button>
      </div>

      <div className="space-y-2 mt-3">
        {scenarios.map((sc) => {
          const isSelected = currentScenario === sc.id;
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
                  ? 'border-[#00A8E8] bg-[#00A8E8]/10 text-slate-900 dark:text-slate-100 font-medium'
                  : isDark
                  ? 'border-slate-800 hover:border-slate-700 bg-slate-900/50 text-slate-300'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/70 text-slate-700'
              }`}
            >
              <div>
                <p className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                  {sc.title}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{sc.desc}</p>
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
