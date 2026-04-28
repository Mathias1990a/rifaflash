import { useState, useEffect } from "react";
import { getPendingPayments, approvePayment as approvePaymentFirebase, rejectPayment as rejectPaymentFirebase, confirmNumberPayment } from '../services/firebase';

interface PendingPayment {
  id: string;
  user_id: string;
  room_id: string;
  number: number;
  amount: number;
  sender_name: string;
  sender_cbu: string;
  date: string;
  notes: string;
  status: string;
  created_at: any;
}

export function WorkingAdminPanel() {
  const [payments, setPayments] = useState<PendingPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar pagos pendientes
  const loadPayments = async () => {
    console.log('Cargando pagos pendientes...');
    
    try {
      const data = await getPendingPayments();
      console.log('Pagos encontrados:', data?.length || 0);
      setPayments(data || []);
    } catch (error) {
      console.error('Error cargando pagos:', error);
      alert('Error al cargar pagos');
    } finally {
      setIsLoading(false);
    }
  };

  // Aprobar pago
  const handleApprove = async (paymentId: string, roomId: string, number: number) => {
    console.log('Aprobando pago:', paymentId);
    
    try {
      await approvePaymentFirebase(paymentId);
      await confirmNumberPayment(roomId as any, number);
      
      alert('Pago aprobado exitosamente');
      await loadPayments();
    } catch (error) {
      console.error('Error aprobando pago:', error);
      alert('Error al aprobar pago');
    }
  };

  // Rechazar pago
  const handleReject = async (paymentId: string) => {
    console.log('Rechazando pago:', paymentId);
    
    try {
      await rejectPaymentFirebase(paymentId);
      alert('Pago rechazado exitosamente');
      await loadPayments();
    } catch (error) {
      console.error('Error rechazando pago:', error);
      alert('Error al rechazar pago');
    }
  };

  // Cargar datos al montar
  useEffect(() => {
    loadPayments();
    
    // Recargar cada 10 segundos
    const interval = setInterval(loadPayments, 10000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="p-8 text-center text-white">
        <div className="animate-spin inline-block w-8 h-8 border-2 border-white/20 border-t-white rounded-full mb-4"></div>
        <p>Cargando pagos pendientes...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-6">Panel de Administración</h2>
      
      <div className="mb-4 flex justify-between items-center">
        <span className="text-white/60">
          {payments.length} pagos pendientes
        </span>
        <button 
          onClick={loadPayments}
          className="px-4 py-2 bg-violet-500 hover:bg-violet-600 text-white rounded-lg text-sm"
        >
          Actualizar
        </button>
      </div>

      {payments.length === 0 ? (
        <div className="text-center py-12 bg-white/5 rounded-xl">
          <p className="text-white/50">No hay pagos pendientes</p>
        </div>
      ) : (
        <div className="space-y-4">
          {payments.map((payment) => (
            <div 
              key={payment.id} 
              className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-colors"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-white/50 text-xs uppercase tracking-wider">Sala</p>
                  <p className="text-white font-medium">{payment.room_id}</p>
                </div>
                <div>
                  <p className="text-white/50 text-xs uppercase tracking-wider">Número</p>
                  <p className="text-white font-medium text-2xl">{payment.number}</p>
                </div>
                <div>
                  <p className="text-white/50 text-xs uppercase tracking-wider">Monto</p>
                  <p className="text-green-400 font-medium">${payment.amount}</p>
                </div>
                <div>
                  <p className="text-white/50 text-xs uppercase tracking-wider">Fecha</p>
                  <p className="text-white/80 text-sm">{payment.date}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-black/20 rounded-lg">
                <div>
                  <p className="text-white/50 text-xs uppercase tracking-wider">Nombre</p>
                  <p className="text-white">{payment.sender_name}</p>
                </div>
                <div>
                  <p className="text-white/50 text-xs uppercase tracking-wider">CBU/Alias</p>
                  <p className="text-white font-mono text-sm">{payment.sender_cbu}</p>
                </div>
              </div>

              {payment.notes && (
                <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <p className="text-white/50 text-xs uppercase tracking-wider mb-1">Notas</p>
                  <p className="text-white/80 text-sm">{payment.notes}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => handleApprove(payment.id, payment.room_id, payment.number)}
                  className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
                >
                  Aprobar Pago
                </button>
                <button
                  onClick={() => handleReject(payment.id)}
                  className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
                >
                  Rechazar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
