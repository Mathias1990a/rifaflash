import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Save, CheckCircle2, XCircle, AlertCircle, Eye, EyeOff, LogOut, Banknote, Users, TrendingUp, MessageSquare, RefreshCw, Send } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { supabase } from '../services/supabase';
import { TelegramService } from '../services/telegram';

interface PaymentConfig {
  alias: string;
  cbu: string;
  accountName: string;
  bankName: string;
}

interface PendingPayment {
  id: string;
  user_name: string;
  user_dni: string;
  room_name: string;
  number: number;
  amount: number;
  sender_name: string;
  sender_cbu: string;
  date: string;
  notes?: string;
  created_at: string;
}

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminPanel({ isOpen, onClose }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'payments' | 'config' | 'support'>('payments');
  const [config, setConfig] = useState<PaymentConfig>({
    alias: 'rifaflash.bis',
    cbu: '0000003100000001234567',
    accountName: 'RifaFlash',
    bankName: 'Ualá Bis'
  });
  const [payments, setPayments] = useState<PendingPayment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCbu, setShowCbu] = useState(false);
  const [supportMessages, setSupportMessages] = useState<any[]>([]);
  const [numberChanges, setNumberChanges] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('rifaflash_admin_config');
    if (saved) setConfig(JSON.parse(saved));
    loadPayments();
    loadSupportData();
  }, []);

  const loadSupportData = async () => {
    try {
      // Cargar mensajes de soporte
      const { data: messages, error: messagesError } = await supabase
        .from('support_messages')
        .select(`
          *,
          user:users(full_name, dni)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (!messagesError && messages) {
        setSupportMessages(messages);
      }

      // Cargar cambios de número
      const { data: changes, error: changesError } = await supabase
        .from('number_changes')
        .select(`
          *,
          user:users(full_name, dni)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (!changesError && changes) {
        setNumberChanges(changes);
      }
    } catch (error) {
      console.error('Error cargando datos de soporte:', error);
    }
  };

  const loadPayments = async () => {
    setIsLoading(true);
    try {
      console.log('Cargando pagos pendientes...');
      
      // Primero verificar si la tabla existe
      const { data: tableCheck, error: tableError } = await supabase
        .from('pending_payments')
        .select('count', { count: 'exact' })
        .eq('status', 'pending');
      
      console.log('Verificación de tabla:', { tableCheck, tableError });
      
      if (tableError) {
        console.error('Error al verificar tabla:', tableError);
        throw tableError;
      }
      
      console.log(`Total de pagos pendientes en BD: ${tableCheck}`);
      
      const { data, error } = await supabase
        .from('pending_payments')
        .select(`
          *,
          user:users(full_name, dni)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      
      console.log('Respuesta de pagos con datos de usuario:', { data, error });
      
      if (error) {
        console.error('Error en consulta:', error);
        throw error;
      }
      
      if (data && data.length > 0) {
        console.log(`Se encontraron ${data.length} pagos pendientes`);
        console.log('Primer pago:', data[0]);
        setPayments(data.map((p: any) => ({
          id: p.id,
          user_name: p.user?.full_name || 'N/A',
          user_dni: p.user?.dni || 'N/A',
          room_name: p.room_id,
          number: p.number,
          amount: p.amount,
          sender_name: p.sender_name || '',
          sender_cbu: p.sender_cbu || '',
          date: p.transfer_date,
          notes: p.notes,
          created_at: p.created_at
        })));
      } else {
        console.log('No se encontraron pagos pendientes');
        setPayments([]);
      }
    } catch (error) {
      console.error('Error cargando pagos:', error);
      setPayments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const saveConfig = () => {
    localStorage.setItem('rifaflash_admin_config', JSON.stringify(config));
    alert('Configuración guardada');
  };

  const approvePayment = async (paymentId: string) => {
    try {
      // Obtener admin_id del localStorage o session
      const { data, error } = await supabase
        .rpc('approve_payment', {
          p_payment_id: paymentId,
          p_admin_id: '00000000-0000-0000-0000-000000000000' // TODO: usar admin real
        });
      
      if (error) throw error;
      
      if (data) {
        // Notificar a Telegram
        const payment = payments.find(p => p.id === paymentId);
        if (payment) {
          await TelegramService.notifyPaymentStatus(
            payment.user_name,
            payment.number,
            payment.amount,
            'approved'
          );
        }
        
        await loadPayments();
        alert('Pago aprobado correctamente');
      }
    } catch (error) {
      console.error('Error aprobando pago:', error);
      alert('Error al aprobar el pago');
    }
  };

  const rejectPayment = async (paymentId: string) => {
    try {
      const { data, error } = await supabase
        .rpc('reject_payment', {
          p_payment_id: paymentId,
          p_admin_id: '00000000-0000-0000-0000-000000000000' // TODO: usar admin real
        });
      
      if (error) throw error;
      
      if (data) {
        // Notificar a Telegram
        const payment = payments.find(p => p.id === paymentId);
        if (payment) {
          await TelegramService.notifyPaymentStatus(
            payment.user_name,
            payment.number,
            payment.amount,
            'rejected'
          );
        }
        
        await loadPayments();
        alert('Pago rechazado');
      }
    } catch (error) {
      console.error('Error rechazando pago:', error);
      alert('Error al rechazar el pago');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-b from-[#1a0a3e] to-[#0f0518] rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden border border-white/20"
      >
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
              <Settings className="w-5 h-5 text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Panel de Administración</h2>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white">
            <LogOut className="w-6 h-6" />
          </button>
        </div>

        <div className="flex border-b border-white/10">
          <button
            onClick={() => setActiveTab('payments')}
            className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium ${
              activeTab === 'payments' ? 'text-white border-b-2 border-red-500 bg-white/5' : 'text-white/50'
            }`}
          >
            <Banknote className="w-4 h-4" />
            Pagos Pendientes ({payments.length})
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium ${
              activeTab === 'config' ? 'text-white border-b-2 border-red-500 bg-white/5' : 'text-white/50'
            }`}
          >
            <Settings className="w-4 h-4" />
            Configuración
          </button>
          <button
            onClick={() => setActiveTab('support')}
            className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium ${
              activeTab === 'support' ? 'text-white border-b-2 border-red-500 bg-white/5' : 'text-white/50'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Soporte
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'payments' && (
            <div className="space-y-4">
              {payments.length === 0 ? (
                <div className="text-center py-12 bg-white/5 rounded-xl">
                  <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-4" />
                  <p className="text-white/60">No hay pagos pendientes</p>
                </div>
              ) : (
                payments.map((payment) => (
                  <div key={payment.id} className="bg-white/5 rounded-xl p-6 border border-white/10">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                          <Users className="w-4 h-4 text-violet-400" />
                          Comprador
                        </h4>
                        <div className="bg-black/30 rounded-lg p-4 text-sm space-y-1">
                          <p><span className="text-white/40">Nombre:</span> {payment.user_name}</p>
                          <p><span className="text-white/40">DNI:</span> {payment.user_dni}</p>
                          <p><span className="text-white/40">Sala:</span> {payment.room_name}</p>
                          <p><span className="text-white/40">Número:</span> <span className="text-yellow-400 font-bold">#{payment.number}</span></p>
                          <p><span className="text-white/40">Monto:</span> <span className="text-green-400 font-bold">${payment.amount.toLocaleString()}</span></p>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-green-400" />
                          Transferencia
                        </h4>
                        <div className="bg-black/30 rounded-lg p-4 text-sm space-y-1">
                          <p><span className="text-white/40">Titular origen:</span> {payment.sender_name}</p>
                          <p><span className="text-white/40">CBU origen:</span> <span className="font-mono">{payment.sender_cbu}</span></p>
                          <p><span className="text-white/40">Fecha:</span> {payment.date}</p>
                          <p><span className="text-white/40">Notas:</span> {payment.notes || '-'}</p>
                        </div>
                      </div>
                    </div>
                    
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
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'config' && (
            <div className="space-y-6">
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-yellow-400 text-sm font-medium">Configuración de Cuenta Bancaria</p>
                    <p className="text-white/60 text-xs mt-1">Estos datos se mostrarán a los usuarios para realizar transferencias.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-white/60 text-sm">Alias</Label>
                  <Input
                    value={config.alias}
                    onChange={(e) => setConfig({ ...config, alias: e.target.value })}
                    className="mt-1 bg-white/5 border-white/10 text-white font-mono"
                  />
                </div>

                <div>
                  <Label className="text-white/60 text-sm">CBU/CVU</Label>
                  <div className="relative">
                    <Input
                      type={showCbu ? 'text' : 'password'}
                      value={config.cbu}
                      onChange={(e) => setConfig({ ...config, cbu: e.target.value })}
                      className="mt-1 bg-white/5 border-white/10 text-white font-mono pr-10"
                      maxLength={22}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCbu(!showCbu)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                    >
                      {showCbu ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <Label className="text-white/60 text-sm">Titular</Label>
                  <Input
                    value={config.accountName}
                    onChange={(e) => setConfig({ ...config, accountName: e.target.value })}
                    className="mt-1 bg-white/5 border-white/10 text-white"
                  />
                </div>

                <div>
                  <Label className="text-white/60 text-sm">Banco</Label>
                  <Input
                    value={config.bankName}
                    onChange={(e) => setConfig({ ...config, bankName: e.target.value })}
                    className="mt-1 bg-white/5 border-white/10 text-white"
                  />
                </div>
              </div>

              <Button 
                onClick={saveConfig}
                className="w-full bg-green-500 hover:bg-green-600 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                Guardar Configuración
              </Button>
            </div>
          )}

          {activeTab === 'support' && (
            <div className="space-y-6">
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <MessageSquare className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-blue-400 text-sm font-medium">Centro de Soporte</p>
                    <p className="text-white/60 text-xs mt-1">Gestioná mensajes de clientes y solicitudes de cambio de número.</p>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-white font-medium mb-4 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-blue-400" />
                    Mensajes de Clientes ({supportMessages.length})
                  </h4>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {supportMessages.length === 0 ? (
                      <div className="bg-black/30 rounded-lg p-4 text-sm text-white/70">
                        <p className="mb-2">No hay mensajes pendientes</p>
                        <p className="text-xs">Los mensajes de los clientes aparecerán aquí.</p>
                      </div>
                    ) : (
                      supportMessages.map((msg) => (
                        <div key={msg.id} className="bg-black/30 rounded-lg p-4 text-sm">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="text-white font-medium">{msg.user?.full_name || 'N/A'}</p>
                              <p className="text-white/60 text-xs">{msg.user?.dni || 'N/A'}</p>
                            </div>
                            <span className="text-xs text-white/50">
                              {new Date(msg.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-white/80 mb-2 font-medium">{msg.subject}</p>
                          <p className="text-white/60 text-xs">{msg.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-white font-medium mb-4 flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-cyan-400" />
                    Cambios de Número ({numberChanges.length})
                  </h4>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {numberChanges.length === 0 ? (
                      <div className="bg-black/30 rounded-lg p-4 text-sm text-white/70">
                        <p className="mb-2">No hay solicitudes pendientes</p>
                        <p className="text-xs">Las solicitudes de cambio aparecerán aquí.</p>
                      </div>
                    ) : (
                      numberChanges.map((change) => (
                        <div key={change.id} className="bg-black/30 rounded-lg p-4 text-sm">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="text-white font-medium">{change.user?.full_name || 'N/A'}</p>
                              <p className="text-white/60 text-xs">{change.user?.dni || 'N/A'}</p>
                            </div>
                            <span className="text-xs text-white/50">
                              {new Date(change.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-white/80">
                            <span className="text-red-400">#{change.old_number}</span>
                            <RefreshCw className="w-3 h-3" />
                            <span className="text-green-400">#{change.new_number}</span>
                            <span className="text-white/60">Sala {change.room_id}</span>
                          </div>
                          {change.reason && (
                            <p className="text-white/60 text-xs mt-1">Motivo: {change.reason}</p>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-4">
                <h4 className="text-white font-medium mb-3">Acciones Disponibles</h4>
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    onClick={() => alert('Función de respuesta de mensajes en desarrollo')}
                    className="bg-blue-500 hover:bg-blue-600 text-white text-sm"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Responder Mensajes
                  </Button>
                  <Button 
                    onClick={() => alert('Función de gestión de cambios en desarrollo')}
                    className="bg-cyan-500 hover:bg-cyan-600 text-white text-sm"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Gestionar Cambios
                  </Button>
                  <Button 
                    onClick={() => alert('Función de historial en desarrollo')}
                    className="bg-purple-500 hover:bg-purple-600 text-white text-sm"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Historial
                  </Button>
                  <Button 
                    onClick={() => alert('Notificaciones automáticas activas')}
                    className="bg-green-500 hover:bg-green-600 text-white text-sm"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Notificaciones
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export function usePaymentConfig(): PaymentConfig {
  const [config, setConfig] = useState<PaymentConfig>({
    alias: 'rifaflash.bis',
    cbu: '0000003100000001234567',
    accountName: 'RifaFlash',
    bankName: 'Ualá Bis'
  });

  useEffect(() => {
    const saved = localStorage.getItem('rifaflash_admin_config');
    if (saved) setConfig(JSON.parse(saved));
  }, []);

  return config;
}