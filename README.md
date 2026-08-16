# Mapa Cabalístico Personalizado & Kael — Integração Oficial Asaas (PIX Real)

Sistema completo e profissional de atendimento guiado pelo **Kael**, cálculo numerológico cabalístico avançado, geração editorial de **Mapas em PDF de Alta Qualidade** e cobrança automatizada via **PIX Real com a API do Asaas**.

---

## 🚀 Novidades da Integração Oficial Asaas

- **Cobrança Real via PIX**: Geração dinâmica de QR Code e código PIX Copia e Cola diretamente pela API oficial do Asaas (Sandbox e Produção).
- **Preço Oficial**: R$ 14,90 (tratado internamente como `14.90` / `1490` centavos).
- **Webhook Automatizado com Idempotência**: Endpoint `/api/webhooks/asaas` para processamento seguro de pagamentos com prevenção total de cobranças ou gerações de PDF duplicadas.
- **Validação de Token do Webhook**: Verificação do header `asaas-access-token` para assegurar que apenas requisições autênticas do Asaas sejam aceitas.
- **Detecção em Tempo Real (Polling)**: O chat do Kael e a tela de pagamento monitoram o status do pedido em tempo real, liberando o PDF imediatamente quando o banco confirma o PIX.
- **Forward-Compatibility com WhatsApp**: Módulo desacoplado pronto para envio automático de PDFs e mensagens aos clientes.

---

## ⚙️ Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto (baseando-se no `.env.example`):

```env
# Ambiente do Asaas ("sandbox" para testes ou "production" para cobranças reais)
ASAAS_ENV=sandbox

# Chave de API gerada no painel do Asaas (iniciada com $aact_...)
ASAAS_API_KEY=$aact_YTU5YTE0M2M6OT...

# Token de autenticação da fila de webhook do Asaas (definido no painel de Webhooks)
ASAAS_WEBHOOK_TOKEN=meu_token_secreto_webhook_123

# Chave do Gemini AI (opcional para chat místico)
GEMINI_API_KEY=sua_chave_gemini
```

---

## 🛠️ Configurando o Webhook no Asaas

1. Acesse o painel do Asaas:
   - **Sandbox**: [https://sandbox.asaas.com](https://sandbox.asaas.com)
   - **Produção**: [https://www.asaas.com](https://www.asaas.com)
2. Vá em **Configurações da Conta** > **Integrações** > **Webhooks** (ou **Configurações** > **Webhooks de Cobrança**).
3. Cadastre uma nova URL de Webhook:
   - **URL**: `https://seu-dominio.com/api/webhooks/asaas` (em desenvolvimento local, use ngrok ou a URL do Cloud Run).
   - **Versão da API**: `v3`
   - **Token de Autenticação**: Defina uma senha/token secreto e coloque o mesmo valor na variável `ASAAS_WEBHOOK_TOKEN`.
   - **Eventos selecionados**:
     - `Cobrança recebida` (`PAYMENT_RECEIVED`)
     - `Cobrança confirmada` (`PAYMENT_CONFIRMED`)
     - `Cobrança vencida` (`PAYMENT_OVERDUE`)
     - `Cobrança removida` (`PAYMENT_DELETED`)
4. Ative a fila de webhook.

---

## 🧪 Como Testar o Fluxo PIX Completo no Sandbox

1. Defina `ASAAS_ENV=sandbox` e informe sua `ASAAS_API_KEY` do Sandbox no `.env`.
2. Inicie o servidor:
   ```bash
   npm run dev
   ```
3. Abra `http://localhost:3000` e converse com o **Kael**:
   - Responda as perguntas de nome completo e data de nascimento.
   - Clique em **"QUERO FAZER MEU MAPA"** e depois em **"Quero pagar"**.
   - O Kael gerará o QR Code e o código PIX Copia e Cola real do Sandbox do Asaas.
4. No painel Sandbox do Asaas, localize a cobrança em **Cobranças** e clique em **"Confirmar recebimento em dinheiro/PIX"** (simulador de pagamento).
5. O Asaas disparará o Webhook para `/api/webhooks/asaas`:
   - O servidor valida o valor de R$ 14,90;
   - O servidor verifica a idempotência do evento;
   - O motor gera os cálculos numerológicos e compila o PDF editorial de alta qualidade;
   - O Kael atualiza automaticamente a conversa na tela do usuário entregando o link de download do PDF!

---

## 📁 Estrutura do Código

```text
├── server.ts                       # Servidor Express com APIs do Kael, Asaas e Webhooks
├── src/
│   ├── services/
│   │   ├── asaasService.ts         # Integração oficial com a API v3 do Asaas (PIX + Clientes)
│   │   ├── whatsappService.ts      # Módulo desacoplado para notificações WhatsApp
│   │   ├── kaelService.ts          # Motor de diálogo e NLU determinístico do Kael
│   │   ├── mapBuilder.ts           # Montagem e cálculo numerológico cabalístico
│   │   └── textGenerator.ts        # Interpretação dos números cabalísticos
│   ├── components/
│   │   ├── KaelChat.tsx            # Chat interativo do Kael com QR Code Asaas e Polling
│   │   ├── PixPaymentModal.tsx     # Modal de pagamento PIX com QR Code e Polling
│   │   ├── OrderForm.tsx           # Formulário direto de pedidos
│   │   └── OrderResult.tsx         # Exibição do mapa e download do PDF
│   ├── numerology/                 # Algoritmos de cálculo de Gematria e Redução
│   ├── pdf/                        # Renderizador editorial em PDF com PDFKit
│   └── types/                      # Interfaces TypeScript tipadas para Kael e Asaas
└── data/
    ├── orders.json                 # Registro persistente de pedidos
    ├── kael_sessions.json          # Sessões de conversa e histórico do Kael
    └── processed_webhook_events.json # Log de eventos para garantia de 100% Idempotência
```

---

## 🔒 Segurança e Boas Práticas

- **Segurança de Chaves**: `ASAAS_API_KEY` e `ASAAS_WEBHOOK_TOKEN` ficam restritas ao servidor (`server.ts` e `asaasService.ts`) e nunca são enviadas ao navegador.
- **Idempotência**: Todos os eventos recebidos no webhook são registrados em `processed_webhook_events.json`. Repetições do Asaas são respondidas com `200 OK` imediatamente sem reprocessar cálculos nem gerar novos PDFs.
- **Integridade de Preço**: O valor de R$ 14,90 é fixado e validado no backend antes de qualquer liberação de mapa.
