import React, { useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { NumerologyForm } from './components/NumerologyForm';
import { ProcessingScreen } from './components/ProcessingScreen';
import { MapPreview } from './components/MapPreview';
import { Footer } from './components/Footer';
import { FullCabalisticMap } from './types/numerology';

export default function App() {
  const [step, setStep] = useState<'input' | 'processing' | 'result'>('input');
  const [fullName, setFullName] = useState('');
  const [mapData, setMapData] = useState<FullCabalisticMap | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleStartOrder = () => {
    const el = document.getElementById('form-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
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

        <main className="pb-12">
          {error && (
            <div className="max-w-xl mx-auto px-4 pt-4">
              <div className="p-4 bg-red-950/80 border border-red-800 text-red-200 text-xs rounded-xl text-center">
                {error}
              </div>
            </div>
          )}

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
        </main>
      </div>

      <Footer />
    </div>
  );
}
