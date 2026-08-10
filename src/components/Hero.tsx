import React from 'react';
import { Sparkles, ArrowDown, Compass } from 'lucide-react';

interface HeroProps {
  onStartOrder: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStartOrder }) => {
  return (
    <section className="relative pt-10 pb-8 px-4 overflow-hidden text-center">
      {/* Luzes de fundo místicas */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-900/20 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-72 h-72 bg-amber-600/10 rounded-full blur-2xl -z-10 pointer-events-none" />

      <div className="max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-purple-950/80 border border-purple-800/60 px-4 py-1.5 rounded-full text-amber-300 text-xs font-medium mb-6">
          <Compass className="w-3.5 h-3.5 text-amber-400" />
          <span>MAPA CABALÍSTICO PERSONALIZADO</span>
        </div>

        {/* Título Oficial Solicitado */}
        <h1 className="text-3xl sm:text-5xl font-serif font-bold text-slate-100 tracking-tight leading-tight mb-4">
          Descubra o significado dos seus <span className="text-amber-400">números</span>
        </h1>

        {/* Subtítulo Oficial Solicitado */}
        <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed mb-8 max-w-2xl mx-auto">
          Crie seu mapa cabalístico personalizado a partir do seu nome e da sua data de nascimento.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onStartOrder}
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-slate-950 font-bold text-base rounded-xl shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group cursor-pointer"
          >
            <Sparkles className="w-5 h-5 text-slate-950" />
            <span>Gerar meu mapa</span>
            <ArrowDown className="w-4 h-4 text-slate-950 group-hover:translate-y-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
};
