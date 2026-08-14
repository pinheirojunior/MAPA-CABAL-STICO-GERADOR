import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, RefreshCw, CheckCircle2, FileDown, Sparkles, User, ShieldCheck, AlertCircle, Copy, Check, QrCode, Settings } from 'lucide-react';
import QRCode from 'qrcode';
import { KaelSession, KaelMessage, KaelState, KaelOption } from '../types/kael';

export const OFFICIAL_PIX_CODE = '00020101021126580014br.gov.bcb.pix01360efa1471-55ad-4ce9-9f7a-6cd5d173525c5204000053039865802BR5913JOSE P JUNIOR6009FORTALEZA62070503***6304F837';

interface KaelChatProps {
  onClose?: () => void;
  onOpenPixAdmin?: () => void;
}

export function KaelChat({ onClose, onOpenPixAdmin }: KaelChatProps) {
  const [sessionId, setSessionId] = useState<string>(() => {
    return localStorage.getItem('kael_session_id') || `kael-${Date.now()}`;
  });
  const [session, setSession] = useState<KaelSession | null>(null);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingMap, setIsGeneratingMap] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pixKey, setPixKey] = useState<string>(OFFICIAL_PIX_CODE);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Carrega ou inicializa a sessão do Kael ao montar
  useEffect(() => {
    localStorage.setItem('kael_session_id', sessionId);
    loadSession(sessionId);
    fetchPixConfig();
  }, [sessionId]);

  // Gera o QR Code com alta resolução e nitidez
  useEffect(() => {
    const code = pixKey || OFFICIAL_PIX_CODE;
    QRCode.toDataURL(code, {
      width: 400,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    })
      .then(url => setQrCodeDataUrl(url))
      .catch(err => console.error('Erro ao gerar QR Code PIX:', err));
  }, [pixKey]);

  // Scroll automático para a última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session?.messages, isLoading, isGeneratingMap]);

  const fetchPixConfig = async () => {
    try {
      const res = await fetch('/api/admin/pix-config');
      const data = await res.json();
      if (data.pixKey) {
        setPixKey(data.pixKey);
      }
    } catch (err) {
      console.error('Erro ao buscar chave PIX:', err);
    }
  };

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

  const handleOptionClick = async (actionId: string, label: string) => {
    if (isLoading || isGeneratingMap || !session) return;

    if (actionId === 'SIMULATE_PAYMENT') {
      await handleSimulatePayment();
      return;
    }

    setIsLoading(true);
    setError(null);

    // Adiciona temporariamente a mensagem do usuário com o rótulo do botão
    const tempUserMsg: KaelMessage = {
      id: `temp-${Date.now()}`,
      sender: 'user',
      text: label,
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
        body: JSON.stringify({ sessionId, actionId, message: label })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setSession(data.session);
        if (data.pixKey) {
          setPixKey(data.pixKey);
        }
      } else {
        setError(data.error || 'Erro ao processar opção selecionada.');
      }
    } catch (err) {
      console.error('Erro na ação:', err);
      setError('Falha de comunicação com o servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || isLoading || isGeneratingMap || !session) return;

    const messageText = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/kael/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, message: messageText })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setSession(data.session);
        if (data.pixKey) {
          setPixKey(data.pixKey);
        }
      } else {
        setError(data.error || 'Erro ao enviar mensagem.');
      }
    } catch (err) {
      console.error('Erro no envio:', err);
      setError('Falha de comunicação com o servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSimulatePayment = async () => {
    if (isGeneratingMap || !session) return;

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
        setError(data.error || 'Erro ao simular confirmação do pagamento.');
      }
    } catch (err) {
      console.error('Erro na confirmação:', err);
      setError('Falha de comunicação ao processar o pagamento.');
    } finally {
      setIsGeneratingMap(false);
    }
  };

  const handleCopyPixKey = (keyToCopy: string) => {
    const targetCode = keyToCopy || OFFICIAL_PIX_CODE;
    navigator.clipboard.writeText(targetCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 3500);
  };

  const handleResetSession = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const newSid = `kael-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
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

  const getStateBadge = (state?: KaelState) => {
    switch (state) {
      case 'AGUARDANDO_NOME':
        return { label: 'Aguardando Nome', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
      case 'AGUARDANDO_DATA':
        return { label: 'Aguardando Data', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
      case 'CONFIRMANDO_DADOS':
        return { label: 'Confirmação dos Dados', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40' };
      case 'AGUARDANDO_PAGAMENTO':
        return { label: 'Aguardando PIX (R$ 14,90)', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40' };
      case 'PAGAMENTO_CONFIRMADO':
      case 'GERANDO_MAPA':
      case 'MAPA_EM_PROCESSAMENTO':
        return { label: 'Elaborando Mapa...', color: 'bg-purple-500/20 text-purple-300 border-purple-500/40' };
      case 'PDF_PRONTO':
      case 'POS_VENDA':
        return { label: 'PDF Entregue com Sucesso', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
      case 'CANCELADO':
        return { label: 'Fluxo Cancelado', color: 'bg-red-500/20 text-red-300 border-red-500/40' };
      default:
        return { label: 'Menu Principal', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
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
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full" title="Online"></span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-amber-200 tracking-wide font-serif">Kael</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-sans tracking-normal">
                Atendimento Guiado
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
          {onOpenPixAdmin && (
            <button
              onClick={onOpenPixAdmin}
              title="Configurar Chave PIX"
              className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:text-amber-200 transition-colors text-xs flex items-center gap-1.5"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Chave PIX</span>
            </button>
          )}
          <button
            id="btn-reset-kael-chat"
            onClick={handleResetSession}
            title="Reiniciar Sessão do Kael"
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-amber-300 transition-colors text-xs flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reiniciar Chat</span>
          </button>
        </div>
      </div>

      {/* Painel de Dados Coletados */}
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
                  <span>Simular Confirmação do PIX (R$ 14,90)</span>
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
              Preço Promocional: <strong className="text-amber-400">R$ 14,90</strong>
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

      {/* Janela de Chat */}
      <div className="bg-slate-950/90 border border-amber-900/30 rounded-2xl shadow-2xl flex flex-col h-[560px] overflow-hidden backdrop-blur-lg relative">
        <div className="absolute inset-0 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:24px_24px] opacity-5 pointer-events-none"></div>

        {/* Corpo de Mensagens */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 relative z-10 custom-scrollbar">
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

            const isPaymentMsg = isKael && (
              msg.text.includes('Pagamento via PIX') ||
              msg.text.includes('escanear o QR Code') ||
              msg.text.includes('Para realizar o pagamento:') ||
              (msg.options && msg.options.some(o => o.label === '← Voltar'))
            );

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isKael ? 'items-start' : 'items-end'}`}
              >
                <div
                  className={`max-w-[90%] sm:max-w-[80%] rounded-2xl p-4 shadow-md text-sm leading-relaxed whitespace-pre-wrap ${
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

                  {/* Renderização Especial da Tela de Pagamento ou Texto Normal */}
                  {isPaymentMsg ? (
                    <div className="flex flex-col items-center text-center w-full py-1">
                      {/* 1. Título */}
                      <h3 className="text-base sm:text-lg font-bold text-amber-300 font-serif tracking-wide mb-1">
                        Pagamento via PIX
                      </h3>

                      {/* 2. Valor */}
                      <div className="text-xs sm:text-sm text-slate-300 font-medium mb-3">
                        Valor:{' '}
                        <span className="font-extrabold text-base sm:text-lg text-amber-400 font-mono ml-1">
                          R$ 14,90
                        </span>
                      </div>

                      {/* 3. QR Code: Centralizado, Grande, Nítido, Sem distorção */}
                      <div className="p-3 bg-white rounded-2xl shadow-xl border-2 border-amber-500/40 my-1 inline-flex items-center justify-center">
                        {qrCodeDataUrl ? (
                          <img
                            src={qrCodeDataUrl}
                            alt="QR Code PIX R$ 14,90"
                            className="w-48 h-48 sm:w-56 sm:h-56 object-contain rounded-xl select-none"
                          />
                        ) : (
                          <div className="w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center bg-slate-50 rounded-xl">
                            <QrCode className="w-16 h-16 text-slate-800 animate-pulse" />
                          </div>
                        )}
                      </div>

                      {/* 4. Texto */}
                      <p className="text-xs text-slate-200 font-medium mt-3.5 mb-3 flex items-center justify-center gap-1.5">
                        <QrCode className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>Escaneie o QR Code no aplicativo do seu banco</span>
                      </p>

                      {/* 5. Botão Copiar PIX */}
                      <button
                        onClick={() => handleCopyPixKey(pixKey || OFFICIAL_PIX_CODE)}
                        className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer ${
                          copied
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400'
                            : 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 hover:shadow-amber-500/20'
                        }`}
                        title="Copiar código PIX Copia e Cola"
                      >
                        {copied ? (
                          <>
                            <Check className="w-4 h-4 text-white stroke-[3]" />
                            <span className="font-extrabold tracking-wide">PIX copiado com sucesso!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 text-slate-950" />
                            <span>📋 Copiar PIX</span>
                          </>
                        )}
                      </button>

                      {/* Mensagem de confirmação ao copiar */}
                      {copied && (
                        <div className="mt-2 text-xs font-semibold text-emerald-300 bg-emerald-950/80 border border-emerald-500/40 px-3 py-1.5 rounded-lg flex items-center justify-center gap-1.5 shadow-sm animate-fade-in w-full">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>PIX copiado com sucesso!</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Texto padrão da mensagem */
                    <div>{msg.text}</div>
                  )}

                  {/* Botões de Opções e Download do PDF acoplados à mensagem do Kael */}
                  {isKael && (msg.pdfUrl || (msg.options && msg.options.length > 0)) && (
                    <div className="mt-3 pt-3 border-t border-amber-500/20 flex flex-col gap-2">
                      {/* 1. Botão de download do PDF (se houver, aparece em primeiro lugar) */}
                      {msg.pdfUrl && (
                        <a
                          href={msg.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold rounded-xl shadow-lg hover:brightness-110 transition-all text-xs"
                        >
                          <FileDown className="w-4 h-4" />
                          <span>Baixar Seu Mapa em PDF</span>
                        </a>
                      )}

                      {/* 2 e 3. Botões de Opções (ex: "← Voltar", "QUERO FAZER MEU MAPA", etc.) */}
                      {msg.options && msg.options.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => handleOptionClick(opt.id, opt.label)}
                          disabled={isLoading || isGeneratingMap}
                          className="w-full text-left px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-200 font-medium text-xs transition-all flex items-center justify-between hover:border-amber-400 disabled:opacity-50 cursor-pointer active:scale-[0.99]"
                        >
                          <span>{opt.label}</span>
                          <span className="text-amber-400 text-xs">→</span>
                        </button>
                      ))}
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

          {/* Indicador de Digitação */}
          {(isLoading || isGeneratingMap) && (
            <div className="flex items-start gap-2">
              <div className="bg-slate-900 border border-amber-500/20 rounded-2xl rounded-tl-none p-3 shadow-md flex items-center gap-2">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce"></span>
                </div>
                <span className="text-xs text-amber-200/80 font-serif">
                  {isGeneratingMap ? 'Kael está elaborando o seu Mapa Cabalístico...' : 'Aguarde...'}
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Rodapé e Entrada de Texto */}
        <div className="bg-slate-900/90 border-t border-slate-800 p-3 relative z-10 flex flex-col gap-2">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={isLoading || isGeneratingMap}
              placeholder={
                session?.currentState === 'AGUARDANDO_NOME'
                  ? 'Digite seu nome completo de nascimento...'
                  : session?.currentState === 'AGUARDANDO_DATA'
                  ? 'Digite sua data de nascimento (ex: 20/03/1990)...'
                  : 'Digite sua mensagem ou escolha uma opção acima...'
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
      </div>

      <div className="mt-3 text-center text-[11px] text-slate-400">
        O Kael é um fluxo guiado e determinístico. Seu mapa numerológico é gerado pelo motor cabalístico original do projeto.
      </div>
    </div>
  );
}
