import React from 'react';
import { Play, Check, AlertCircle } from 'lucide-react';

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
  const scenarios: { id: ScenarioType; title: string; desc: string }[] = [
    {
      id: 'CRECIDA_SUBITA',
      title: 'Crecida súbita por tormenta',
      desc: 'Simula incremento rápido de agua activando alerta roja.',
    },
    {
      id: 'LLUVIA_MODERADA',
      title: 'Lluvia constante',
      desc: 'Subida gradual con activación de nivel preventivo amarillo.',
    },
    {
      id: 'VACIADO',
      title: 'Retención y drenaje',
      desc: 'Descenso del nivel tras absorción de infraestructura verde.',
    },
    {
      id: 'NODO_DESCONECTADO',
      title: 'Fallo de nodo de sensado',
      desc: 'Simula pérdida de señal o batería baja en el equipo.',
    },
    {
      id: 'NORMAL',
      title: 'Condición normal',
      desc: 'Restablece el flujo regular del cauce.',
    },
  ];

  return (
    <div
      className={`rounded-2xl border p-5 transition-all shadow-xs ${
        isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
      }`}
    >
      <div className="pb-3 mb-3 border-b border-slate-200 dark:border-slate-800">
        <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
          Simulación de escenarios
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Permite evaluar la respuesta hidrométrica ante diferentes condiciones climáticas.
        </p>
      </div>

      <div className="space-y-2 mt-3">
        {scenarios.map((sc) => {
          const isSelected = currentScenario === sc.id;
          return (
            <button
              key={sc.id}
              onClick={() => onTriggerScenario(sc.id)}
              disabled={isLoading}
              className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between ${
                isSelected
                  ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 font-medium'
                  : isDark
                  ? 'border-slate-800 hover:border-slate-700 bg-slate-900/50 text-slate-300'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/70 text-slate-700'
              }`}
            >
              <div>
                <p className="font-semibold text-xs">{sc.title}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{sc.desc}</p>
              </div>
              {isSelected ? (
                <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 ml-2" />
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
