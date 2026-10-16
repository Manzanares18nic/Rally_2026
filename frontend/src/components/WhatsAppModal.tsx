import React from 'react';
import { Check, Copy, ExternalLink, MessageSquare, X } from 'lucide-react';
import type { WhatsAppAlertResponse } from '../services/api';

interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: WhatsAppAlertResponse | null;
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({ isOpen, onClose, data }) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !data) return null;

  const handleCopy = () => {
    if (data?.content_dispatched) {
      navigator.clipboard.writeText(data.content_dispatched);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleOpenDirect = () => {
    if (data?.whatsapp_direct_link) {
      window.open(data.whatsapp_direct_link, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#0E1526] border border-[#233554] rounded-2xl p-6 shadow-2xl text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1E2D4A]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">
                Alerta Comunitaria Despachada
              </h3>
              <p className="text-xs text-emerald-400 font-medium">
                POST /api/v1/alerts/alt-01/send-whatsapp
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

        {/* Content body */}
        <div className="my-5 space-y-4">
          <div className="p-3.5 bg-[#09101F] border border-[#1A263D] rounded-xl font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
            {data.content_dispatched}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>Red comunitaria: <strong className="text-slate-200 font-mono">12 vigías barriales</strong></span>
            <span className="text-emerald-400 flex items-center gap-1 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              {data.status}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            onClick={handleCopy}
            className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#162138] hover:bg-[#1E2D4A] border border-[#233554] text-xs font-semibold text-slate-200 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Copiado al portapapeles</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-400" />
                <span>Copiar Mensaje</span>
              </>
            )}
          </button>

          <button
            onClick={handleOpenDirect}
            className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Abrir WhatsApp Web</span>
          </button>
        </div>
      </div>
    </div>
  );
};
