import React from 'react';
import { LifeTriangleData } from '../types/numerology';

interface LifeTriangleVisualProps {
  data: LifeTriangleData;
}

export const LifeTriangleVisual: React.FC<LifeTriangleVisualProps> = ({ data }) => {
  if (!data || !data.rows || data.rows.length === 0) return null;

  return (
    <div className="bg-[#120e24] border border-purple-900/60 rounded-xl p-6 my-6 text-center shadow-lg backdrop-blur-sm">
      <h4 className="text-amber-400 font-serif font-bold text-lg mb-2 flex items-center justify-center gap-2">
        <span>🔺</span> Triângulo da Vida (Síntese Alfabética)
      </h4>
      <p className="text-slate-300 text-xs max-w-xl mx-auto mb-6">
        {data.description}
      </p>

      <div className="flex flex-col items-center justify-center gap-2 font-mono overflow-x-auto py-2">
        {data.rows.map((row) => {
          const isBase = row.level === data.rows.length;
          return (
            <div
              key={row.level}
              className={`flex items-center justify-center gap-2 transition-all ${
                isBase ? 'scale-110 my-2' : ''
              }`}
            >
              {row.numbers.map((num, idx) => (
                <span
                  key={idx}
                  className={`inline-flex items-center justify-center rounded-full font-bold transition-transform ${
                    isBase
                      ? 'w-10 h-10 bg-amber-500 text-slate-950 text-base shadow-lg shadow-amber-500/30 ring-2 ring-amber-300'
                      : 'w-7 h-7 bg-purple-950/80 text-purple-200 text-xs border border-purple-800/50'
                  }`}
                >
                  {num}
                </span>
              ))}
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-purple-900/40 text-[11px] text-amber-300/80">
        Vértice de Condensação do Nome: <span className="font-bold text-amber-400 text-sm">Vibração {data.baseVertex}</span>
      </div>
    </div>
  );
};
