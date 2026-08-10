import React from 'react';
import { Hash, BookOpen, FileText } from 'lucide-react';

export const Benefits: React.FC = () => {
  const cards = [
    {
      icon: Hash,
      title: "1. Seus números",
      description: "Conheça os principais números encontrados a partir dos seus dados.",
      badge: "Gematria & Destino"
    },
    {
      icon: BookOpen,
      title: "2. Interpretação personalizada",
      description: "Entenda os significados associados aos números do seu mapa.",
      badge: "Alma & Missão"
    },
    {
      icon: FileText,
      title: "3. PDF personalizado",
      description: "Receba seu material organizado em um documento digital.",
      badge: "Pronto para Leitura"
    }
  ];

  return (
    <section className="py-8 px-4 max-w-5xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-2">
          O que você vai receber no seu mapa
        </h2>
        <p className="text-sm text-slate-300 max-w-lg mx-auto">
          Uma análise completa e prática dos seus códigos numéricos místico-cabalísticos.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="bg-[#130f26]/80 border border-purple-900/60 hover:border-amber-500/50 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 group flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-purple-950/80 border border-purple-800/60 flex items-center justify-center mb-4 group-hover:border-amber-500/60 transition-colors">
                  <Icon className="w-6 h-6 text-amber-400" />
                </div>
                
                <span className="inline-block text-[10px] font-semibold uppercase tracking-wider text-purple-300 bg-purple-950 px-2.5 py-1 rounded-md mb-2">
                  {card.badge}
                </span>

                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-amber-300 transition-colors">
                  {card.title}
                </h3>

                <p className="text-sm text-slate-300 leading-relaxed">
                  {card.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
