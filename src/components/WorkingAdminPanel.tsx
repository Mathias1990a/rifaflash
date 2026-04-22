import { useState, useEffect } from "react";
import { supabase } from '../services/supabase';

interface PendingPayment {
  id: string;
  user_id: string;
  room_id: string;
  number: number;
  amount: number;
  sender_name: string;
  sender_cbu: string;
  transfer_date: string;
  notes: string;
  status: string;
  created_at: string;
  user?: {
    full_name: string;
    dni: string;
    email: string;
  };
}

export function WorkingAdminPanel() {
  const [payments, setPayments] = useState<PendingPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar pagos pendientes
  const loadPayments = async () => {
    console.log('Cargando pagos pendientes...');
    
    try {
      const { data, error } = await supabase
        .from('pending_payments')
        .select(`
          *,
          user:users(
            full_name,
            dni,
            email
          )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      console.log('Resultado de consulta:', { data, error });

      if (error) {
        console.error('Error cargando pagos:', error);
        alert(`Error: ${error.message}`);
        return;
      }

      console.log('Pagos encontrados:', data?.length || 0);
      setPayments(data || []);
    } catch (error) {
      console.error('Error general:', error);
      alert('Error general al cargar pagos');
    } finally {
      setIsLoading(false);
    }
  };

  // Aprobar pago
  const approvePayment = async (paymentId: string) => {
    console.log('Aprobando pago:', paymentId);
    
    try {
      const { error } = await supabase.rpc('approve_payment', {
        p_payment_id: paymentId,
        p_admin_id: '00000000-0000-0000-0000-000000000000'
      });

      console.log('Resultado de aprobación:', { error });

      if (error) {
        console.error('Error aprobando pago:', error);
        alert(`Error al aprobar: ${error.message}`);
        return;
      }

      alert('Pago aprobado exitosamente');
      await loadPayments();
    } catch (error) {
      console.error('Error general aprobando:', error);
      alert('Error general al aprobar pago');
    }
  };

  // Rechazar pago
  const rejectPayment = async (paymentId: string) => {
    console.log('Rechazando pago:', paymentId);
    
    try {
      const { error } = await supabase.rpc('reject_payment', {
        p_payment_id: paymentId,
        p_admin_id: '00000000-0000-0000-0000-000000000000'
      });

      console.log('Resultado de rechazo:', { error });

      if (error) {
        console.error('Error rechazando pago:', error);
        alert(`Error al rechazar: ${error.message}`);
        return;
      }

      alert('Pago rechazado exitosamente');
      await loadPayments();
    } catch (error) {
      console.error('Error general rechazando:', error);
      alert('Error general al rechazar pago');
    }
  };

  // Cargar datos al montar
  useEffect(() => {
    console.log('Montando WorkingAdminPanel...');
    loadPayments();
  }, []);

  // Suscribirse a cambios en tiempo real
  useEffect(() => {
    console.log('Configurando suscripción a cambios...');
    
    let subscription: any;
    
    const setupSubscription = async () => {
      subscription = supabase
        .channel('pending_payments')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'pending_payments' 
          }, 
          (payload) => {
            console.log('Cambio detectado:', payload);
            loadPayments();
          }
        )
        .subscribe();

      console.log('Suscripción configurada');
    };
    
    setupSubscription();

    return () => {
      if (subscription) {
        console.log('Desuscribiendo...');
        subscription.unsubscribe();
      }
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center text-white">
            <h1 className="text-2xl font-bold mb-4">Panel de Administración</h1>
            <p>Cargando pagos pendientes...</p>
            <div className="mt-4">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-black/40 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 p-6">
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <h1 className="text-3xl font-bold text-white mb-2">Panel de Administración</h1>
            <p className="text-white/60">Gestión de Pagos Pendientes</p>
          </div>

          {/* Debug Info */}
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg mb-6">
            <h3 className="text-yellow-400 font-medium mb-2">Información de Depuración</h3>
            <div className="text-sm space-y-1">
              <p className="text-yellow-400">
                <strong>Total de pagos cargados:</strong> {payments.length}
              </p>
              <p className="text-yellow-400">
                <strong>Estado de carga:</strong> {isLoading ? 'Cargando...' : 'Completado'}
              </p>
              <p className="text-yellow-400">
                <strong>Console:</strong> Abrí la consola del navegador para ver logs
              </p>
            </div>
          </div>

          {/* Pagos Pendientes */}
          <div className="p-6">
            <h2 className="text-xl font-bold text-white mb-4">
              Pagos Pendientes ({payments.length})
            </h2>

            {payments.length === 0 ? (
              <div className="text-center py-12 bg-white/5 rounded-xl">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-xl font-medium text-white mb-2">No hay pagos pendientes</h3>
                <p className="text-white/60">Todos los pagos están al día</p>
              </div>
            ) : (
              <div className="space-y-4">
                {payments.map((payment) => (
                  <div key={payment.id} className="bg-white/5 rounded-xl p-6 border border-white/10">
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Datos del comprador */}
                      <div>
                        <h4 className="text-white font-medium mb-3">Datos del Comprador</h4>
                        <div className="space-y-2 text-sm">
                          <p className="text-white/60">
                            Nombre: <span className="text-white">{payment.user?.full_name || 'N/A'}</span>
                          </p>
                          <p className="text-white/60">
                            DNI: <span className="text-white">{payment.user?.dni || 'N/A'}</span>
                          </p>
                          <p className="text-white/60">
                            Email: <span className="text-white">{payment.user?.email || 'N/A'}</span>
                          </p>
                          <p className="text-white/60">
                            Número: <span className="text-yellow-400 font-bold">#{payment.number}</span>
                          </p>
                          <p className="text-white/60">
                            Monto: <span className="text-green-400 font-bold">${payment.amount.toLocaleString()}</span>
                          </p>
                        </div>
                      </div>

                      {/* Datos de la transferencia */}
                      <div>
                        <h4 className="text-white font-medium mb-3">Datos de Transferencia</h4>
                        <div className="space-y-2 text-sm">
                          <p className="text-white/60">
                            Titular: <span className="text-white">{payment.sender_name}</span>
                          </p>
                          <p className="text-white/60">
                            CBU: <span className="text-white font-mono">{payment.sender_cbu}</span>
                          </p>
                          <p className="text-white/60">
                            Fecha: <span className="text-white">{payment.transfer_date}</span>
                          </p>
                          {payment.notes && (
                            <p className="text-white/60">
                              Notas: <span className="text-white">{payment.notes}</span>
                            </p>
                          )}
                          <p className="text-white/60">
                            Estado: <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded text-xs">
                              PENDIENTE
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex gap-3 mt-6 pt-4 border-t border-white/10">
                      <button 
                        onClick={() => approvePayment(payment.id)}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium"
                      >
                        ✅ Aprobar Pago
                      </button>
                      <button 
                        onClick={() => rejectPayment(payment.id)}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium"
                      >
                        ❌ Rechazar Pago
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
