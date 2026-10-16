import React, { useState } from 'react';
import { X, Server, Check, AlertCircle, RefreshCw, Globe, HelpCircle } from 'lucide-react';

interface ApiConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUrl: string;
  onSaveUrl: (newUrl: string) => void;
  isLive: boolean;
  onTestConnection: () => Promise<boolean>;
}

export const ApiConfigModal: React.FC<ApiConfigModalProps> = ({
  isOpen,
  onClose,
  currentUrl,
  onSaveUrl,
  isLive,
  onTestConnection,
}) => {
  const [urlInput, setUrlInput] = useState(currentUrl);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'failed' | null>(null);

  if (!isOpen) return null;

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const ok = await onTestConnection();
      setTestResult(ok ? 'success' : 'failed');
    } catch {
      setTestResult('failed');
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    onSaveUrl(urlInput.trim());
    onClose();
  };

  const handleResetDefault = () => {
    const defaultUrl = 'http://localhost:8000/api/v1';
    setUrlInput(defaultUrl);
    onSaveUrl(defaultUrl);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#0E1526] border border-[#233554] rounded-2xl p-6 shadow-2xl text-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-[#1E2D4A]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">
                Conexión con FastAPI Backend
              </h3>
              <p className="text-xs text-slate-400">
                Configuración de endpoint y estado del servidor
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Status banner */}
        <div className="my-4">
          <div
            className={`p-3.5 rounded-xl border flex items-center gap-3 ${
              isLive
                ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                : 'bg-amber-950/40 border-amber-800/60 text-amber-300'
            }`}
          >
            {isLive ? (
              <Check className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
            )}
            <div className="text-xs font-mono">
              <p className="font-bold">
                {isLive ? '🟢 Conectado con FastAPI en vivo' : '🟡 Modo Simulación Fallback Activo'}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {isLive
                  ? 'Recibiendo telemetría en tiempo real desde el backend.'
                  : 'Si tu backend FastAPI está apagado, el simulador local emula todas las respuestas para que la app nunca se rompa.'}
              </p>
            </div>
          </div>
        </div>

        {/* URL Input */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase font-mono tracking-wider">
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            URL Base del Backend (FastAPI):
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="http://localhost:8000/api/v1"
              className="flex-1 px-3 py-2 bg-[#09101F] border border-[#1E2D4A] rounded-xl text-xs font-mono text-cyan-300 placeholder-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
            />
            <button
              onClick={handleTest}
              disabled={testing}
              className="px-3.5 py-2 rounded-xl bg-[#162138] border border-[#233554] hover:bg-[#1E2D4A] text-xs font-semibold text-slate-200 transition-colors flex items-center gap-1.5 shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
              Probar
            </button>
          </div>

          {testResult && (
            <div className="text-xs font-mono">
              {testResult === 'success' ? (
                <span className="text-emerald-400 flex items-center gap-1">
                  ✓ Servidor respondió exitosamente en {urlInput}
                </span>
              ) : (
                <span className="text-amber-400 flex items-center gap-1">
                  ⚠ No se pudo contactar el backend en {urlInput}. Se usará simulación local.
                </span>
              )}
            </div>
          )}

          {/* Quick suggestions */}
          <div className="pt-1 flex items-center gap-2 text-[11px] text-slate-400 font-mono">
            <span>Atajos:</span>
            <button
              onClick={handleResetDefault}
              className="underline hover:text-cyan-400"
            >
              localhost:8000
            </button>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-3 pt-5 mt-4 border-t border-[#1E2D4A]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold transition-all shadow-lg shadow-cyan-500/20"
          >
            Guardar Configuración
          </button>
        </div>
      </div>
    </div>
  );
};
