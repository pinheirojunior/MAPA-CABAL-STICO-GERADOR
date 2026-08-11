import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, RefreshCw, CheckCircle2, FileDown, Sparkles, User, ShieldCheck, AlertCircle, PhoneCall } from 'lucide-react';
import { KaelSession, KaelMessage, KaelState } from '../types/kael';

interface KaelChatProps {
  onClose?: () => void;
}

export function KaelChat({ onClose }: KaelChatProps) {
  const [sessionId, setSessionId] = useState<string>(() => {
    return localStorage.getItem('kael_session_id') || `kael-${Date.now()}`;
  });
  const [session, setSession] = useState<KaelSession | null>(null);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingMap, setIsGeneratingMap] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Carrega ou inicializa a sessão do Kael ao montar
  useEffect(() => {
    localStorage.setItem('kael_session_id', sessionId);
    loadSession(sessionId);
  }, [sessionId]);

  // Scroll automático para a última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session?.messages, isLoading, isGeneratingMap]);

  const loadSession = async (sid: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch('/api/kael/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: sid })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSession(data.session);
      } else {
        setError(data.error || 'Erro ao carregar sessão com o Kael.');
      }
    } catch (err: any) {
      console.error('Erro na sessão:', err);
      setError('Erro de conexão com o servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = inputMessage.trim();
    if (!text || isLoading || !session) return;

    setInputMessage('');
    setIsLoading(true);
    setError(null);

    // Otimista: adiciona mensagem do usuário
    const tempUserMsg: KaelMessage = {
      id: `temp-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toISOString()
    };

    setSession(prev => prev ? {
      ...prev,
      messages: [...prev.messages, tempUserMsg]
    } : null);

    try {
      const res = await fetch('/api/kael/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, message: text })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setSession(data.session);
      } else {
        setError(data.error || 'Erro ao enviar mensagem para o Kael.');
      }
    } catch (err) {
      console.error('Erro ao enviar mensagem:', err);
      setError('Falha de comunicação com o servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSimulatePayment = async () => {
    if (!session || isGeneratingMap) return;
    if (!session.fullName || !session.birthDate) {
      alert('Para simular o pagamento, primeiro informe o seu Nome Completo e Data de Nascimento na conversa com o Kael.');
      return;
    }

    setIsGeneratingMap(true);
    setError(null);

    try {
      const res = await fetch('/api/kael/confirm-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setSession(data.session);
      } else {
        setError(data.error || 'Erro ao processar simulação de pagamento.');
      }
    } catch (err) {
      console.error('Erro ao simular pagamento:', err);
      setError('Erro de comunicação com o servidor durante a geração do mapa.');
    } finally {
      setIsGeneratingMap(false);
    }
  };

  const handleResetSession = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const newSid = `kael-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const res = await fetch('/api/kael/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldSessionId: sessionId, newSessionId: newSid })
      });
      const data = await res.json();
      if (res.ok && data.success && data.session) {
        setSessionId(data.session.sessionId);
        localStorage.setItem('kael_session_id', data.session.sessionId);
        setSession(data.session);
        setInputMessage('');
        setError(null);
      } else {
        setError(data.error || 'Erro ao reiniciar a conversa.');
      }
    } catch (err) {
      console.error('Erro ao resetar:', err);
      setError('Falha de comunicação ao reiniciar o chat.');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper para formatação de estado em texto amigável
  const getStateBadge = (state?: KaelState) => {
    switch (state) {
      case 'AGUARDANDO_NOME_DATA':
        return { label: 'Coletando Nome/Data', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
      case 'DADOS_RECEBIDOS':
      case 'CONFIRMACAO_DOS_DADOS':
        return { label: 'Confirmação dos Dados', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40' };
      case 'AGUARDANDO_PAGAMENTO':
        return { label: 'Aguardando PIX (R$ 15,00)', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40' };
      case 'PAGAMENTO_CONFIRMADO':
      case 'MAPA_EM_PROCESSAMENTO':
        return { label: 'Elaborando Mapa IA...', color: 'bg-purple-500/20 text-purple-300 border-purple-500/40' };
      case 'PDF_PRONTO':
      case 'POS_VENDA':
        return { label: 'PDF Entregue com Sucesso', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
      case 'CONVERSA_ENCERRADA':
        return { label: 'Atendimento Encerrado', color: 'bg-slate-700/50 text-slate-400 border-slate-600' };
      default:
        return { label: 'Atendimento Inicial', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
    }
  };

  const badge = getStateBadge(session?.currentState);

  return (
    <div className="max-w-4xl mx-auto my-6 px-3 sm:px-6">
      {/* Cabeçalho do Card */}
      <div className="bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/60 border border-amber-500/30 rounded-2xl p-4 sm:p-5 mb-4 shadow-2xl backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-400 flex items-center justify-center text-slate-950 font-bold text-lg shadow-lg shadow-amber-500/20 ring-2 ring-amber-400/40">
              K
            </div>
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full" title="Online no WhatsApp"></span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-amber-200 tracking-wide font-serif">Kael</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-sans tracking-normal">
                Atendente Virtual
              </span>
            </div>
            <p className="text-xs text-slate-300 flex items-center gap-1.5 mt-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              Atendimento Especializado em Numerologia Cabalística
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          <span className={`text-xs px-3 py-1 rounded-full border font-medium ${badge.color}`}>
            {badge.label}
          </span>
          <button
            onClick={handleResetSession}
            title="Reiniciar Sessão do Kael"
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-amber-300 transition-colors text-xs flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reiniciar Chat</span>
          </button>
        </div>
      </div>

      {/* Painel de Dados Coletados & Inspector de Sessão */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 sm:p-4 mb-4 text-xs text-slate-300 grid grid-cols-1 sm:grid-cols-3 gap-3 shadow-md">
        <div className="flex flex-col">
          <span className="text-slate-400 text-[11px] font-medium uppercase tracking-wider">Nome Coletado:</span>
          <span className="font-semibold text-amber-200 truncate mt-0.5">
            {session?.fullName || 'Aguardando envio...'}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-slate-400 text-[11px] font-medium uppercase tracking-wider">Data de Nascimento:</span>
          <span className="font-semibold text-amber-200 truncate mt-0.5">
            {session?.birthDate ? session.birthDate.split('-').reverse().join('/') : 'Aguardando envio...'}
          </span>
        </div>
        <div className="flex flex-col justify-center">
          {session?.currentState === 'AGUARDANDO_PAGAMENTO' && (
            <button
              onClick={handleSimulatePayment}
              disabled={isGeneratingMap}
              className="w-full py-2 px-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-lg shadow-md shadow-emerald-900/30 transition-all flex items-center justify-center gap-1.5 text-xs border border-emerald-400/30 disabled:opacity-50"
            >
              {isGeneratingMap ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Gerando Mapa & PDF...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
                  <span>Simular Confirmação do PIX (TESTE)</span>
                </>
              )}
            </button>
          )}

          {session?.paymentStatus === 'pago' && session.pdfUrl && (
            <a
              href={session.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2 px-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold rounded-lg shadow-md hover:brightness-110 transition-all flex items-center justify-center gap-1.5 text-xs"
            >
              <FileDown className="w-4 h-4" />
              <span>Baixar Mapa PDF Completo</span>
            </a>
          )}

          {session?.currentState !== 'AGUARDANDO_PAGAMENTO' && session?.paymentStatus !== 'pago' && (
            <span className="text-slate-400 text-[11px]">
              Preço Fixo: <strong className="text-amber-400">R$ 15,00</strong>
            </span>
          )}
        </div>
      </div>

      {error && (
        <div className="p-3 mb-4 bg-red-950/80 border border-red-800 text-red-200 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Janela de Chat estilo WhatsApp */}
      <div className="bg-slate-950/90 border border-amber-900/30 rounded-2xl shadow-2xl flex flex-col h-[520px] overflow-hidden backdrop-blur-lg relative">
        {/* Marca d'água sutil de fundo */}
        <div className="absolute inset-0 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:24px_24px] opacity-5 pointer-events-none"></div>

        {/* Corpo de Mensagens */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5 relative z-10 custom-scrollbar">
          {session?.messages.map((msg) => {
            const isKael = msg.sender === 'kael';
            const isSystem = msg.sender === 'system';

            if (isSystem) {
              return (
                <div key={msg.id} className="flex justify-center my-2">
                  <span className="text-[11px] px-3 py-1 bg-slate-900 border border-slate-800 text-slate-400 rounded-full">
                    {msg.text}
                  </span>
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isKael ? 'items-start' : 'items-end'}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3.5 shadow-md text-sm leading-relaxed whitespace-pre-wrap ${
                    isKael
                      ? 'bg-gradient-to-br from-slate-900 via-slate-900/95 to-amber-950/40 text-slate-100 border border-amber-500/20 rounded-tl-none'
                      : 'bg-gradient-to-br from-amber-600 to-amber-700 text-white rounded-tr-none font-medium shadow-amber-900/20'
                  }`}
                >
                  {/* Nome do emissor */}
                  <div className="text-[10px] font-bold mb-1 opacity-70 flex items-center gap-1">
                    {isKael ? (
                      <>
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        <span className="text-amber-300 font-serif">Kael</span>
                      </>
                    ) : (
                      <>
                        <User className="w-3 h-3" />
                        <span>Você</span>
                      </>
                    )}
                  </div>

                  {/* Texto da mensagem */}
                  <div>{msg.text}</div>

                  {/* Botão especial de download do PDF na mensagem do Kael */}
                  {msg.pdfUrl && (
                    <div className="mt-3 pt-2.5 border-t border-amber-500/20 flex flex-col gap-2">
                      <a
                        href={msg.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold rounded-xl shadow-lg hover:brightness-110 transition-all text-xs"
                      >
                        <FileDown className="w-4 h-4" />
                        <span>Baixar Seu Mapa em PDF</span>
                      </a>
                    </div>
                  )}

                  {/* Horário da mensagem */}
                  <div className={`text-[10px] mt-1.5 text-right ${isKael ? 'text-slate-400' : 'text-amber-100/80'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Indicador de Digitação do Kael */}
          {(isLoading || isGeneratingMap) && (
            <div className="flex items-start gap-2">
              <div className="bg-slate-900 border border-amber-500/20 rounded-2xl rounded-tl-none p-3 shadow-md flex items-center gap-2">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce"></span>
                </div>
                <span className="text-xs text-amber-200/80 font-serif">
                  {isGeneratingMap ? 'Kael está elaborando o seu Mapa Cabalístico...' : 'Kael está digitando...'}
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Rodapé e Barra de Digitação */}
        <form
          onSubmit={handleSendMessage}
          className="p-3 bg-slate-900/90 border-t border-slate-800 flex items-center gap-2 relative z-10"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={isLoading || isGeneratingMap || session?.currentState === 'CONVERSA_ENCERRADA'}
            placeholder={
              session?.currentState === 'CONVERSA_ENCERRADA'
                ? 'Digite "Quero o mapa" para retomar a conversa...'
                : 'Digite sua mensagem ou dados...'
            }
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/60 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading || isGeneratingMap}
            className="p-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-md disabled:opacity-40 disabled:pointer-events-none"
            title="Enviar mensagem"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Nota de Arquitetura em Rodapé */}
      <div className="mt-3 text-center text-[11px] text-slate-400">
        ✨ O Kael é um módulo de atendimento integrado. O mapa numerológico é gerado pelo motor cabalístico original do projeto.
      </div>
    </div>
  );
}
