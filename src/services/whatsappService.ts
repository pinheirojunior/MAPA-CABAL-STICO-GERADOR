/**
 * Serviço de Integração com WhatsApp (WhatsApp Business Platform / Cloud API)
 * Estruturado para permitir disparo futuro de mensagens de texto e envio de PDFs
 * sem acoplar a lógica de mensageria à lógica de pagamentos e cálculos.
 */

export interface WhatsAppMessagePayload {
  toPhone: string;
  text: string;
}

export interface WhatsAppDocumentPayload {
  toPhone: string;
  documentUrl: string;
  fileName: string;
  caption?: string;
}

/**
 * Envia uma mensagem de texto via WhatsApp (estruturado para futura conexão com Meta Cloud API / Baileys)
 */
export async function sendWhatsAppMessage(payload: WhatsAppMessagePayload): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const cleanPhone = payload.toPhone.replace(/\D/g, '');
    if (!cleanPhone) {
      return { success: false, error: 'Telefone inválido para envio de WhatsApp.' };
    }

    // Ponto de extensão para chave de API do WhatsApp (ex: WHATSAPP_API_TOKEN, WHATSAPP_PHONE_ID)
    const token = process.env.WHATSAPP_API_TOKEN;
    if (!token) {
      console.log(`[WHATSAPP-STUB] Mensagem preparada para ${cleanPhone}: "${payload.text.substring(0, 50)}..." (serviço aguardando configuração do token)`);
      return { success: true, messageId: `msg-stub-${Date.now()}` };
    }

    // Futura chamada real para Graph API do WhatsApp
    return { success: true, messageId: `wa-${Date.now()}` };
  } catch (err: any) {
    console.error('Erro ao enviar mensagem WhatsApp:', err);
    return { success: false, error: err?.message || 'Erro no envio de mensagem WhatsApp' };
  }
}

/**
 * Envia um arquivo PDF do Mapa Cabalístico via WhatsApp
 */
export async function sendWhatsAppDocument(payload: WhatsAppDocumentPayload): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const cleanPhone = payload.toPhone.replace(/\D/g, '');
    if (!cleanPhone) {
      return { success: false, error: 'Telefone inválido para envio de WhatsApp.' };
    }

    const token = process.env.WHATSAPP_API_TOKEN;
    if (!token) {
      console.log(`[WHATSAPP-STUB] Documento PDF (${payload.fileName}) preparado para envio ao número ${cleanPhone}`);
      return { success: true, messageId: `doc-stub-${Date.now()}` };
    }

    return { success: true, messageId: `wa-doc-${Date.now()}` };
  } catch (err: any) {
    console.error('Erro ao enviar documento WhatsApp:', err);
    return { success: false, error: err?.message || 'Erro no envio de documento WhatsApp' };
  }
}
