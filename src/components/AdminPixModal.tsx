import React, { useState, useEffect } from 'react';
import { Settings, Check, Copy, RefreshCw, X, Shield, QrCode } from 'lucide-react';
import QRCode from 'qrcode';

interface AdminPixModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPixKeyUpdated?: (newPixKey: string) => void;
  onResetChat?: () => void;
}

export const AdminPixModal: React.FC<AdminPixModalProps> = ({ isOpen, onClose, onPixKeyUpdated, onResetChat }) => {
  const [pixKey, setPixKey] = useState<string>('');
  const [inputKey, setInputKey] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      fetchPixConfig();
    }
  }, [isOpen]);

  const fetchPixConfig = async () => {
    setIsLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/pix-config');
      const data = await res.json();
      if (data.pixKey) {
        setPixKey(data.pixKey);
        setInputKey(data.pixKey);
      }
    } catch (err) {
      console.error('Erro ao carregar chave PIX:', err);
      setMessage({ type: 'error', text: 'Falha ao carregar a chave PIX atual.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputKey.trim()) {
      setMessage({ type: 'error', text: 'A chave PIX não pode estar vazia.' });
      return;
    }

    setIsSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/pix-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pixKey: inputKey.trim() })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPixKey(data.pixKey);
        setMessage({ type: 'success', text: 'Chave PIX atualizada com sucesso!' });
        if (onPixKeyUpdated) {
          onPixKeyUpdated(data.pixKey);
        }
      } else {
        setMessage({ type: 'error', text: data.error || 'Erro ao salvar chave PIX.' });
      }
    } catch (err) {
      console.error('Erro ao salvar chave PIX:', err);
      setMessage({ type: 'error', text: 'Falha de comunicação ao salvar.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopy = () => {
    if (pixKey) {
      navigator.clipboard.writeText(pixKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  useEffect(() => {
    const code = inputKey.trim() || pixKey || '00020101021126580014br.gov.bcb.pix01360efa1471-55ad-4ce9-9f7a-6cd5d173525c5204000053039865802BR5913JOSE P JUNIOR6009FORTALEZA62070503***6304F837';
    QRCode.toDataURL(code, { width: 300, margin: 2, errorCorrectionLevel: 'M' })
      .then(url => setQrCodeDataUrl(url))
      .catch(err => console.error(err));
  }, [inputKey, pixKey]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-amber-500/30 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/80 border-b border-amber-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-200">
            <Settings className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-base font-serif">Configuração Administrativa PIX</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5">
          {message && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${
                message.type === 'success'
                  ? 'bg-emerald-950/80 border-emerald-800 text-emerald-200'
                  : 'bg-red-950/80 border-red-800 text-red-200'
              }`}
            >
              {message.type === 'success' ? <Check className="w-4 h-4 text-emerald-400 shrink-0" /> : <Shield className="w-4 h-4 text-red-400 shrink-0" />}
              <span>{message.text}</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Chave PIX Cadastrada no Sistema:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  placeholder="Ex: pagamento@mapacabalistico.com.br ou 00.000.000/0001-00"
                  disabled={isLoading || isSaving}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/80 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={handleCopy}
                  title="Copiar Chave PIX"
                  className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copiado' : 'Copiar'}</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">
                Esta chave será exibida diretamente para os clientes do Kael durante a etapa de pagamento.
              </p>
            </div>

            {/* QR Code Preview */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center gap-2">
              <div className="text-xs font-medium text-amber-300 flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-amber-400" />
                <span>Pré-visualização do QR Code Dinâmico:</span>
              </div>
              <div className="p-2 bg-white rounded-xl shadow-md border border-slate-200">
                {qrCodeDataUrl ? (
                  <img
                    src={qrCodeDataUrl}
                    alt="QR Code PIX"
                    className="w-36 h-36 object-contain"
                  />
                ) : (
                  <div className="w-36 h-36 flex items-center justify-center bg-slate-100">
                    <QrCode className="w-16 h-16 text-slate-800 animate-pulse" />
                  </div>
                )}
              </div>
              <span className="text-[10px] text-slate-400">
                Gerado automaticamente a partir da chave configurada.
              </span>
            </div>

            {/* Reiniciar Atendimento */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
              <div>
                <span className="text-xs font-semibold text-slate-300 block">Atendimento Kael:</span>
                <span className="text-[11px] text-slate-400 block">Encerrar conversa atual e iniciar nova sessão limpa.</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (onResetChat) {
                    onResetChat();
                  } else {
                    const btn = document.getElementById('btn-reset-kael-chat');
                    if (btn) btn.click();
                  }
                  setMessage({ type: 'success', text: 'Chat do Kael foi reiniciado com sucesso!' });
                }}
                className="px-3 py-2 bg-red-950/80 hover:bg-red-900 border border-red-800/80 text-red-200 rounded-xl text-xs font-medium flex items-center gap-1.5 shrink-0 transition-colors shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reiniciar Chat</span>
              </button>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading || isSaving || !inputKey.trim()}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:brightness-110 text-slate-950 text-xs font-bold shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Salvando...</span>
                  </>
                ) : (
                  <span>Salvar Chave PIX</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
