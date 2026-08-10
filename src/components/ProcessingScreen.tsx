import React, { useEffect, useState } from 'react';
import { Compass, CheckCircle2, Sparkles, FileText } from 'lucide-react';

interface ProcessingScreenProps {
  fullName: string;
}

export const ProcessingScreen: React.FC<ProcessingScreenProps> = ({ fullName }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    'Calculando matriz de frequências do nome',
    'Processando os três ciclos e desafios da data',
    'Elaborando a síntese interpretativa e simbólica',
    'Formatando e gerando o documento em PDF'
  ];

  useEffect(() => {
    const timer1 = setTimeout(() => setCurrentStep(1), 600);
    const timer2 = setTimeout(() => setCurrentStep(2), 1200);
    const timer3 = setTimeout(() => setCurrentStep(3), 1800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      <div className="bg-[#120e24] border border-purple-800/60 rounded-2xl p-8 shadow-2xl backdrop-blur-md relative overflow-hidden">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-950/80 border border-amber-500/40 text-amber-400 mb-6 relative">
          <Compass className="w-10 h-10 animate-spin-slow text-amber-400" />
          <Sparkles className="w-5 h-5 text-purple-300 absolute -top-1 -right-1 animate-pulse" />
        </div>

        <h3 className="text-xl md:text-2xl font-serif font-bold text-slate-100 mb-1">
          Gerando Mapa Cabalístico
        </h3>
        <p className="text-xs text-amber-400/90 mb-8">
          Analisando frequências para <span className="font-semibold text-slate-200">{fullName}</span>...
        </p>

        <div className="space-y-4 text-left max-w-sm mx-auto">
          {steps.map((stepText, idx) => {
            const isDone = idx < currentStep;
            const isCurrent = idx === currentStep;

            return (
              <div
                key={idx}
                className={`flex items-center gap-3 text-xs transition-all ${
                  isDone
                    ? 'text-emerald-400 font-medium'
                    : isCurrent
                    ? 'text-amber-300 font-semibold scale-[1.02]'
                    : 'text-slate-600'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : isCurrent ? (
                  <div className="w-4 h-4 rounded-full border-2 border-amber-400 border-t-transparent animate-spin shrink-0" />
                ) : (
                  <FileText className="w-4 h-4 text-slate-700 shrink-0" />
                )}
                <span>{stepText}</span>
              </div>
            );
          })}
        </div>

        <div className="mt-8 pt-4 border-t border-purple-900/40 text-[11px] text-slate-500">
          O motor numerológico está aplicando a tabela determinística e gerando a leitura completa.
        </div>
      </div>
    </div>
  );
};
