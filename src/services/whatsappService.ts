import axios from 'axios';

// Configurações do WhatsApp Business API
interface WhatsAppConfig {
  phoneNumberId: string;
  accessToken: string;
  webhookVerifyToken: string;
  businessAccountId: string;
}

interface WhatsAppMessage {
  to: string;
  text: string;
  template?: string;
  templateParams?: string[];
}

interface WhatsAppResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

// Classe para gerenciar a integração com WhatsApp
export class WhatsAppService {
  private config: WhatsAppConfig;
  private baseUrl = 'https://graph.facebook.com/v18.0';

  constructor(config: WhatsAppConfig) {
    this.config = config;
  }

  // Enviar mensagem de texto simples
  async sendTextMessage(to: string, text: string): Promise<WhatsAppResponse> {
    try {
      const url = `${this.baseUrl}/${this.config.phoneNumberId}/messages`;
      
      const payload = {
        messaging_product: 'whatsapp',
        to: this.formatPhoneNumber(to),
        type: 'text',
        text: {
          body: text
        }
      };

      const response = await axios.post(url, payload, {
        headers: {
          'Authorization': `Bearer ${this.config.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        messageId: response.data.messages[0].id
      };

    } catch (error: any) {
      console.error('Erro ao enviar mensagem WhatsApp:', error);
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Erro desconhecido'
      };
    }
  }

  // Enviar mensagem usando template aprovado
  async sendTemplateMessage(
    to: string, 
    templateName: string, 
    params: string[] = []
  ): Promise<WhatsAppResponse> {
    try {
      const url = `${this.baseUrl}/${this.config.phoneNumberId}/messages`;
      
      const payload = {
        messaging_product: 'whatsapp',
        to: this.formatPhoneNumber(to),
        type: 'template',
        template: {
          name: templateName,
          language: {
            code: 'pt_BR'
          },
          components: params.length > 0 ? [{
            type: 'body',
            parameters: params.map(param => ({
              type: 'text',
              text: param
            }))
          }] : []
        }
      };

      const response = await axios.post(url, payload, {
        headers: {
          'Authorization': `Bearer ${this.config.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        messageId: response.data.messages[0].id
      };

    } catch (error: any) {
      console.error('Erro ao enviar template WhatsApp:', error);
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Erro desconhecido'
      };
    }
  }

  // Enviar mensagens em massa
  async sendBulkMessages(messages: WhatsAppMessage[]): Promise<{
    success: number;
    failed: number;
    results: WhatsAppResponse[];
  }> {
    const results: WhatsAppResponse[] = [];
    let success = 0;
    let failed = 0;

    for (const message of messages) {
      try {
        // Delay entre mensagens para evitar rate limit
        await new Promise(resolve => setTimeout(resolve, 1000));

        let result: WhatsAppResponse;
        
        if (message.template && message.templateParams) {
          result = await this.sendTemplateMessage(
            message.to, 
            message.template, 
            message.templateParams
          );
        } else {
          result = await this.sendTextMessage(message.to, message.text);
        }

        results.push(result);
        
        if (result.success) {
          success++;
        } else {
          failed++;
        }

      } catch (error) {
        results.push({
          success: false,
          error: 'Erro interno no envio'
        });
        failed++;
      }
    }

    return { success, failed, results };
  }

  // Verificar status de uma mensagem
  async getMessageStatus(messageId: string): Promise<{
    status: 'sent' | 'delivered' | 'read' | 'failed';
    timestamp: string;
  } | null> {
    try {
      const url = `${this.baseUrl}/${messageId}`;
      
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${this.config.accessToken}`
        }
      });

      return {
        status: response.data.status,
        timestamp: response.data.timestamp
      };

    } catch (error) {
      console.error('Erro ao verificar status da mensagem:', error);
      return null;
    }
  }

  // Formatar número de telefone para WhatsApp
  private formatPhoneNumber(phone: string): string {
    // Remove todos os caracteres não numéricos
    const cleaned = phone.replace(/\D/g, '');
    
    // Se não começa com código do país, adiciona 55 (Brasil)
    if (!cleaned.startsWith('55')) {
      return `55${cleaned}`;
    }
    
    return cleaned;
  }

  // Validar número de telefone
  static validatePhoneNumber(phone: string): boolean {
    const cleaned = phone.replace(/\D/g, '');
    
    // Número brasileiro deve ter 11 dígitos + código do país (55)
    if (cleaned.startsWith('55')) {
      return cleaned.length === 13; // 55 + 11 dígitos
    }
    
    // Número local deve ter 10 ou 11 dígitos
    return cleaned.length === 10 || cleaned.length === 11;
  }

  // Gerar URL para abrir WhatsApp Web
  static generateWhatsAppWebUrl(phone: string, message?: string): string {
    const formattedPhone = phone.replace(/\D/g, '');
    const encodedMessage = message ? encodeURIComponent(message) : '';
    
    return `https://wa.me/${formattedPhone}${encodedMessage ? `?text=${encodedMessage}` : ''}`;
  }

  // Gerar QR Code para WhatsApp
  static generateQRCode(phone: string, message: string): string {
    const url = this.generateWhatsAppWebUrl(phone, message);
    return url; // Será usado com biblioteca QR Code
  }
}

// Templates padrão para a igreja
export const churchTemplates = {
  welcome: {
    name: 'welcome_visitor',
    text: 'Olá {{1}}! Seja bem-vindo(a) à nossa igreja. É uma alegria ter você conosco! 🙏',
    params: ['nome']
  },
  
  visit_schedule: {
    name: 'visit_schedule',
    text: 'Olá {{1}}! Gostaríamos de agendar uma visita pastoral. Você tem disponibilidade na {{2}} às {{3}}? 📅',
    params: ['nome', 'data', 'horario']
  },
  
  prayer_request: {
    name: 'prayer_request',
    text: 'Que a paz do Senhor esteja com você, {{1}}! Estamos orando por suas necessidades. Se precisar de algo, estamos aqui! 🙏💙',
    params: ['nome']
  },
  
  event_invitation: {
    name: 'event_invitation',
    text: 'Olá {{1}}! Temos um evento especial acontecendo: {{2}} no dia {{3}} às {{4}}. Venha participar conosco! 🎉',
    params: ['nome', 'evento', 'data', 'horario']
  },
  
  follow_up: {
    name: 'follow_up',
    text: 'Olá {{1}}! Como você está? Que Deus continue abençoando sua vida. Estamos aqui se precisar de oração ou conversa! 💝',
    params: ['nome']
  }
};

// Configuração padrão (será substituída pelas configurações do admin)
export const defaultWhatsAppConfig: WhatsAppConfig = {
  phoneNumberId: process.env.REACT_APP_WHATSAPP_PHONE_NUMBER_ID || '',
  accessToken: process.env.REACT_APP_WHATSAPP_ACCESS_TOKEN || '',
  webhookVerifyToken: process.env.REACT_APP_WHATSAPP_WEBHOOK_TOKEN || '',
  businessAccountId: process.env.REACT_APP_WHATSAPP_BUSINESS_ID || ''
};

// Instância global do serviço (será configurada dinamicamente)
export let whatsappService: WhatsAppService | null = null;

// Função para inicializar o serviço com configurações do banco
export const initializeWhatsAppService = (config: WhatsAppConfig) => {
  whatsappService = new WhatsAppService(config);
  return whatsappService;
};

// Hook para usar o serviço WhatsApp
export const useWhatsApp = () => {
  return {
    service: whatsappService,
    isConfigured: whatsappService !== null,
    templates: churchTemplates,
    generateWebUrl: WhatsAppService.generateWhatsAppWebUrl,
    validatePhone: WhatsAppService.validatePhoneNumber
  };
};
