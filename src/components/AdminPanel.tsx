import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Save, CheckCircle2, XCircle, AlertCircle, Eye, EyeOff, LogOut, Banknote, Users, TrendingUp } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { supabase } from '../services/supabase';

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
  const [activeTab, setActiveTab] = useState<'payments' | 'config'>('payments');
  const [config, setConfig] = useState<PaymentConfig>({
    alias: 'rifaflash.bis',
    cbu: '0000003100000001234567',
    accountName: 'RifaFlash',
    bankName: 'Ualá Bis'
  });
  const [payments, setPayments] = useState<PendingPayment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCbu, setShowCbu] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('rifaflash_admin_config');
    if (saved) setConfig(JSON.parse(saved));
    loadPayments();
  }, []);

  const loadPayments = async () => {
    const { data } = await supabase
      .from('payments')
      .select(`
        *,
        user:users(full_name, dni)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    
    if (data) {
      setPayments(data.map((p: any) => ({
        id: p.id,
        user_name: p.user?.full_name,
        user_dni: p.user?.dni,
        room_name: p.room_id,
        number: p.number,
        amount: p.amount,
        sender_name: p.sender_name || '',
        sender_cbu: p.sender_cbu || '',
        date: p.date,
        notes: p.notes,
        created_at: p.created_at
      })));
    }
  };

  const saveConfig = () => {
    localStorage.setItem('rifaflash_admin_config', JSON.stringify(config));
    alert('Configuración guardada');
  };

  const approvePayment = async (paymentId: string) => {
    await supabase
      .from('payments')
      .update({ status: 'approved', verified_at: new Date().toISOString() })
      .eq('id', paymentId);
    
    await loadPayments();
    alert('Pago aprobado');
  };

  const rejectPayment = async (paymentId: string) => {
    await supabase
      .from('payments')
      .update({ status: 'rejected' })
      .eq('id', paymentId);
    
    await loadPayments();
    alert('Pago rechazado');
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