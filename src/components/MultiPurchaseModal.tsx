import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Trash2, Plus, Minus, CreditCard, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { supabase } from '../services/supabase';
import { TelegramService } from '../services/telegram';
import { RoomType } from '../types';

interface CartItem {
  number: number;
  price: number;
}

interface MultiPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedNumbers: number[];
  roomPrice: number;
  roomName: string;
  roomId: RoomType;
  user: {
    id: string;
    fullName: string;
    dni: string;
  };
  onPurchaseSubmitted: () => void;
  onRemoveNumber: (number: number) => void;
  paymentConfig?: {
    alias: string;
    cbu: string;
    accountName: string;
    bankName: string;
  };
}

export function MultiPurchaseModal({
  isOpen,
  onClose,
  selectedNumbers,
  roomPrice,
  roomName,
  roomId,
  user,
  onPurchaseSubmitted,
  onRemoveNumber,
  paymentConfig
}: MultiPurchaseModalProps) {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [transferData, setTransferData] = useState({
    senderName: '',
    senderCbu: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  if (!isOpen || selectedNumbers.length === 0) return null;

  const totalAmount = selectedNumbers.length * roomPrice;

  const handleSubmitPayment = async () => {
    if (!transferData.senderName || !transferData.senderCbu || !transferData.date) {
      alert('Por favor completá todos los campos');
      return;
    }

    setIsLoading(true);

    try {
      console.log('Iniciando proceso de compra:', {
        selectedNumbers,
        userId: user.id,
        roomId,
        roomPrice
      });

      // PRIMERO: Obtener el room_id correcto (UUID) usando el nombre
      const { data: roomData, error: roomError } = await supabase
        .from('rooms')
        .select('id')
        .eq('name', roomName)
        .single();

      if (roomError || !roomData) {
        console.error('Error obteniendo room:', roomError);
        alert('Error al obtener información de la sala');
        setIsLoading(false);
        return;
      }

      const actualRoomId = roomData.id;

      // SEGUNDO: Reservar los números inmediatamente
      for (const number of selectedNumbers) {
        console.log(`Reservando número ${number}...`);
        
        const { error: reserveError } = await supabase
          .from('numbers')
          .update({
            status: 'reserved',
            user_id: user.id,
            reserved_at: new Date().toISOString()
          })
          .eq('room_id', actualRoomId)
          .eq('number', number)
          .eq('status', 'available'); // Solo si está disponible

        if (reserveError) {
          console.error('Error reservando número:', reserveError);
          alert(`El número ${number} ya no está disponible o hubo un error al reservarlo`);
          setIsLoading(false);
          return;
        }
        
        console.log(`Número ${number} reservado exitosamente`);
      }

      // TERCERO: Crear pagos pendientes para cada número
      for (const number of selectedNumbers) {
        console.log(`Creando pago pendiente para número ${number}...`);
        
        const { data, error } = await supabase
          .rpc('create_pending_payment', {
            p_user_id: user.id,
            p_room_id: actualRoomId,
            p_number: number,
            p_amount: roomPrice,
            p_sender_name: transferData.senderName,
            p_sender_cbu: transferData.senderCbu,
            p_transfer_date: transferData.date,
            p_notes: `${transferData.notes} | Número ${number} de ${selectedNumbers.length}`
          });

        if (error) {
          console.error('Error creando pago pendiente:', error);
          throw error;
        }
        
        console.log(`Pago creado exitosamente para número ${number}:`, data);

        // Notificar a Telegram por cada número
        try {
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
              notes: `${transferData.notes} | Compra múltiple: ${selectedNumbers.length} números`
            }
          );
          console.log(`Notificación Telegram enviada para número ${number}`);
        } catch (telegramError) {
          console.error('Error enviando notificación Telegram:', telegramError);
          // No fallamos todo si Telegram falla
        }
      }

      setStep(3); // Mostrar confirmación
      onPurchaseSubmitted();
      console.log('Proceso de compra completado exitosamente');
    } catch (error) {
      console.error('Error al procesar la compra:', error);
      alert('Error al procesar la compra. Intentá de nuevo. Error: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-b from-[#1a0a3e] to-[#0f0518] rounded-2xl w-full max-w-lg border border-violet-500/30 p-6 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {step === 1 && 'Tu Carrito'}
                {step === 2 && 'Datos de Transferencia'}
                {step === 3 && '¡Solicitud enviada!'}
              </h2>
              <p className="text-sm text-white/50">{roomName}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Step 1: Carrito */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <p className="text-sm text-white/60 mb-3">Números seleccionados:</p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedNumbers.map((num) => (
                  <motion.div
                    key={num}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-violet-500/20 border border-violet-500/30"
                  >
                    <span className="text-lg font-bold text-white">#{num.toString().padStart(2, '0')}</span>
                    <button
                      onClick={() => onRemoveNumber(num)}
                      className="text-white/40 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </div>

              <div className="border-t border-white/10 pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white/60">Precio por número:</span>
                  <span className="text-white">${roomPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white/60">Cantidad:</span>
                  <span className="text-white">{selectedNumbers.length}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-white/10">
                  <span className="text-lg font-medium text-white">Total:</span>
                  <span className="text-2xl font-bold text-yellow-400">${totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
              <p className="text-sm text-yellow-300 mb-2">💡 ¿Cómo funciona?</p>
              <ul className="text-xs text-white/60 space-y-1 list-disc list-inside">
                <li>Transferí el total al CBU que te daremos</li>
                <li>Completá los datos de la transferencia</li>
                <li>El admin aprobará todos los números juntos</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={onClose} 
                className="flex-1 border-white/20 text-white"
              >
                Seguir eligiendo
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
              <p className="text-sm font-medium text-yellow-300 mb-2">Transferí el total a este CBU:</p>
              <p className="text-lg font-mono text-white bg-black/30 p-2 rounded">{paymentConfig?.cbu || '0000003100075199635083'}</p>
              <p className="text-xs text-white/50 mt-1">Alias: {paymentConfig?.alias || 'rifaflash.mp'}</p>
              <p className="text-xs text-white/50 mt-1">Titular: {paymentConfig?.accountName || 'RifaFlash'}</p>
              <p className="text-xs text-white/50 mt-1">Banco: {paymentConfig?.bankName || 'Ualá Bis'}</p>
              <div className="mt-3 pt-3 border-t border-yellow-500/20">
                <p className="text-sm text-yellow-400 font-bold">Total a transferir: ${totalAmount.toLocaleString()}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <Label className="flex items-center gap-2 text-white/80">
                  <CreditCard className="w-4 h-4" />
                  Nombre del titular de tu cuenta
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
                  Tu CBU/CVU
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
                {isLoading ? 'Enviando...' : `Enviar solicitud (${selectedNumbers.length} números)`}
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
                Solicitaste {selectedNumbers.length} números. El administrador los revisará y aprobará.
              </p>
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {selectedNumbers.map((num) => (
                  <span 
                    key={num}
                    className="px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 text-sm"
                  >
                    #{num.toString().padStart(2, '0')}
                  </span>
                ))}
              </div>
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
