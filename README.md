# Mapa Cabalístico Personalizado — MVP Funcional

Este é um MVP (Produto Mínimo Viável) completo para a venda de **Mapas Cabalísticos Personalizados em PDF** com valor promocional de **R$ 15,00**.

O projeto foi construído para ser simples, performático, com custo próximo de zero e de fácil manutenção, sem dependências desnecessárias ou arquitetura super-dimensionada.

---

## 🚀 Estrutura do Projeto

```text
mapa-cabalistico-mvp/
├── package.json               # Dependências e scripts do Node.js
├── server.ts                  # Servidor Express com APIs e geração de PDF
├── README.md                  # Manual completo de instrução e evolução
├── .env.example               # Exemplo de variáveis de ambiente
├── .gitignore                 # Arquivos ignorados pelo Git
│
├── data/
│   ├── orders.json            # Armazenamento simples em JSON para os pedidos
│   └── pdfs/                  # Diretório onde os arquivos PDF são salvos
│
└── src/
    ├── App.tsx                # Componente principal do Frontend
    ├── index.css              # Estilos Tailwind e tema místico escuro/dourado
    ├── types.ts               # Interfaces TypeScript para pedidos e mapas
    ├── utils/
    │   ├── cabalisticMap.ts   # Função organizada generateMapData(name, birthDate)
    │   └── pdfGenerator.ts    # Gerador de PDF visual com PDFKit
    └── components/
        ├── Header.tsx         # Cabeçalho responsivo místico
        ├── Hero.tsx           # Seção principal com chamada, preços e botão
        ├── Benefits.tsx       # 3 Cards com os benefícios do mapa
        ├── OrderForm.tsx      # Formulário de entrada (Nome e Data)
        ├── PixPaymentModal.tsx# Tela de pagamento PIX e simulação de aprovação
        ├── OrderResult.tsx    # Resultado do mapa, download do PDF e resumo
        ├── AiChatSection.tsx  # Chat interativo de IA sobre o mapa
        └── Footer.tsx         # Rodapé institucional
```

---

## 🛠️ Passo a Passo para Execução Local

### 1. Como instalar o Node.js
Se você ainda não tem o Node.js instalado no seu computador:
1. Acesse o site oficial: [https://nodejs.org/](https://nodejs.org/)
2. Baixe a versão **LTS** (recomendada para a maioria dos usuários).
3. Execute o instalador baixado e siga o assistente padrão ("Avançar" -> "Avançar" -> "Concluir").

### 2. Como abrir o terminal
* **Windows**: Pressione a tecla `Windows`, digite `cmd` ou `PowerShell` e pressione `Enter`. Ou clique com o botão direito na pasta do projeto e selecione *"Abrir no Terminal"*.
* **macOS**: Pressione `Cmd + Espaço`, digite `Terminal` e pressione `Enter`.
* **Linux**: Pressione `Ctrl + Alt + T`.

### 3. Como executar o projeto

Navegue até a pasta do projeto no terminal e execute:

```bash
# 1. Instalar todas as dependências do projeto
npm install

# 2. Iniciar o servidor em modo de desenvolvimento
npm run dev
```

*Para rodar em modo de produção:*
```bash
npm run build
npm start
```

### 4. Como acessar o aplicativo
Abra o navegador de sua preferência (Chrome, Edge, Firefox, Safari) e acesse:

👉 **[http://localhost:3000](http://localhost:3000)**

---

## 🧪 Como Testar um Pedido e Gerar o PDF

1. Acesse `http://localhost:3000`.
2. No formulário principal, informe o **Nome Completo** e a **Data de Nascimento**.
3. Clique em **"Continuar — R$15"**.
4. O sistema irá gerar um pedido único (exemplo: `MC-A1B2C3`) com status inicial `aguardando_pagamento` e salvar em `data/orders.json`.
5. Na área de pagamento PIX, clique no botão verde **"Simular pagamento aprovado"**.
6. O servidor irá:
   * Mudar o status do pedido para `"pago"`;
   * Executar a função `generateMapData(name, birthDate)`;
   * Criar o documento em PDF estilizado usando PDFKit em `data/pdfs/mapa-MC-XXXXXX.pdf`;
   * Disponibilizar o botão **"Baixar Mapa Cabalístico (PDF)"** para download e abrir a área de leitura e o chat de IA.

---

## 🔑 Onde Substituir a Chave PIX

No arquivo **`src/components/PixPaymentModal.tsx`**, localize a linha 18:

```typescript
const pixKey = "COLOQUE_AQUI_SUA_CHAVE_PIX";
```

Substitua `"COLOQUE_AQUI_SUA_CHAVE_PIX"` pela sua chave PIX real (CPF, E-mail, Telefone ou Chave Aleatória).

---

## 🔮 Onde Futuramente Integrar Funcionalidades de Produção

### 1. Pagamento PIX Real (Gateway e Webhook)
Para automatizar a confirmação de pagamento sem simulação manual:
* No arquivo `server.ts`, crie a rota `POST /api/webhook/pix`.
* Integre com gateways brasileiros que suportam PIX barato/gratuito (Mercado Pago, Asaas, EFI Bank ou OpenPIX).
* O webhook receberá a notificação de pagamento aprovado da instituição financeira, localizará o pedido no `orders.json` (pelo ID ou txid) e chamará as funções `generateMapData` e `generateMapPDF` automaticamente.

### 2. Integração com IA para os Mapas
A estrutura já está integrada com o **Google Gemini API** (`@google/genai`) no endpoint `/api/orders/:id/chat` em `server.ts`.
Para habilitar a IA em produção, basta configurar a variável de ambiente no seu provedor de hospedagem:
```env
GEMINI_API_KEY="SUA_CHAVE_GEMINI_AQUI"
```

### 3. Envio Automático por WhatsApp
Quando você for integrar o WhatsApp (após aprovação da Meta ou usando APIs como Z-API, Evolution API ou Twilio):
* No `server.ts`, logo após o pagamento ser confirmado (`order.status = 'pago'`), chame uma função `sendWhatsAppMessage(order.phone, order.id, pdfPath)` para enviar a mensagem com a chave de confirmação e o link de download do PDF para o WhatsApp do cliente.

---

## 📄 Licença e Termos
Projeto desenvolvido para fins comerciais de MVP. Licença livre para modificação e evolução conforme crescimento do negócio.
