import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { AlertCircle, CheckCircle2, CreditCard, User } from 'lucide-react';
import { supabase } from '../services/supabase';

interface CompletePurchaseFlowProps {
  selectedNumbers: number[];
  roomPrice: number;
  roomId: string;
  user: any;
  onPurchaseComplete: () => void;
}

export function CompletePurchaseFlow({
  selectedNumbers,
  roomPrice,
  roomId,
  user,
  onPurchaseComplete
}: CompletePurchaseFlowProps) {
  const [step, setStep] = useState<'selection' | 'payment' | 'confirmation'>('selection');
  const [transferData, setTransferData] = useState({
    senderName: '',
    senderCbu: '',
    date: '',
    notes: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handlePaymentSubmit = async () => {
    if (!transferData.senderName || !transferData.senderCbu || !transferData.date) {
      alert('Por favor completá todos los campos');
      return;
    }

    setIsLoading(true);

    try {
      // Para cada número seleccionado, crear un pago pendiente
      for (const number of selectedNumbers) {
        const { error } = await supabase.rpc('create_pending_payment', {
          p_user_id: user.id,
          p_room_id: roomId,
          p_number: number,
          p_amount: roomPrice,
          p_sender_name: transferData.senderName,
          p_sender_cbu: transferData.senderCbu,
          p_transfer_date: transferData.date,
          p_notes: `${transferData.notes} | Número ${number} de ${selectedNumbers.length}`
        });

        if (error) {
          console.error('Error creando pago:', error);
          alert(`Error al crear pago para número ${number}: ${error.message}`);
          setIsLoading(false);
          return;
        }
      }

      setStep('confirmation');
      onPurchaseComplete();
    } catch (error) {
      console.error('Error al procesar:', error);
      alert('Error al procesar la compra. Intentá de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'confirmation') {
    return (
      <div className="bg-white/5 rounded-xl p-8 text-center">
        <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-white mb-2">¡Pago Registrado!</h3>
        <p className="text-white/80 mb-4">
          Tu pago está pendiente de verificación. Te notificaremos cuando sea aprobado.
        </p>
        <div className="bg-black/30 rounded-lg p-4 text-left max-w-md mx-auto">
          <h4 className="text-white font-medium mb-2">Resumen de tu compra:</h4>
          <p className="text-white/60 text-sm">Números: {selectedNumbers.join(', ')}</p>
          <p className="text-white/60 text-sm">Total: ${(roomPrice * selectedNumbers.length).toLocaleString()}</p>
          <p className="text-white/60 text-sm">Titular: {transferData.senderName}</p>
          <p className="text-white/60 text-sm">Fecha: {transferData.date}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <CreditCard className="w-6 h-6 text-violet-400" />
        <h3 className="text-xl font-bold text-white">Completa tu Compra</h3>
      </div>

      {/* Resumen de la compra */}
      <div className="bg-black/30 rounded-lg p-4 mb-6">
        <h4 className="text-white font-medium mb-2">Resumen de la Compra</h4>
        <div className="space-y-1 text-sm">
          <p className="text-white/60">
            Números seleccionados: <span className="text-white font-medium">{selectedNumbers.join(', ')}</span>
          </p>
          <p className="text-white/60">
            Precio por número: <span className="text-white font-medium">${roomPrice.toLocaleString()}</span>
          </p>
          <p className="text-white/60">
            Total a pagar: <span className="text-green-400 font-bold text-lg">
              ${(roomPrice * selectedNumbers.length).toLocaleString()}
            </span>
          </p>
        </div>
      </div>

      {/* Datos de la transferencia */}
      <div className="space-y-4 mb-6">
        <h4 className="text-white font-medium flex items-center gap-2">
          <User className="w-4 h-4" />
          Datos de la Transferencia
        </h4>
        
        <div>
          <Label className="text-white/60 text-sm">Nombre del titular de la cuenta</Label>
          <Input
            value={transferData.senderName}
            onChange={(e) => setTransferData({ ...transferData, senderName: e.target.value })}
            placeholder="Juan Pérez"
            className="mt-1 bg-white/5 border-white/10 text-white"
          />
        </div>

        <div>
          <Label className="text-white/60 text-sm">CBU/CVU de origen</Label>
          <Input
            value={transferData.senderCbu}
            onChange={(e) => setTransferData({ ...transferData, senderCbu: e.target.value })}
            placeholder="1234567890123456789012"
            className="mt-1 bg-white/5 border-white/10 text-white font-mono"
            maxLength={22}
          />
        </div>

        <div>
          <Label className="text-white/60 text-sm">Fecha de la transferencia</Label>
          <Input
            type="date"
            value={transferData.date}
            onChange={(e) => setTransferData({ ...transferData, date: e.target.value })}
            className="mt-1 bg-white/5 border-white/10 text-white"
          />
        </div>

        <div>
          <Label className="text-white/60 text-sm">Notas (opcional)</Label>
          <Input
            value={transferData.notes}
            onChange={(e) => setTransferData({ ...transferData, notes: e.target.value })}
            placeholder="Referencia o comentario"
            className="mt-1 bg-white/5 border-white/10 text-white"
          />
        </div>
      </div>

      {/* Información de pago */}
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-yellow-400 text-sm font-medium mb-1">Datos para la transferencia</p>
            <div className="text-white/60 text-sm space-y-1">
              <p><span className="text-white/80">Alias:</span> rifaflash.bis</p>
              <p><span className="text-white/80">CBU/CVU:</span> 0000003100000001234567</p>
              <p><span className="text-white/80">Titular:</span> RifaFlash</p>
              <p><span className="text-white/80">Banco:</span> Ualá Bis</p>
            </div>
          </div>
        </div>
      </div>

      {/* Botón de confirmación */}
      <Button 
        onClick={handlePaymentSubmit}
        disabled={isLoading || !transferData.senderName || !transferData.senderCbu || !transferData.date}
        className="w-full bg-violet-500 hover:bg-violet-600 text-white font-medium py-3"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Procesando...
          </span>
        ) : (
          'Confirmar Compra y Registrar Pago'
        )}
      </Button>
    </div>
  );
}
