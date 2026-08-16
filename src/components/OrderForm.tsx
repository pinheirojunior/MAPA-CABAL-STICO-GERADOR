import React, { useState } from 'react';
import { User, Calendar, Lock, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { Order } from '../types';

interface OrderFormProps {
  onOrderCreated: (order: Order) => void;
}

export const OrderForm: React.FC<OrderFormProps> = ({ onOrderCreated }) => {
  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim() || fullName.trim().length < 3) {
      setError('Por favor, informe seu nome completo.');
      return;
    }

    if (!birthDate) {
      setError('Por favor, selecione sua data de nascimento.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName.trim(),
          birthDate: birthDate
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar o pedido.');
      }

      onOrderCreated(data);
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro ao processar seu formulário. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="form-section" className="py-8 px-4 max-w-xl mx-auto scroll-mt-20">
      <div className="bg-[#130f26] border border-amber-500/30 rounded-2xl p-6 sm:p-8 shadow-xl purple-glow relative">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 text-xs text-amber-300 font-semibold bg-amber-500/10 px-3 py-1 rounded-full mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Passo 1 de 2: Dados do Mapa</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Preencha seus dados
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Seus dados serão utilizados para calcular os números exatos da sua Gematria.
          </p>
        </div>

        {error && (
          <div className="bg-rose-950/80 border border-rose-600/50 text-rose-200 text-xs sm:text-sm p-3.5 rounded-xl mb-5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0"></span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Campo Nome Completo */}
          <div>
            <label htmlFor="fullNameInput" className="block text-xs font-semibold text-slate-200 uppercase tracking-wider mb-2">
              Nome Completo <span className="text-amber-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-purple-400">
                <User className="w-5 h-5" />
              </div>
              <input
                id="fullNameInput"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ex: Maria Souza da Silva"
                className="w-full pl-11 pr-4 py-3 bg-[#0d0b18] border border-purple-800/60 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-sm sm:text-base transition-colors"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Escreva o nome de batismo ou nascimento completo.
            </p>
          </div>

          {/* Campo Data de Nascimento */}
          <div>
            <label htmlFor="birthDateInput" className="block text-xs font-semibold text-slate-200 uppercase tracking-wider mb-2">
              Data de Nascimento <span className="text-amber-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-purple-400">
                <Calendar className="w-5 h-5" />
              </div>
              <input
                id="birthDateInput"
                type="date"
                required
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-[#0d0b18] border border-purple-800/60 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-sm sm:text-base transition-colors"
              />
            </div>
          </div>

          {/* Botão de Envio */}
          <button
            id="btnSubmitOrder"
            type="submit"
            disabled={loading}
            className="w-full py-4 px-6 gold-gradient-bg text-[#0d0b18] font-bold text-base rounded-xl shadow-md hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-[#0d0b18]" />
                <span>Gerando seu pedido...</span>
              </>
            ) : (
              <>
                <span>Continuar — R$ 14,90</span>
                <ArrowRight className="w-5 h-5 text-[#0d0b18]" />
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-1">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Processamento seguro. Valor único sem assinaturas ocultas.</span>
          </div>
        </form>
      </div>
    </section>
  );
};
