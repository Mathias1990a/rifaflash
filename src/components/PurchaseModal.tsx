import { useState } from 'react';
import { X, Wallet } from 'lucide-react';

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedNumbers: number[];
  roomName: string;
  price: number;
  onConfirm: (paymentData: any) => void;
}

export function PurchaseModal({ 
  isOpen, 
  onClose, 
  selectedNumbers, 
  roomName, 
  price, 
  onConfirm 
}: PurchaseModalProps) {
  const [paymentData, setPaymentData] = useState({
    sender_name: '',
    sender_cbu: '',
    transfer_date: '',
    notes: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(paymentData);
    onClose();
  };

  const totalAmount = selectedNumbers.length * price;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Confirmar Compra</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4 mb-6">
            <div className="bg-purple-50 rounded-lg p-4">
              <h4 className="font-semibold text-purple-900 mb-2">Detalles de la Compra</h4>
              <p className="text-purple-700">Sala: {roomName}</p>
              <p className="text-purple-700">Números: {selectedNumbers.join(', ')}</p>
              <p className="text-purple-700">Cantidad: {selectedNumbers.length}</p>
              <p className="text-purple-700">Precio por número: ${price.toLocaleString()}</p>
              <p className="text-xl font-bold text-purple-900 mt-2">
                Total: ${totalAmount.toLocaleString()}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del titular
              </label>
              <input
                type="text"
                required
                value={paymentData.sender_name}
                onChange={(e) => setPaymentData({...paymentData, sender_name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Nombre completo"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CBU/Alias
              </label>
              <input
                type="text"
                required
                value={paymentData.sender_cbu}
                onChange={(e) => setPaymentData({...paymentData, sender_cbu: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="CBU o Alias"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de transferencia
              </label>
              <input
                type="date"
                required
                value={paymentData.transfer_date}
                onChange={(e) => setPaymentData({...paymentData, transfer_date: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notas (opcional)
              </label>
              <textarea
                value={paymentData.notes}
                onChange={(e) => setPaymentData({...paymentData, notes: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows={3}
                placeholder="Referencia o mensaje opcional"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
              >
                <Wallet className="w-4 h-4" />
                Confirmar Transferencia
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
