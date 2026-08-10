import React from 'react';
import { Sparkles, Compass } from 'lucide-react';

interface HeaderProps {
  onReset?: () => void;
  activeMapId?: string | null;
}

export const Header: React.FC<HeaderProps> = ({ onReset, activeMapId }) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0d0b18]/90 backdrop-blur-md border-b border-purple-900/40 px-4 py-3">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <button 
          onClick={onReset} 
          className="flex items-center gap-2.5 text-left group transition-transform hover:scale-[1.01] cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-900 via-purple-700 to-amber-600 p-0.5 flex items-center justify-center shadow-lg shadow-purple-950/50">
            <div className="w-full h-full bg-[#0d0b18] rounded-[10px] flex items-center justify-center">
              <Compass className="w-5 h-5 text-amber-400 group-hover:rotate-45 transition-transform duration-500" />
            </div>
          </div>
          <div>
            <span className="font-bold tracking-tight text-white text-base block leading-none">
              MAPA CABALÍSTICO <span className="text-amber-400">PERSONALIZADO</span>
            </span>
            <span className="text-[10px] text-purple-300/80 tracking-wider uppercase font-medium">
              Análise Numerológica Personalizada
            </span>
          </div>
        </button>

        <div className="flex items-center gap-2">
          {activeMapId ? (
            <span className="text-xs bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-full font-mono font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              {activeMapId}
            </span>
          ) : (
            <span className="text-xs bg-purple-900/40 text-purple-200 border border-purple-700/40 px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              MVP Funcional
            </span>
          )}
        </div>
      </div>
    </header>
  );
};
