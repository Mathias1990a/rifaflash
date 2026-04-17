import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Banknote, Copy, CheckCircle2, AlertCircle, Upload, FileText, User, CreditCard, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface PaymentSubmission {
  senderName: string;
  senderCbu: string;
  amount: number;
  date: string;
  notes?: string;
}

interface BankTransferPaymentProps {
  amount: number;
  alias: string;
  cbu: string;
  accountName: string;
  bankName: string;
  onPaymentSubmit: (paymentData: PaymentSubmission) => void;
}

export function BankTransferPayment({
  amount,
  alias,
  cbu,
  accountName,
  bankName,
  onPaymentSubmit
}: BankTransferPaymentProps) {
  const [step, setStep] = useState<'info' | 'form' | 'submitted'>('info');
  const [copiedAlias, setCopiedAlias] = useState(false);
  const [copiedCbu, setCopiedCbu] = useState(false);
  const [formData, setFormData] = useState<PaymentSubmission>({
    senderName: '',
    senderCbu: '',
    amount: amount,
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const copyToClipboard = (text: string, type: 'alias' | 'cbu') => {
    navigator.clipboard.writeText(text);
    if (type === 'alias') {
      setCopiedAlias(true);
      setTimeout(() => setCopiedAlias(false), 2000);
    } else {
      setCopiedCbu(true);
      setTimeout(() => setCopiedCbu(false), 2000);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onPaymentSubmit(formData);
    setStep('submitted');
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <AnimatePresence mode="wait">
        {step === 'info' && (
          <motion.div
            key="info"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                <Banknote className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Transferencia Bancaria</h3>
              <p className="text-white/60 text-sm">Realizá la transferencia y luego completá los datos</p>
            </div>

            <div className="bg-white/5 rounded-xl p-6 border border-white/10 space-y-4">
              <div className="text-center pb-4 border-b border-white/10">
                <p className="text-white/60 text-sm mb-1">Monto a transferir</p>
                <p className="text-3xl font-display text-green-400">${amount.toLocaleString()}</p>
              </div>

              <div>
                <Label className="text-white/60 text-sm">Alias</Label>
                <div className="flex gap-2 mt-1">
                  <div className="flex-1 bg-black/30 rounded-lg px-4 py-3 font-mono text-white">{alias}</div>
                  <Button variant="outline" size="icon" onClick={() => copyToClipboard(alias, 'alias')} className="border-white/20">
                    {copiedAlias ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div>
                <Label className="text-white/60 text-sm">CBU/CVU</Label>
                <div className="flex gap-2 mt-1">
                  <div className="flex-1 bg-black/30 rounded-lg px-4 py-3 font-mono text-white text-sm truncate">{cbu}</div>
                  <Button variant="outline" size="icon" onClick={() => copyToClipboard(cbu, 'cbu')} className="border-white/20">
                    {copiedCbu ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                <div>
                  <p className="text-white/40 text-xs">Titular</p>
                  <p className="text-white text-sm">{accountName}</p>
                </div>
                <div>
                  <p className="text-white/40 text-xs">Banco</p>
                  <p className="text-white text-sm">{bankName}</p>
                </div>
              </div>
            </div>

            <Button onClick={() => setStep('form')} className="w-full bg-green-500 hover:bg-green-600 text-white">
              Ya realicé la transferencia
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        )}

        {step === 'form' && (
          <motion.form
            key="form"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div className="flex items-center gap-2 mb-6">
              <button type="button" onClick={() => setStep('info')} className="text-white/60 hover:text-white text-sm">← Volver</button>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-yellow-400 text-sm font-medium">Importante</p>
                  <p className="text-white/60 text-xs mt-1">Completá los datos exactamente como aparecen en tu transferencia.</p>
                </div>
              </div>
            </div>

            <div>
              <Label className="text-white/60 text-sm">Nombre del titular de la cuenta origen</Label>
              <Input
                value={formData.senderName}
                onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
                placeholder="Juan Pérez"
                required
                className="mt-1 bg-white/5 border-white/10 text-white"
              />
            </div>

            <div>
              <Label className="text-white/60 text-sm">CBU/CVU de la cuenta origen</Label>
              <Input
                value={formData.senderCbu}
                onChange={(e) => setFormData({ ...formData, senderCbu: e.target.value })}
                placeholder="0000000000000000000000"
                maxLength={22}
                required
                className="mt-1 bg-white/5 border-white/10 text-white font-mono"
              />
              <p className="text-white/40 text-xs mt-1">22 dígitos de tu CBU</p>
            </div>

            <div>
              <Label className="text-white/60 text-sm">Monto transferido</Label>
              <Input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                required
                className="mt-1 bg-white/5 border-white/10 text-white"
              />
            </div>

            <div>
              <Label className="text-white/60 text-sm">Fecha de la transferencia</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
                className="mt-1 bg-white/5 border-white/10 text-white"
              />
            </div>

            <div>
              <Label className="text-white/60 text-sm">Notas adicionales (opcional)</Label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Número de referencia, etc."
                className="mt-1 w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder:text-white/30"
                rows={3}
              />
            </div>

            <Button type="submit" className="w-full bg-green-500 hover:bg-green-600 text-white mt-6">
              <Upload className="w-4 h-4 mr-2" />
              Enviar para verificación
            </Button>
          </motion.form>
        )}

        {step === 'submitted' && (
          <motion.div
            key="submitted"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">¡Datos enviados!</h3>
            <p className="text-white/60 mb-6">Verificaremos tu transferencia en las próximas horas.</p>
            <div className="bg-white/5 rounded-lg p-4 text-left text-sm">
              <p className="text-white/40">Datos enviados:</p>
              <p className="text-white mt-1"><strong>Titular:</strong> {formData.senderName}</p>
              <p className="text-white"><strong>CBU:</strong> {formData.senderCbu.slice(0, 8)}...{formData.senderCbu.slice(-4)}</p>
              <p className="text-white"><strong>Monto:</strong> ${formData.amount.toLocaleString()}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Panel de administración simplificado
interface PendingPayment {
  id: string;
  userName: string;
  userDni: string;
  number: number;
  amount: number;
  senderName: string;
  senderCbu: string;
  date: string;
  status: 'pending' | 'verified' | 'rejected';
}

interface AdminPaymentPanelProps {
  payments: PendingPayment[];
  onApprove: (paymentId: string) => void;
  onReject: (paymentId: string, reason: string) => void;
}

export function AdminPaymentPanel({ payments, onApprove, onReject }: AdminPaymentPanelProps) {
  const pendingPayments = payments.filter(p => p.status === 'pending');

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-display text-white">Panel de Verificación</h2>
        <div className="bg-yellow-500/20 text-yellow-400 px-4 py-2 rounded-full text-sm">{pendingPayments.length} pendientes</div>
      </div>

      {pendingPayments.length === 0 ? (
        <div className="text-center py-12 bg-white/5 rounded-xl">
          <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-4" />
          <p className="text-white/60">No hay pagos pendientes</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingPayments.map((payment) => (
            <div key={payment.id} className="bg-white/5 rounded-xl p-6 border border-white/10">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-white font-medium mb-2">Comprador</h4>
                  <div className="bg-black/30 rounded-lg p-4 text-sm">
                    <p><span className="text-white/40">Nombre:</span> {payment.userName}</p>
                    <p><span className="text-white/40">DNI:</span> {payment.userDni}</p>
                    <p><span className="text-white/40">Número:</span> <span className="text-yellow-400">#{payment.number}</span></p>
                    <p><span className="text-white/40">Monto:</span> <span className="text-green-400">${payment.amount.toLocaleString()}</span></p>
                  </div>
                </div>
                <div>
                  <h4 className="text-white font-medium mb-2">Transferencia</h4>
                  <div className="bg-black/30 rounded-lg p-4 text-sm">
                    <p><span className="text-white/40">Titular:</span> {payment.senderName}</p>
                    <p><span className="text-white/40">CBU:</span> {payment.senderCbu}</p>
                    <p><span className="text-white/40">Fecha:</span> {payment.date}</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6 pt-4 border-t border-white/10">
                <Button onClick={() => onApprove(payment.id)} className="flex-1 bg-green-500 hover:bg-green-600 text-white">
                  <CheckCircle2 className="w-4 h-4 mr-2" />Aprobar
                </Button>
                <Button onClick={() => onReject(payment.id, 'Datos incorrectos')} variant="outline" className="border-red-500/50 text-red-400">
                  Rechazar
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Datos de ejemplo
export const samplePendingPayments: PendingPayment[] = [
  {
    id: '1',
    userName: 'Juan Pérez',
    userDni: '35.456.789',
    number: 7,
    amount: 10000,
    senderName: 'Juan Pérez',
    senderCbu: '0000003100012345678901',
    date: '2024-01-15',
    status: 'pending'
  }
];