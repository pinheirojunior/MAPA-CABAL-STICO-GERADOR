import React from 'react';
import { Compass, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-16 border-t border-purple-950 bg-[#080610] py-8 px-4 text-slate-400 text-xs">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
        <div className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-amber-400" />
          <span className="font-bold text-white text-sm">
            MAPA CABALÍSTICO <span className="text-amber-400">PERSONALIZADO</span>
          </span>
        </div>

        <p className="text-[11px] text-slate-400 max-w-md">
          MVP funcional para cálculo determinístico de frequências numerológicas e geração automatizada de leitura em PDF.
        </p>

        <div className="flex items-center gap-1.5 text-amber-400 text-[11px] font-medium">
          <Sparkles className="w-4 h-4" />
          <span>Análise Simbólica & Interpretativa</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto mt-6 pt-4 border-t border-purple-950/60 text-center text-[10px] text-slate-400">
        © {new Date().getFullYear()} MAPA CABALÍSTICO PERSONALIZADO. Todos os direitos reservados.
      </div>
    </footer>
  );
};
