// Servicio de integración con Telegram Bot
// Configuración para RifaFlash

const TELEGRAM_BOT_TOKEN = '8338989353:AAFVrhVX-8H2aCKCc1fDTVHYdmpk8ScQ3ic';
const TELEGRAM_CHAT_ID = '7850014359';

export interface PaymentNotification {
  userName: string;
  userDNI: string;
  userPhone: string;
  userCvuAlias: string;
  number: number;
  amount: number;
  paymentMethod: 'uala' | 'mercadopago';
  timestamp: Date;
}

export interface PaymentConfirmation {
  number: number;
  confirmed: boolean;
  confirmedBy?: string;
  confirmedAt?: Date;
}

// Almacenar callbacks para confirmaciones de pago
const paymentCallbacks: Map<number, (confirmed: boolean) => void> = new Map();

export const TelegramService = {
  // Enviar notificación de nuevo pago pendiente
  async notifyNewPayment(notification: PaymentNotification): Promise<boolean> {
    const message = `
🎫 *NUEVA COMPRA - RIFAFLASH* 🎫

👤 *Cliente:* ${notification.userName}
🆔 *DNI:* ${notification.userDNI}
📱 *Teléfono:* ${notification.userPhone}
💳 *CVU/Alias:* ${notification.userCvuAlias}
🔢 *Número:* #${notification.number.toString().padStart(2, '0')}
💰 *Monto:* $${notification.amount.toLocaleString()} ARS
💵 *Método:* ${notification.paymentMethod === 'uala' ? 'Ualá Bis' : 'Mercado Pago'}
⏰ *Fecha:* ${notification.timestamp.toLocaleString('es-AR')}

⚡ *Acción requerida:*
Verificar el pago y responder con:
✅ CONFIRMAR ${notification.number} - para aprobar
❌ RECHAZAR ${notification.number} - para rechazar
    `.trim();

    try {
      const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: 'Markdown'
        })
      });
      
      const data = await response.json();
      console.log('✅ Notificación enviada a Telegram:', data);
      return data.ok;
    } catch (error) {
      console.error('❌ Error enviando mensaje a Telegram:', error);
      // Fallback: mostrar en consola para demo
      console.log('📨 Mensaje que se enviaría:', message);
      return true;
    }
  },

  // Enviar notificación de sorteo cercano
  async notifyNearRaffle(remainingNumbers: number): Promise<boolean> {
    const message = `
⚠️ *SORTEO CERCANO - RIFAFLASH* ⚠️

🔥 Solo quedan *${remainingNumbers}* números disponibles!

📊 Estado actual:
• Números vendidos: ${50 - remainingNumbers}/50
• Porcentaje completado: ${((50 - remainingNumbers) / 50 * 100).toFixed(0)}%

⏰ El sorteo se realizará automáticamente al completar los 50 números.
💰 Premio: $100.000 ARS

¡Atento para el sorteo!
    `.trim();

    try {
      const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: 'Markdown'
        })
      });
      
      return response.ok;
    } catch (error) {
      console.error('Error enviando alerta de sorteo cercano:', error);
      console.log('📨 Alerta que se enviaría:', message);
      return true;
    }
  },

  // Enviar notificación de sorteo completado
  async notifyRaffleComplete(winnerName: string, winnerNumber: number, winnerDNI: string, prize: string): Promise<boolean> {
    const message = `
🏆 *SORTEO COMPLETADO - RIFAFLASH* 🏆

✅ Se vendieron los 50 números
🎉 *Ganador:* ${winnerName}
🆔 *DNI:* ${winnerDNI}
🔢 *Número ganador:* #${winnerNumber.toString().padStart(2, '0')}
💰 *Premio:* ${prize}

⚡ El premio debe ser transferido al CVU/Alias del ganador.

¡Felicitaciones al ganador! 🎊
    `.trim();

    try {
      const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: 'Markdown'
        })
      });
      
      return response.ok;
    } catch (error) {
      console.error('Error enviando notificación de sorteo:', error);
      console.log('📨 Notificación que se enviaría:', message);
      return true;
    }
  },

  // Registrar callback para cuando se confirme un pago
  onPaymentConfirmed(number: number, callback: (confirmed: boolean) => void) {
    paymentCallbacks.set(number, callback);
  },

  // Simular confirmación de pago (para demo)
  simulatePaymentConfirmation(number: number, confirmed: boolean) {
    const callback = paymentCallbacks.get(number);
    if (callback) {
      callback(confirmed);
      paymentCallbacks.delete(number);
    }
  },

  // Obtener actualizaciones del bot (para implementar en backend)
  async getUpdates(offset?: number): Promise<any[]> {
    try {
      const url = new URL(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates`);
      if (offset) url.searchParams.append('offset', offset.toString());
      
      const response = await fetch(url.toString());
      const data = await response.json();
      
      if (data.ok) {
        return data.result;
      }
      return [];
    } catch (error) {
      console.error('Error obteniendo updates:', error);
      return [];
    }
  }
};

// Hook para usar el servicio de Telegram
export function useTelegram() {
  const sendPaymentNotification = async (notification: PaymentNotification) => {
    return await TelegramService.notifyNewPayment(notification);
  };

  const sendNearRaffleNotification = async (remainingNumbers: number) => {
    return await TelegramService.notifyNearRaffle(remainingNumbers);
  };

  const sendRaffleCompleteNotification = async (winnerName: string, winnerNumber: number, winnerDNI: string, prize: string) => {
    return await TelegramService.notifyRaffleComplete(winnerName, winnerNumber, winnerDNI, prize);
  };

  return {
    sendPaymentNotification,
    sendNearRaffleNotification,
    sendRaffleCompleteNotification,
    onPaymentConfirmed: TelegramService.onPaymentConfirmed,
    simulatePaymentConfirmation: TelegramService.simulatePaymentConfirmation
  };
}