import React, { useState } from 'react';
import { FullCabalisticMap } from '../types/numerology';
import { LifeTriangleVisual } from './LifeTriangleVisual';
import { Download, Sparkles, RefreshCw, Compass, BookOpen, Layers, Target, Clock, ShieldCheck } from 'lucide-react';

interface MapPreviewProps {
  mapData: FullCabalisticMap;
  onNewMap: () => void;
}

export const MapPreview: React.FC<MapPreviewProps> = ({ mapData, onNewMap }) => {
  const [activeTab, setActiveTab] = useState<'indicadores' | 'nome' | 'data' | 'areas' | 'sintese'>('indicadores');

  const { engineData, interpretation } = mapData;
  const { indicators, nameAnalysis, dateAnalysis } = engineData;

  const handleDownloadPDF = () => {
    if (mapData.pdfUrl) {
      window.open(mapData.pdfUrl, '_blank');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Banner Principal de Confirmação */}
      <div className="bg-[#120e24] border border-amber-500/40 rounded-2xl p-6 md:p-8 text-center shadow-2xl relative overflow-hidden mb-8">
        <div className="inline-flex items-center justify-center p-3 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 mb-4">
          <Sparkles className="w-8 h-8" />
        </div>

        <h2 className="text-2xl md:text-3xl font-serif font-bold text-slate-100 mb-2">
          Seu mapa está pronto!
        </h2>
        <p className="text-slate-300 text-sm max-w-md mx-auto mb-6">
          A análise numerológica para <span className="font-semibold text-amber-400">{engineData.inputs.fullName}</span> foi gerada com sucesso.
        </p>

        {/* Botão de Ação Principal: Baixar PDF */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={handleDownloadPDF}
            className="w-full sm:w-auto py-4 px-8 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:brightness-110 active:scale-[0.99] transition-all shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer text-base"
          >
            <Download className="w-5 h-5 text-slate-950" />
            Baixar meu mapa em PDF
          </button>

          <button
            onClick={onNewMap}
            className="w-full sm:w-auto py-3 px-5 rounded-xl font-medium text-slate-300 border border-purple-800/80 hover:bg-purple-950/50 transition-all flex items-center justify-center gap-2 text-xs cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-slate-400" />
            Gerar outro mapa
          </button>
        </div>
      </div>

      {/* Navegação por Abas de Prévia */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 border-b border-purple-950 no-scrollbar">
        {[
          { id: 'indicadores', label: 'Indicadores', icon: Target },
          { id: 'nome', label: 'Análise do Nome', icon: BookOpen },
          { id: 'data', label: 'Data, Ciclos & Desafios', icon: Clock },
          { id: 'areas', label: 'Áreas da Vida', icon: Layers },
          { id: 'sintese', label: 'Síntese Final', icon: Compass }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'bg-[#120e24] text-slate-300 border border-purple-900/40 hover:border-purple-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Conteúdo da Aba: Indicadores Principais */}
      {activeTab === 'indicadores' && (
        <div className="space-y-4">
          <div className="bg-[#120e24] border border-purple-800/40 rounded-xl p-5 mb-4">
            <h3 className="text-lg font-serif font-bold text-amber-400 mb-1 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              Seus Indicadores Principais (Camada Objetiva & Interpretativa)
            </h3>
            <p className="text-xs text-slate-400">
              Cada número reflete uma frequência calculada pelo motor determinístico do seu nome e data.
            </p>
          </div>

          {[
            { label: 'MOTIVAÇÃO (Vogais)', val: indicators.motivacao, text: interpretation.indicadoresTexto.motivacaoText },
            { label: 'IMPRESSÃO (Consoantes)', val: indicators.impressao, text: interpretation.indicadoresTexto.impressaoText },
            { label: 'EXPRESSÃO (Nome Completo)', val: indicators.expressao, text: interpretation.indicadoresTexto.expressaoText },
            { label: 'DESTINO (Data de Nascimento)', val: indicators.destino, text: interpretation.indicadoresTexto.destinoText },
            { label: 'MISSÃO (Expressão + Destino)', val: indicators.missao, text: interpretation.indicadoresTexto.missaoText }
          ].map((item, idx) => (
            <div key={idx} className="bg-[#120e24] border border-purple-900/60 rounded-xl p-5 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="flex-1">
                <span className="text-[10px] uppercase tracking-wider text-purple-400 font-bold block mb-1">
                  {item.label}
                </span>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {item.text}
                </p>
              </div>
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-bold text-2xl flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20">
                {item.val}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Conteúdo da Aba: Análise do Nome */}
      {activeTab === 'nome' && (
        <div className="space-y-6">
          <div className="bg-[#120e24] border border-purple-900/60 rounded-xl p-6">
            <h3 className="text-lg font-serif font-bold text-amber-400 mb-3">
              Distribuição Numérica do Nome
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-9 gap-2 mb-4">
              {Array.from({ length: 9 }, (_, i) => i + 1).map((num) => {
                const count = nameAnalysis.distribution.occurrences[num] || 0;
                return (
                  <div key={num} className="bg-[#080612] border border-purple-800/50 rounded-lg p-2 text-center">
                    <span className="text-xs font-bold text-amber-400 block">Nº {num}</span>
                    <span className="text-sm font-bold text-slate-100">{count}x</span>
                  </div>
                );
              })}
            </div>

            <div className="text-xs space-y-1.5 text-slate-300">
              <p>• <span className="font-semibold text-purple-300">Repetições (≥ 3x):</span> {nameAnalysis.distribution.repetitions.length > 0 ? nameAnalysis.distribution.repetitions.join(', ') : 'Nenhuma repetição marcante'}</p>
              <p>• <span className="font-semibold text-purple-300">Ausências (0x):</span> {nameAnalysis.distribution.absences.length > 0 ? nameAnalysis.distribution.absences.join(', ') : 'Todas as frequências presentes'}</p>
              <p>• <span className="font-semibold text-purple-300">Predominâncias:</span> {nameAnalysis.distribution.predominances.length > 0 ? nameAnalysis.distribution.predominances.join(', ') : 'Sem predominância única'}</p>
            </div>
          </div>

          <LifeTriangleVisual data={nameAnalysis.lifeTriangle} />
        </div>
      )}

      {/* Conteúdo da Aba: Data, Ciclos & Desafios */}
      {activeTab === 'data' && (
        <div className="space-y-6">
          <div className="bg-[#120e24] border border-purple-900/60 rounded-xl p-6">
            <h3 className="text-lg font-serif font-bold text-amber-400 mb-4">
              Ano Pessoal Atual ({dateAnalysis.personalYear.currentYear})
            </h3>
            <div className="flex items-center gap-4 bg-[#080612] p-4 rounded-xl border border-amber-500/30">
              <div className="w-12 h-12 rounded-xl bg-amber-500 text-slate-950 font-bold text-xl flex items-center justify-center shrink-0">
                {dateAnalysis.personalYear.yearNumber}
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-100">{dateAnalysis.personalYear.theme}</h4>
                <p className="text-xs text-slate-300 mt-1">{dateAnalysis.personalYear.interpretation}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#120e24] border border-purple-900/60 rounded-xl p-6">
            <h3 className="text-lg font-serif font-bold text-amber-400 mb-4">
              Os Três Ciclos Principais de Vida
            </h3>
            <div className="space-y-3">
              {dateAnalysis.cycles.map((cyc, idx) => (
                <div key={idx} className="bg-[#080612] p-4 rounded-xl border border-purple-900/40">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-purple-300">{cyc.period} ({cyc.ageRange})</span>
                    <span className="text-xs font-bold text-amber-400">Vibração {cyc.value}</span>
                  </div>
                  <p className="text-xs text-slate-300">{cyc.symbolicInterpretation}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#120e24] border border-purple-900/60 rounded-xl p-6">
            <h3 className="text-lg font-serif font-bold text-amber-400 mb-4">
              Os Três Desafios Numerológicos
            </h3>
            <div className="space-y-3">
              {dateAnalysis.challenges.map((ch, idx) => (
                <div key={idx} className="bg-[#080612] p-4 rounded-xl border border-purple-900/40">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-purple-300">{ch.challengeType}</span>
                    <span className="text-xs font-bold text-amber-400">Vibração {ch.value}</span>
                  </div>
                  <p className="text-xs text-slate-300">{ch.meaning}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Conteúdo da Aba: Áreas da Vida */}
      {activeTab === 'areas' && (
        <div className="space-y-4">
          {interpretation.lifeAreas.map((area, idx) => (
            <div key={idx} className="bg-[#120e24] border border-purple-900/60 rounded-xl p-5">
              <h4 className="text-sm font-bold text-amber-400 mb-2 flex items-center justify-between">
                <span>{area.areaName}</span>
                <span className="text-xs font-mono bg-purple-950 px-2.5 py-1 rounded-full text-purple-200">
                  Nº {area.associatedNumber}
                </span>
              </h4>
              <p className="text-xs text-slate-200 leading-relaxed">{area.text}</p>
            </div>
          ))}
        </div>
      )}

      {/* Conteúdo da Aba: Síntese Final */}
      {activeTab === 'sintese' && (
        <div className="bg-[#120e24] border border-purple-900/60 rounded-xl p-6 space-y-5">
          <div>
            <h3 className="text-lg font-serif font-bold text-amber-400 mb-2">Leitura Integrada</h3>
            <p className="text-xs text-slate-200 leading-relaxed">{interpretation.sinteseFinal.leituraIntegrada}</p>
          </div>

          <div>
            <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider mb-2">Potenciais em Destaque:</h4>
            <ul className="space-y-1 text-xs text-slate-300 list-disc list-inside">
              {interpretation.sinteseFinal.potenciaisDestacados.map((pot, idx) => (
                <li key={idx}>{pot}</li>
              ))}
            </ul>
          </div>

          <div className="pt-4 border-t border-purple-900/40 text-center">
            <p className="text-xs italic text-amber-300/90 font-serif">
              "{interpretation.sinteseFinal.reflexoesFinais}"
            </p>
          </div>
        </div>
      )}

      {/* Botão de Rodapé para Download */}
      <div className="mt-8 text-center">
        <button
          onClick={handleDownloadPDF}
          className="py-3 px-8 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-110 transition-all shadow-lg shadow-amber-500/20 inline-flex items-center gap-2 cursor-pointer text-sm"
        >
          <Download className="w-4 h-4 text-slate-950" />
          Baixar Mapa Completo em PDF
        </button>
      </div>
    </div>
  );
};
