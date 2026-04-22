import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { 
  CheckCircle2, 
  XCircle, 
  Users, 
  TrendingUp, 
  AlertCircle, 
  CreditCard,
  Settings
} from 'lucide-react';
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

export function CompleteAdminPanel() {
  const [payments, setPayments] = useState<PendingPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'payments' | 'numbers'>('payments');

  // Cargar pagos pendientes
  const loadPayments = async () => {
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

      if (error) {
        console.error('Error cargando pagos:', error);
        return;
      }

      setPayments(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Aprobar pago
  const approvePayment = async (paymentId: string) => {
    try {
      const { error } = await supabase.rpc('approve_payment', {
        p_payment_id: paymentId,
        p_admin_id: '00000000-0000-0000-0000-000000000000' // ID de admin temporal
      });

      if (error) {
        console.error('Error aprobando pago:', error);
        alert('Error al aprobar el pago');
        return;
      }

      // Recargar pagos
      await loadPayments();
      alert('Pago aprobado exitosamente');
    } catch (error) {
      console.error('Error:', error);
      alert('Error al aprobar el pago');
    }
  };

  // Rechazar pago
  const rejectPayment = async (paymentId: string) => {
    try {
      const { error } = await supabase.rpc('reject_payment', {
        p_payment_id: paymentId,
        p_admin_id: '00000000-0000-0000-0000-000000000000' // ID de admin temporal
      });

      if (error) {
        console.error('Error rechazando pago:', error);
        alert('Error al rechazar el pago');
        return;
      }

      // Recargar pagos
      await loadPayments();
      alert('Pago rechazado exitosamente');
    } catch (error) {
      console.error('Error:', error);
      alert('Error al rechazar el pago');
    }
  };

  // Cargar datos al montar
  useEffect(() => {
    loadPayments();
  }, []);

  // Suscribirse a cambios en tiempo real
  useEffect(() => {
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
          () => {
            loadPayments();
          }
        )
        .subscribe();
    };
    
    setupSubscription();

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center text-white">Cargando panel de administración...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900 p-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/40 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <h1 className="text-3xl font-bold text-white mb-2">Panel de Administración</h1>
            <p className="text-white/60">Gestioná pagos pendientes y números de rifas</p>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/10">
            <button
              onClick={() => setActiveTab('payments')}
              className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium ${
                activeTab === 'payments' 
                  ? 'text-white border-b-2 border-violet-500 bg-white/5' 
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              Pagos Pendientes ({payments.length})
            </button>
            <button
              onClick={() => setActiveTab('numbers')}
              className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium ${
                activeTab === 'numbers' 
                  ? 'text-white border-b-2 border-violet-500 bg-white/5' 
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              <Settings className="w-4 h-4" />
              Configuración
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'payments' && (
              <div className="space-y-4">
                {payments.length === 0 ? (
                  <div className="text-center py-12 bg-white/5 rounded-xl">
                    <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-white mb-2">No hay pagos pendientes</h3>
                    <p className="text-white/60">Todos los pagos están al día</p>
                  </div>
                ) : (
                  payments.map((payment) => (
                    <Card key={payment.id} className="bg-white/5 border-white/10">
                      <CardContent className="p-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          {/* Datos del comprador */}
                          <div>
                            <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                              <Users className="w-4 h-4 text-violet-400" />
                              Datos del Comprador
                            </h4>
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
                            <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                              <TrendingUp className="w-4 h-4 text-green-400" />
                              Datos de Transferencia
                            </h4>
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
                                Estado: <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded border border-yellow-500/30 text-xs">
                                  Pendiente
                                </span>
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Acciones */}
                        <div className="flex gap-3 mt-6 pt-4 border-t border-white/10">
                          <Button 
                            onClick={() => approvePayment(payment.id)}
                            className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Aprobar Pago
                          </Button>
                          <Button 
                            onClick={() => rejectPayment(payment.id)}
                            variant="outline"
                            className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Rechazar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}

            {activeTab === 'numbers' && (
              <div className="space-y-6">
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-blue-400 text-sm font-medium">Configuración del Sistema</p>
                      <p className="text-white/60 text-xs mt-1">Aquí podrás configurar los datos bancarios y preferencias del sistema.</p>
                    </div>
                  </div>
                </div>

                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      Configuración de Cuenta Bancaria
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-white/60 text-sm">Alias</label>
                      <input 
                        type="text" 
                        defaultValue="rifaflash.bis"
                        className="mt-1 w-full bg-white/5 border-white/10 text-white rounded px-3 py-2"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="text-white/60 text-sm">CBU/CVU</label>
                      <input 
                        type="text" 
                        defaultValue="0000003100000001234567"
                        className="mt-1 w-full bg-white/5 border-white/10 text-white rounded px-3 py-2 font-mono"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="text-white/60 text-sm">Titular</label>
                      <input 
                        type="text" 
                        defaultValue="RifaFlash"
                        className="mt-1 w-full bg-white/5 border-white/10 text-white rounded px-3 py-2"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="text-white/60 text-sm">Banco</label>
                      <input 
                        type="text" 
                        defaultValue="Ualá Bis"
                        className="mt-1 w-full bg-white/5 border-white/10 text-white rounded px-3 py-2"
                        readOnly
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
