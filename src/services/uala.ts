// ============================================
// UALÁ BIS - INTEGRACIÓN DE PAGOS
// ============================================

interface UalaPaymentRequest {
  amount: number;
  description: string;
  externalReference: string;
  callbackUrl: string;
}

interface UalaPaymentResponse {
  paymentId: string;
  checkoutUrl: string;
  status: 'pending' | 'approved' | 'rejected';
}

// Configuración de Ualá Bis
const UALA_CONFIG = {
  // Estos datos los obtenés de tu cuenta de comercio Ualá
  apiKey: import.meta.env.VITE_UALA_API_KEY || '',
  apiSecret: import.meta.env.VITE_UALA_API_SECRET || '',
  baseUrl: 'https://api.uala.com.ar', // URL de producción
  // baseUrl: 'https://sandbox.api.uala.com.ar', // URL de sandbox/pruebas
};

export class UalaService {
  // Generar link de pago
  static async createPayment(
    amount: number,
    description: string,
    externalReference: string
  ): Promise<UalaPaymentResponse | null> {
    try {
      // Si no tenés API key configurada, usamos el método manual
      if (!UALA_CONFIG.apiKey) {
        console.log('Ualá API no configurada, usando método manual');
        return null;
      }

      const response = await fetch(`${UALA_CONFIG.baseUrl}/v1/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${UALA_CONFIG.apiKey}`
        },
        body: JSON.stringify({
          amount,
          description,
          externalReference,
          callbackUrl: `${window.location.origin}/payment/callback`
        })
      });

      if (!response.ok) {
        throw new Error('Error creating Uala payment');
      }

      return await response.json();
    } catch (error) {
      console.error('Uala payment error:', error);
      return null;
    }
  }

  // Verificar estado del pago
  static async checkPaymentStatus(paymentId: string): Promise<string> {
    try {
      if (!UALA_CONFIG.apiKey) {
        return 'pending';
      }

      const response = await fetch(`${UALA_CONFIG.baseUrl}/v1/payments/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${UALA_CONFIG.apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error('Error checking payment status');
      }

      const data = await response.json();
      return data.status;
    } catch (error) {
      console.error('Error checking payment:', error);
      return 'error';
    }
  }

  // Generar QR para pago
  static generateQRData(amount: number, alias: string): string {
    // Formato estándar de QR para transferencias ARG
    // https://www.bcra.gob.ar/Pdfs/comytexord/0044_20_37_41_00.pdf
    const qrData = {
      ver: '01',
      alias: alias,
      amount: amount.toFixed(2),
      currency: 'ARS'
    };
    return JSON.stringify(qrData);
  }
}

// ============================================
// DATOS DE PAGO MANUAL (Mientras se configura API)
// ============================================

export const PAYMENT_DATA = {
  uala: {
    alias: 'rifaflash.uala',
    cvu: '0000003100088888888888',
    name: 'RifaFlash',
    phone: '+54 9 11 1234-5678'
  },
  mercadopago: {
    alias: 'rifaflash.mp',
    cvu: '0000003100099999999999',
    name: 'RifaFlash',
    link: 'https://mpago.la/rifaflash' // Link de pago de MP
  }
};

// ============================================
// WEBHOOK HANDLER (Para notificaciones de Ualá)
// ============================================

export function handleUalaWebhook(payload: any) {
  // Este se ejecuta cuando Ualá notifica un pago
  console.log('Uala webhook received:', payload);
  
  if (payload.status === 'approved') {
    // Confirmar el pago en la base de datos
    return {
      success: true,
      paymentId: payload.paymentId,
      externalReference: payload.externalReference
    };
  }
  
  return { success: false };
}