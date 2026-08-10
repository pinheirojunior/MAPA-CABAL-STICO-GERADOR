import React, { useState } from 'react';
import { Copy, Check, QrCode, AlertTriangle, Loader2, Sparkles, ShieldCheck } from 'lucide-react';
import { Order } from '../types';

interface PixPaymentModalProps {
  order: Order;
  onPaymentApproved: (updatedOrder: Order) => void;
  onBack: () => void;
}

export const PixPaymentModal: React.FC<PixPaymentModalProps> = ({
  order,
  onPaymentApproved,
  onBack
}) => {
  const [copied, setCopied] = useState(false);
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pixKey = "COLOQUE_AQUI_SUA_CHAVE_PIX";

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSimulatePayment = async () => {
    setLoadingPayment(true);
    setError(null);

    try {
      const response = await fetch(`/api/orders/${order.id}/test-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Falha ao simular pagamento.');
      }

      onPaymentApproved(data.order);
    } catch (err: any) {
      setError(err.message || 'Erro ao processar simulação.');
    } finally {
      setLoadingPayment(false);
    }
  };

  return (
    <section className="py-8 px-4 max-w-xl mx-auto">
      <div className="bg-[#130f26] border border-amber-500/40 rounded-2xl p-6 sm:p-8 shadow-2xl purple-glow relative">
        
        {/* Banner do Pedido */}
        <div className="flex items-center justify-between border-b border-purple-900/60 pb-4 mb-6">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              Identificador do Pedido
            </span>
            <span className="text-xl font-mono font-bold text-amber-400">
              {order.id}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              Valor a Pagar
            </span>
            <span className="text-2xl font-black text-emerald-400">
              R$ 15,00
            </span>
          </div>
        </div>

        {/* Informações do Cliente */}
        <div className="bg-[#0d0b18] border border-purple-900/40 rounded-xl p-3.5 mb-6 text-xs text-slate-300 flex justify-between items-center">
          <div>
            <p className="font-semibold text-white">{order.name}</p>
            <p className="text-slate-400">Data de Nasc.: {order.birthDate}</p>
          </div>
          <button
            onClick={onBack}
            className="text-purple-400 hover:text-purple-300 underline text-[11px]"
          >
            Editar dados
          </button>
        </div>

        {/* Instruções de Pagamento PIX */}
        <div className="text-center mb-6">
          <h3 className="text-lg font-bold text-white mb-1 flex items-center justify-center gap-2">
            <QrCode className="w-5 h-5 text-amber-400" />
            Pagamento via PIX
          </h3>
          <p className="text-xs text-slate-300">
            Copie a chave PIX abaixo ou simule a aprovação do teste para liberar o seu PDF.
          </p>
        </div>

        {/* Simulação Visual do QR Code PIX */}
        <div className="bg-white p-4 rounded-xl w-44 h-44 mx-auto mb-6 flex flex-col items-center justify-center border-4 border-amber-500/30 shadow-inner text-slate-900">
          <QrCode className="w-28 h-28 text-slate-900" />
          <span className="text-[9px] font-mono font-bold uppercase text-slate-600 mt-1">
            PIX R$15,00
          </span>
        </div>

        {/* Caixa da Chave PIX Cópia e Cola */}
        <div className="mb-6">
          <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1.5 text-center">
            Chave PIX (Copia e Cola)
          </label>
          <div className="flex items-center gap-2 bg-[#0d0b18] border border-purple-800/60 rounded-xl p-2.5">
            <input
              type="text"
              readOnly
              value={pixKey}
              className="bg-transparent font-mono text-xs text-amber-300 w-full focus:outline-none px-2 select-all"
            />
            <button
              onClick={handleCopyPix}
              className="bg-purple-900/80 hover:bg-purple-800 text-white text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-amber-400" />
                  <span>Copiar</span>
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-rose-950/80 border border-rose-600/50 text-rose-200 text-xs p-3 rounded-xl mb-5">
            {error}
          </div>
        )}

        {/* Área de Desenvolvimento / Botão de Simulação */}
        <div className="bg-amber-950/30 border border-amber-500/40 rounded-xl p-4 mb-4">
          <div className="flex items-start gap-2.5 mb-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wide">
                Ambiente de Desenvolvimento / MVP
              </h4>
              <p className="text-[11px] text-slate-300 leading-normal mt-0.5">
                Clique no botão abaixo para simular o pagamento aprovado. O sistema gerará o seu Mapa Cabalístico e o arquivo PDF instantaneamente.
              </p>
            </div>
          </div>

          <button
            id="btnTestPayment"
            onClick={handleSimulatePayment}
            disabled={loadingPayment}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm sm:text-base rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loadingPayment ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Gerando Mapa & PDF...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-emerald-200" />
                <span>Simular pagamento aprovado</span>
              </>
            )}
          </button>
        </div>

        <div className="text-center text-[10px] text-slate-400 flex items-center justify-center gap-1 pt-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Após a simulação, o PDF ficará disponível imediatamente para download.</span>
        </div>

      </div>
    </section>
  );
};
