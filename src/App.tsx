import React, { useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { NumerologyForm } from './components/NumerologyForm';
import { ProcessingScreen } from './components/ProcessingScreen';
import { MapPreview } from './components/MapPreview';
import { KaelChat } from './components/KaelChat';
import { Footer } from './components/Footer';
import { FullCabalisticMap } from './types/numerology';
import { MessageSquare, Sparkles, FileText } from 'lucide-react';

export default function App() {
  const [mode, setMode] = useState<'kael' | 'generator'>('kael');
  const [step, setStep] = useState<'input' | 'processing' | 'result'>('input');
  const [fullName, setFullName] = useState('');
  const [mapData, setMapData] = useState<FullCabalisticMap | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleStartOrder = () => {
    if (mode === 'kael') {
      window.scrollTo({ top: 120, behavior: 'smooth' });
    } else {
      const el = document.getElementById('form-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleGenerateMap = async (name: string, birthDate: string) => {
    setFullName(name);
    setError(null);
    setIsLoading(true);
    setStep('processing');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      const response = await fetch('/api/generate-map', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: name, birthDate })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Erro ao gerar o Mapa Cabalístico Personalizado.');
      }

      setMapData(data.map);
      setStep('result');
    } catch (err: any) {
      console.error('Erro no envio do formulário:', err);
      setError(err?.message || 'Ocorreu um erro ao processar seu pedido. Tente novamente.');
      setStep('input');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setMapData(null);
    setStep('input');
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#0b0914] text-slate-100 flex flex-col justify-between selection:bg-amber-500 selection:text-slate-950 font-sans">
      <div>
        <Header onReset={handleReset} activeMapId={mapData?.id} />

        {/* Seletor de Modo: Kael Assistente vs Gerador Direto */}
        <div className="bg-slate-900/80 border-b border-amber-500/20 py-2.5 px-4 backdrop-blur-md sticky top-[61px] z-30 shadow-md">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider hidden sm:inline">
                Modo de Operação:
              </span>
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setMode('kael')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    mode === 'kael'
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Atendente Kael (Vendas & IA)</span>
                </button>
                <button
                  onClick={() => setMode('generator')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    mode === 'generator'
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Gerador Direto (Formulário)</span>
                </button>
              </div>
            </div>

            <div className="text-[11px] text-amber-300/80 font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Kael preserva 100% dos motores numerológicos originais</span>
            </div>
          </div>
        </div>

        <main className="pb-12">
          {error && (
            <div className="max-w-xl mx-auto px-4 pt-4">
              <div className="p-4 bg-red-950/80 border border-red-800 text-red-200 text-xs rounded-xl text-center">
                {error}
              </div>
            </div>
          )}

          {mode === 'kael' ? (
            <KaelChat />
          ) : (
            <>
              {step === 'input' && (
                <>
                  <Hero onStartOrder={handleStartOrder} />
                  <NumerologyForm onSubmit={handleGenerateMap} isLoading={isLoading} />
                </>
              )}

              {step === 'processing' && (
                <ProcessingScreen fullName={fullName} />
              )}

              {step === 'result' && mapData && (
                <MapPreview mapData={mapData} onNewMap={handleReset} />
              )}
            </>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}

