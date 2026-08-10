import React, { useState } from 'react';
import { Send, Bot, User, Sparkles, Loader2, MessageSquare } from 'lucide-react';
import { Order, ChatMessage } from '../types';

interface AiChatSectionProps {
  order: Order;
}

export const AiChatSection: React.FC<AiChatSectionProps> = ({ order }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'ia',
      text: `Saudações, ${order.name}! Eu sou o Oráculo de IA do seu Mapa Cabalístico. Analisei os seus números (Destino ${order.map?.numbers.destino}, Expressão ${order.map?.numbers.expressao}, Alma ${order.map?.numbers.alma}). O que gostaria de perguntar sobre os seus caminhos ou desafios?`,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || loading) return;

    const userMsg = inputText.trim();
    setInputText('');

    const time = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    setMessages((prev) => [...prev, { sender: 'user', text: userMsg, timestamp: time }]);
    setLoading(true);

    try {
      const response = await fetch(`/api/orders/${order.id}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg })
      });

      const data = await response.json();
      const replyText = data.reply || 'Erro ao obter resposta da IA.';

      setMessages((prev) => [
        ...prev,
        {
          sender: 'ia',
          text: replyText,
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ia',
          text: 'Ocorreu um erro ao conectar ao Oráculo. Tente novamente em instantes.',
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#130f26] border border-purple-800/60 rounded-2xl p-4 sm:p-6 shadow-xl mt-8">
      <div className="flex items-center gap-3 border-b border-purple-900/60 pb-4 mb-4">
        <div className="w-10 h-10 rounded-xl bg-purple-900/80 border border-amber-500/40 flex items-center justify-center shrink-0">
          <Bot className="w-6 h-6 text-amber-400" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>Conversar com a IA sobre o seu Mapa</span>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full flex items-center gap-1 font-normal">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Gemini AI
            </span>
          </h3>
          <p className="text-xs text-slate-300">
            Tire dúvidas personalizadas sobre sua vida, profissão e relacionamentos com base nos seus números.
          </p>
        </div>
      </div>

      {/* Area de mensagens */}
      <div className="space-y-3.5 max-h-80 overflow-y-auto pr-1 mb-4 scrollbar-thin">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex items-start gap-2.5 ${
              msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                msg.sender === 'user'
                  ? 'bg-amber-500 text-slate-950 font-bold text-xs'
                  : 'bg-purple-900 text-amber-300 border border-amber-500/30'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-amber-500/20 border border-amber-500/40 text-amber-100 rounded-tr-none'
                  : 'bg-[#0d0b18] border border-purple-800/50 text-slate-200 rounded-tl-none'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.text}</p>
              <span className="block text-[9px] text-slate-400 text-right mt-1 font-mono">
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-purple-300 bg-[#0d0b18] p-3 rounded-xl border border-purple-900/40 w-max">
            <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
            <span>Consultando a sabedoria da Gematria...</span>
          </div>
        )}
      </div>

      {/* Form Input Chat */}
      <form onSubmit={handleSendMessage} className="flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ex: O que meu Número de Destino significa para minha carreira?"
          className="flex-1 bg-[#0d0b18] border border-purple-800/60 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || loading}
          className="bg-amber-500 hover:bg-amber-400 text-[#0d0b18] font-bold px-4 py-2.5 rounded-xl transition-colors flex items-center justify-center shrink-0 disabled:opacity-50 cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
