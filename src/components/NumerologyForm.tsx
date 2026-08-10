import React, { useState } from 'react';
import { Compass, Sparkles, Calendar, User, AlertCircle, CheckCircle2, Edit2 } from 'lucide-react';

interface NumerologyFormProps {
  onSubmit: (fullName: string, birthDate: string) => void;
  isLoading: boolean;
}

export const NumerologyForm: React.FC<NumerologyFormProps> = ({ onSubmit, isLoading }) => {
  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Formata data YYYY-MM-DD para DD/MM/AAAA
  const formatDateBR = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  const handlePreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName || fullName.trim().length < 3) {
      setError('Por favor, informe seu nome completo de nascimento.');
      return;
    }

    if (!birthDate) {
      setError('Por favor, selecione sua data de nascimento.');
      return;
    }

    // Abre a tela/modal de confirmação de dados
    setShowConfirmation(true);
  };

  const handleConfirmSubmit = () => {
    setShowConfirmation(false);
    onSubmit(fullName.trim(), birthDate);
  };

  return (
    <div id="form-section" className="max-w-xl mx-auto px-4 py-8">
      <div className="bg-[#120e24] border border-purple-800/50 rounded-2xl p-6 md:p-8 shadow-2xl shadow-purple-950/50 backdrop-blur-md relative overflow-hidden">
        {/* Glow de fundo */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-purple-950/80 border border-amber-500/30 text-amber-400 mb-3 shadow-inner">
            <Compass className="w-6 h-6 animate-spin-slow" />
          </div>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-slate-100">
            Descubra o significado dos seus números
          </h2>
          <p className="text-slate-400 text-xs md:text-sm mt-2">
            Crie seu mapa cabalístico personalizado a partir do seu nome e da sua data de nascimento.
          </p>
        </div>

        {/* Aviso prévio de verificação exigido pelo cliente */}
        <div className="mb-6 p-4 bg-amber-950/30 border border-amber-500/40 rounded-xl text-amber-200/90 text-xs leading-relaxed flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-amber-300 block mb-1">Confira seus dados antes de continuar:</span>
            Para que o cálculo seja realizado corretamente, informe seu <strong>nome completo de nascimento exatamente como consta no registro</strong>, incluindo todos os acentos, e sua <strong>data de nascimento correta</strong>.
            <div className="mt-2 text-[11px] text-amber-400/80 italic">
              Exemplo: "João José da Silva". Não escreva "Joao Jose da Silva" se o nome correto possuir acentos. A alteração de uma letra ou da data pode modificar os resultados calculados.
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-950/60 border border-red-800 text-red-200 text-xs rounded-lg text-center">
            {error}
          </div>
        )}

        <form onSubmit={handlePreSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-amber-400" />
              Nome completo de nascimento
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ex: João José da Silva"
              className="w-full bg-[#080612] border border-purple-900/80 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/80 transition-all"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">
              Escreva exatamente como na certidão de nascimento original (com acentos).
            </span>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              Data de nascimento
            </label>
            <input
              type="date"
              required
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full bg-[#080612] border border-purple-900/80 rounded-xl px-4 py-3 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/80 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 px-6 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:brightness-110 active:scale-[0.99] transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                Processando Mapa...
              </span>
            ) : (
              <span className="flex items-center gap-2 text-base">
                <Sparkles className="w-5 h-5 text-slate-950" />
                Continuar para verificação
              </span>
            )}
          </button>
        </form>
      </div>

      {/* Modal / Passo de Confirmação de Dados */}
      {showConfirmation && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#161228] border border-amber-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl shadow-purple-950/80 animate-in fade-in zoom-in duration-200">
            <div className="text-center mb-5">
              <div className="inline-flex items-center justify-center p-3 rounded-full bg-amber-500/10 text-amber-400 mb-2">
                <CheckCircle2 className="w-8 h-8 text-amber-400" />
              </div>
              <h3 className="text-xl font-serif font-bold text-slate-100">
                Seus dados estão corretos?
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Por favor, verifique se seu nome e data foram preenchidos sem erros antes de gerar o mapa.
              </p>
            </div>

            <div className="bg-[#0b0816] border border-purple-900/60 rounded-xl p-4 mb-6 space-y-3">
              <div>
                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                  Nome Completo:
                </span>
                <span className="text-base font-serif font-bold text-amber-300 block break-words mt-0.5">
                  {fullName}
                </span>
              </div>
              <div className="border-t border-purple-900/40 pt-2">
                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                  Data de Nascimento:
                </span>
                <span className="text-base font-bold text-slate-200 block mt-0.5">
                  {formatDateBR(birthDate)}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmation(false)}
                className="flex-1 py-3 px-4 rounded-xl font-medium text-slate-300 bg-purple-950/80 hover:bg-purple-900/80 border border-purple-800 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                <Edit2 className="w-4 h-4" />
                Corrigir dados
              </button>
              <button
                type="button"
                onClick={handleConfirmSubmit}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-110 shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                Sim, gerar meu mapa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
