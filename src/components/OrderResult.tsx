import React, { useState } from 'react';
import { Download, CheckCircle2, Sparkles, Hash, Eye, ShieldCheck, FileText } from 'lucide-react';
import { Order } from '../types';
import { AiChatSection } from './AiChatSection';

interface OrderResultProps {
  order: Order;
  onNewOrder: () => void;
}

export const OrderResult: React.FC<OrderResultProps> = ({ order, onNewOrder }) => {
  const [activeTab, setActiveTab] = useState<'sintese' | 'interpretacao'>('sintese');
  const map = order.map;

  if (!map) {
    return (
      <div className="py-12 px-4 text-center">
        <p className="text-rose-400">Dados do mapa ainda não foram gerados.</p>
      </div>
    );
  }

  const numbersList = [
    { label: 'NÚMERO DE DESTINO', val: map.numbers.destino, desc: 'Caminho de Vida e Missão' },
    { label: 'EXPRESSÃO', val: map.numbers.expressao, desc: 'Talento e Nome de Batismo' },
    { label: 'ALMA (MOTIVAÇÃO)', val: map.numbers.alma, desc: 'Anseios do Seu Ser' },
    { label: 'PERSONALIDADE', val: map.numbers.personalidade, desc: 'Como o Mundo te Enxerga' },
    { label: 'MISSÃO', val: map.numbers.missao, desc: 'Propósito Maior na Terra' },
    { label: 'ANO PESSOAL', val: map.numbers.anoPessoal, desc: 'Ciclo em Ação Neste Ano' },
  ];

  return (
    <section className="py-8 px-4 max-w-3xl mx-auto space-y-6">
      
      {/* Card de Pagamento Confirmado & Download em Destaque */}
      <div className="bg-gradient-to-br from-[#130f26] via-[#1a1238] to-[#0d0b18] border border-emerald-500/50 rounded-2xl p-6 sm:p-8 shadow-2xl purple-glow text-center relative overflow-hidden">
        
        <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Pagamento Aprovado • Pedido {order.id}</span>
        </div>

        <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
          Seu Mapa Cabalístico está <span className="gold-gradient-text">Pronto!</span>
        </h2>

        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto mb-6">
          Análise gerada com sucesso para <strong className="text-amber-300">{map.userInfo.fullName}</strong> ({map.userInfo.formattedBirthDate}).
        </p>

        {/* Botão Principal de Download do PDF */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
          <a
            id="btnDownloadPdf"
            href={`/api/orders/${order.id}/pdf`}
            download={`mapa-${order.id}.pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-4 px-6 gold-gradient-bg text-[#0d0b18] font-black text-base sm:text-lg rounded-xl shadow-xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer border border-amber-300/40"
          >
            <Download className="w-5 h-5 text-[#0d0b18]" />
            <span>Baixar Mapa Cabalístico (PDF)</span>
          </a>
        </div>

        <p className="text-[11px] text-slate-400 mt-3 flex items-center justify-center gap-1">
          <FileText className="w-3.5 h-3.5 text-amber-400" />
          Nome do arquivo: <code className="text-amber-300 font-mono">mapa-{order.id}.pdf</code>
        </p>
      </div>

      {/* Tabs de Alternância de Leitura */}
      <div className="flex bg-[#130f26] p-1.5 rounded-xl border border-purple-900/60 max-w-md mx-auto">
        <button
          onClick={() => setActiveTab('sintese')}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'sintese'
              ? 'bg-amber-500 text-slate-950 font-bold shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Hash className="w-3.5 h-3.5" />
          <span>Síntese de Números</span>
        </button>

        <button
          onClick={() => setActiveTab('interpretacao')}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'interpretacao'
              ? 'bg-amber-500 text-slate-950 font-bold shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Leitura na Tela</span>
        </button>
      </div>

      {/* Conteúdo da Tab 1: Números */}
      {activeTab === 'sintese' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {numbersList.map((numItem, idx) => (
              <div
                key={idx}
                className="bg-[#130f26] border border-amber-500/30 rounded-xl p-4 flex flex-col justify-between hover:border-amber-400/60 transition-colors"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-1">
                    {numItem.label}
                  </span>
                  <div className="text-3xl font-black text-white mb-1">
                    {numItem.val}
                  </div>
                </div>
                <p className="text-[11px] text-slate-400">
                  {numItem.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="bg-[#130f26] border border-purple-800/50 rounded-xl p-4 text-xs text-purple-200 flex flex-col sm:flex-row justify-between items-center gap-2">
            <div>
              <span className="font-bold text-amber-300">Elemento:</span> {map.element}
            </div>
            <div>
              <span className="font-bold text-amber-300">Arcanjo:</span> {map.arcanoAnjo}
            </div>
            <div>
              <span className="font-bold text-amber-300">Proteção:</span> {map.salmoProtecao}
            </div>
          </div>
        </div>
      )}

      {/* Conteúdo da Tab 2: Leitura Direta na Tela */}
      {activeTab === 'interpretacao' && (
        <div className="bg-[#130f26] border border-purple-800/60 rounded-2xl p-6 text-slate-200 space-y-5 text-sm">
          <h3 className="text-lg font-bold text-amber-400 border-b border-purple-900/60 pb-2">
            Interpretações da sua Vibração Cabalística
          </h3>

          <div className="space-y-3">
            <h4 className="font-bold text-white text-sm text-purple-300">1. O Caminho de Destino ({map.numbers.destino})</h4>
            <p className="text-slate-300 leading-relaxed text-xs sm:text-sm">{map.interpretations.destinoText}</p>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-white text-sm text-purple-300">2. Expressão do Nome ({map.numbers.expressao})</h4>
            <p className="text-slate-300 leading-relaxed text-xs sm:text-sm">{map.interpretations.expressaoText}</p>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-white text-sm text-purple-300">3. A Alma e seus Anseios ({map.numbers.alma})</h4>
            <p className="text-slate-300 leading-relaxed text-xs sm:text-sm">{map.interpretations.almaText}</p>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-white text-sm text-purple-300">4. Sua Missão de Vida ({map.numbers.missao})</h4>
            <p className="text-slate-300 leading-relaxed text-xs sm:text-sm">{map.interpretations.missaoText}</p>
          </div>

          <div className="bg-[#0d0b18] p-4 rounded-xl border border-purple-900/40">
            <h4 className="font-bold text-amber-300 text-xs uppercase tracking-wider mb-2">Recomendações Práticas:</h4>
            <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-300">
              {map.interpretations.recomendacoes.map((rec, i) => (
                <li key={i}>{rec}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Consultor de IA do Mapa */}
      <AiChatSection order={order} />

      {/* Botão Novo Pedido */}
      <div className="text-center pt-4">
        <button
          onClick={onNewOrder}
          className="text-xs text-slate-400 hover:text-white underline transition-colors"
        >
          Fazer um novo mapa cabalístico para outra pessoa
        </button>
      </div>

    </section>
  );
};
