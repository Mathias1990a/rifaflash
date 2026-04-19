import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, CreditCard, User, Calendar, FileText, Banknote, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { supabase } from '../services/supabase';
import { TelegramService } from '../services/telegram';

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  number: number;
  roomPrice: number;
  roomName: string;
  user: {
    id: string;
    fullName: string;
    dni: string;
  };
  onPurchaseSubmitted: () => void;
}

export function PurchaseModal({ 
  isOpen, 
  onClose, 
  number, 
  roomPrice, 
  roomName,
  user,
  onPurchaseSubmitted 
}: PurchaseModalProps) {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [transferData, setTransferData] = useState({
    senderName: '',
    senderCbu: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  if (!isOpen) return null;

  const handleSubmitPayment = async () => {
    if (!transferData.senderName || !transferData.senderCbu || !transferData.date) {
      alert('Por favor completá todos los campos');
      return;
    }

    setIsLoading(true);

    try {
      // Crear pago pendiente en la base de datos
      const { data, error } = await supabase
        .rpc('create_pending_payment', {
          p_user_id: user.id,
          p_room_id: 'standard', // TODO: obtener sala actual
          p_number: number,
          p_amount: roomPrice,
          p_sender_name: transferData.senderName,
          p_sender_cbu: transferData.senderCbu,
          p_transfer_date: transferData.date,
          p_notes: transferData.notes
        });

      if (error) throw error;

      // Notificar a Telegram
      await TelegramService.notifyTransferPayment(
        user.fullName,
        user.dni,
        number,
        roomPrice,
        {
          senderName: transferData.senderName,
          senderCbu: transferData.senderCbu,
          date: transferData.date,
          amount: roomPrice,
          notes: transferData.notes
        }
      );

      setStep(3); // Mostrar confirmación
      onPurchaseSubmitted();
    } catch (error) {
      console.error('Error al crear pago:', error);
      alert('Error al procesar el pago. Intentá de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-b from-[#1a0a3e] to-[#0f0518] rounded-2xl w-full max-w-md border border-violet-500/30 p-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">
            {step === 1 && '¿Comprar este número?'}
            {step === 2 && 'Datos de la transferencia'}
            {step === 3 && '¡Solicitud enviada!'}
          </h2>
          <button onClick={onClose} className="text-white/60 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Step 1: Confirmar compra */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center">
                <span className="text-3xl font-bold text-white">#{number}</span>
              </div>
              <p className="text-white/70">Sala: <span className="text-white font-semibold">{roomName}</span></p>
              <p className="text-2xl font-bold text-yellow-400 mt-2">${roomPrice.toLocaleString()}</p>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-sm text-white/70 mb-2">Para comprar este número:</p>
              <ol className="text-sm text-white/60 space-y-1 list-decimal list-inside">
                <li>Transferí <strong className="text-white">${roomPrice.toLocaleString()}</strong> al CBU que te daremos</li>
                <li>Completá los datos de la transferencia</li>
                <li>Esperá la aprobación del administrador</li>
              </ol>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose} className="flex-1 border-white/20 text-white">
                Cancelar
              </Button>
              <Button 
                onClick={() => setStep(2)} 
                className="flex-1 bg-gradient-to-r from-violet-600 to-violet-800"
              >
                Continuar
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Datos de transferencia */}
        {step === 2 && (
          <div className="space-y-4">
            {/* Datos del CBU del admin */}
            <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
              <p className="text-sm font-medium text-yellow-300 mb-2">Transferí a este CBU:</p>
              <p className="text-lg font-mono text-white bg-black/30 p-2 rounded">0000003100075199635083</p>
              <p className="text-xs text-white/50 mt-1">Alias: rifaflash.mp</p>
            </div>

            <div className="space-y-3">
              <div>
                <Label className="flex items-center gap-2 text-white/80">
                  <User className="w-4 h-4" />
                  Nombre del titular de la cuenta
                </Label>
                <Input
                  value={transferData.senderName}
                  onChange={(e) => setTransferData({...transferData, senderName: e.target.value})}
                  placeholder="Ej: Juan Pérez"
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>

              <div>
                <Label className="flex items-center gap-2 text-white/80">
                  <CreditCard className="w-4 h-4" />
                  CBU/CVU desde donde transferiste
                </Label>
                <Input
                  value={transferData.senderCbu}
                  onChange={(e) => setTransferData({...transferData, senderCbu: e.target.value})}
                  placeholder="Ej: 0000003100075199635083"
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>

              <div>
                <Label className="flex items-center gap-2 text-white/80">
                  <Calendar className="w-4 h-4" />
                  Fecha de la transferencia
                </Label>
                <Input
                  type="date"
                  value={transferData.date}
                  onChange={(e) => setTransferData({...transferData, date: e.target.value})}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>

              <div>
                <Label className="flex items-center gap-2 text-white/80">
                  <FileText className="w-4 h-4" />
                  Notas (opcional)
                </Label>
                <Input
                  value={transferData.notes}
                  onChange={(e) => setTransferData({...transferData, notes: e.target.value})}
                  placeholder="Número de comprobante, etc."
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button 
                variant="outline" 
                onClick={() => setStep(1)} 
                className="flex-1 border-white/20 text-white"
              >
                Atrás
              </Button>
              <Button 
                onClick={handleSubmitPayment}
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-green-600 to-green-800"
              >
                {isLoading ? 'Enviando...' : 'Enviar solicitud'}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Confirmación */}
        {step === 3 && (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-white mb-2">¡Solicitud enviada!</h3>
              <p className="text-white/70">
                Tu solicitud de compra fue enviada al administrador.
                Te notificaremos cuando sea aprobada.
              </p>
            </div>

            <Button onClick={onClose} className="w-full bg-violet-600">
              Entendido
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
