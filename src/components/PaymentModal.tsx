import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet, 
  Clock, 
  CheckCircle2, 
  Copy,
  Loader2,
  MessageCircle,
  CreditCard,
  ArrowRight,
  Smartphone,
  QrCode,
  Send,
  X
} from 'lucide-react';
import { Button } from './ui/button';
import { RaffleNumber, UserProfile, RoomConfig } from '../types';
import { TelegramService, PaymentNotification } from '../services/telegram';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedNumber: RaffleNumber | null;
  userProfile: UserProfile;
  roomConfig: RoomConfig;
  onConfirmPayment: () => void;
  onCancel: () => void;
}

type PaymentMethod = 'uala' | 'mercadopago';

export function PaymentModal({ 
  isOpen, 
  onClose, 
  selectedNumber, 
  userProfile,
  roomConfig,
  onConfirmPayment,
  onCancel
}: PaymentModalProps) {
  const [step, setStep] = useState<'payment' | 'processing' | 'success'>('payment');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('uala');
  const [copied, setCopied] = useState(false);
  const [telegramSent, setTelegramSent] = useState(false);

  const handleConfirmPayment = async () => {
    setStep('processing');
    
    // Enviar notificación a Telegram
    const notification: PaymentNotification = {
      userName: userProfile.fullName,
      userDNI: userProfile.dni,
      userPhone: userProfile.phone,
      userCvuAlias: userProfile.cvuAlias,
      number: selectedNumber?.number || 0,
      amount: roomConfig.price,
      paymentMethod: paymentMethod,
      timestamp: new Date()
    };
    
    await TelegramService.notifyNewPayment(notification);
    
    // Simular webhook de confirmación
    setTimeout(() => {
      setStep('success');
      onConfirmPayment();
    }, 2500);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTelegramNotify = () => {
    // Abrir chat de Telegram con mensaje predefinido
    const message = `Hola! Realicé el pago por el número #${selectedNumber?.number.toString().padStart(2, '0')}. Mi DNI es ${userProfile.dni}`;
    const telegramUrl = `https://t.me/rifaflash?text=${encodeURIComponent(message)}`;
    window.open(telegramUrl, '_blank');
    setTelegramSent(true);
    setTimeout(() => setTelegramSent(false), 3000);
  };

  const handleClose = () => {
    setStep('payment');
    setPaymentMethod('uala');
    setTelegramSent(false);
    onClose();
  };

  const paymentData = {
    uala: {
      name: 'Ualá Bis',
      alias: 'rifaflash.uala',
      cvu: '0000003100088888888888',
      color: 'from-violet-600 to-violet-800',
      icon: Wallet,
      phone: '+54 9 11 1234-5678'
    },
    mercadopago: {
      name: 'Mercado Pago',
      alias: 'rifaflash.mp',
      cvu: '0000003100099999999999',
      color: 'from-blue-500 to-blue-700',
      icon: CreditCard,
      phone: '+54 9 11 8765-4321'
    }
  };

  const currentPayment = paymentData[paymentMethod];
  const Icon = currentPayment.icon;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md bg-gradient-to-b from-[#1a0a3e] to-[#0f0518] rounded-2xl border border-violet-500/30 shadow-2xl overflow-hidden"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${currentPayment.color} flex items-center justify-center`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </motion.div>
                <div>
                  <h2 className="text-xl font-display text-white">
                    Pagar Número 
                    <span className="text-yellow-400">
                      #{selectedNumber?.number.toString().padStart(2, '0')}
                    </span>
                  </h2>
                  <p className="text-sm text-white/50">Elegí tu método de pago</p>
                </div>
              </div>
              
              <button
                onClick={handleClose}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>

            <AnimatePresence mode="wait">
              {step === 'payment' && (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-5"
                >
                  {/* Selector de método de pago */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setPaymentMethod('uala')}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        paymentMethod === 'uala' 
                          ? 'border-violet-500 bg-violet-500/20' 
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Wallet className="w-5 h-5 text-violet-400" />
                        <span className="text-sm font-medium">Ualá Bis</span>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => setPaymentMethod('mercadopago')}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        paymentMethod === 'mercadopago' 
                          ? 'border-blue-500 bg-blue-500/20' 
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <CreditCard className="w-5 h-5 text-blue-400" />
                        <span className="text-sm font-medium">Mercado Pago</span>
                      </div>
                    </button>
                  </div>

                  {/* Monto */}
                  <div className="text-center py-3 bg-gradient-to-r from-yellow-400/10 to-yellow-500/5 rounded-xl border border-yellow-400/20">
                    <p className="text-white/60 text-sm mb-1">Monto a pagar</p>
                    <p className="text-4xl font-display text-gradient-gold">${roomConfig.price.toLocaleString()}</p>
                    <p className="text-white/40 text-xs mt-1">ARS</p>
                  </div>

                  {/* Datos de pago */}
                  <div className="space-y-3 bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="flex items-center justify-between">
                      <span className="text-white/60 text-sm">Alias</span>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">{currentPayment.alias}</span>
                        <button
                          onClick={() => copyToClipboard(currentPayment.alias)}
                          className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                        >
                          <Copy className="w-4 h-4 text-violet-400" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-white/60 text-sm">CVU</span>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium text-xs">{currentPayment.cvu}</span>
                        <button
                          onClick={() => copyToClipboard(currentPayment.cvu)}
                          className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                        >
                          <Copy className="w-4 h-4 text-violet-400" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/10">
                      <span className="text-white/60 text-sm">Teléfono</span>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">{currentPayment.phone}</span>
                        <button
                          onClick={() => copyToClipboard(currentPayment.phone)}
                          className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                        >
                          <Smartphone className="w-4 h-4 text-violet-400" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* QR */}
                  <div className="flex justify-center py-2">
                    <div className="bg-white p-3 rounded-xl">
                      <QrCode className="w-28 h-28 text-black" />
                    </div>
                  </div>

                  {copied && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center text-xs text-green-400"
                    >
                      ¡Copiado al portapapeles!
                    </motion.p>
                  )}

                  {/* Notificación Telegram */}
                  <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-xl p-4 border border-blue-500/20">
                    <div className="flex items-start gap-3">
                      <MessageCircle className="w-5 h-5 text-blue-400 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-white/80 mb-2">
                          ¿Ya realizaste el pago? Notificanos por Telegram para confirmarlo al instante.
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleTelegramNotify}
                          className="w-full border-blue-500/50 text-blue-400 hover:bg-blue-500/20"
                        >
                          <Send className="w-4 h-4 mr-2" />
                          {telegramSent ? '¡Notificación enviada!' : 'Notificar por Telegram'}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <Button 
                      onClick={handleConfirmPayment}
                      size="lg" 
                      className="w-full group bg-gradient-to-r from-violet-600 to-violet-800 hover:from-violet-500 hover:to-violet-700"
                    >
                      Ya realicé el pago
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      onClick={onCancel}
                      className="w-full text-white/60"
                    >
                      Cancelar
                    </Button>
                  </div>

                  <p className="text-center text-xs text-white/40 flex items-center justify-center gap-1">
                    <Clock className="w-3 h-3" />
                    El número se reserva por 10 minutos
                  </p>
                </motion.div>
              )}

              {step === 'processing' && (
                <motion.div
                  key="processing"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="py-12 text-center space-y-4"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Loader2 className="w-12 h-12 text-violet-500 mx-auto" />
                  </motion.div>
                  <p className="text-white font-medium">Verificando pago...</p>
                  <p className="text-white/50 text-sm">Esto puede tomar unos segundos</p>
                </motion.div>
              )}

              {step === 'success' && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-8 text-center space-y-4"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto"
                  >
                    <CheckCircle2 className="w-10 h-10 text-green-400" />
                  </motion.div>
                  
                  <p className="text-xl font-display text-white">¡Pago confirmado! ✅</p>
                  <p className="text-white/60">
                    El número 
                    <span className="text-yellow-400 font-bold">
                      #{selectedNumber?.number.toString().padStart(2, '0')}
                    </span> 
                    es tuyo
                  </p>
                  
                  <Button onClick={handleClose} className="mt-4">
                    Continuar
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}