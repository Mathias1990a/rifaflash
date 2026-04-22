import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, RefreshCw, Send, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { supabase } from '../services/supabase';

interface SupportSectionProps {
  user: any;
  userNumbers: any[];
}

export function SupportSection({ user, userNumbers }: SupportSectionProps) {
  const [activeTab, setActiveTab] = useState<'message' | 'change'>('message');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Estado para mensaje de soporte
  const [messageData, setMessageData] = useState({
    subject: '',
    message: ''
  });

  // Estado para cambio de número
  const [changeData, setChangeData] = useState({
    roomId: '',
    oldNumber: '',
    newNumber: '',
    reason: ''
  });

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageData.subject || !messageData.message) {
      setError('Por favor completá todos los campos');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const { data, error } = await supabase
        .rpc('create_support_message', {
          p_user_id: user.id,
          p_subject: messageData.subject,
          p_message: messageData.message,
          p_type: 'inquiry'
        });

      if (error) throw error;

      setSuccess('Mensaje enviado correctamente. Te responderemos a la brevedad.');
      setMessageData({ subject: '', message: '' });
    } catch (err) {
      setError('Error al enviar el mensaje. Intentá de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNumberChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!changeData.roomId || !changeData.oldNumber || !changeData.newNumber) {
      setError('Por favor completá todos los campos');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const { data, error } = await supabase
        .rpc('request_number_change', {
          p_user_id: user.id,
          p_room_id: changeData.roomId,
          p_old_number: parseInt(changeData.oldNumber),
          p_new_number: parseInt(changeData.newNumber),
          p_reason: changeData.reason || null
        });

      if (error) throw error;

      setSuccess('Solicitud de cambio enviada. El admin la revisará y te notificará.');
      setChangeData({ roomId: '', oldNumber: '', newNumber: '', reason: '' });
    } catch (err: any) {
      setError(err.message || 'Error al solicitar el cambio. Intentá de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-2xl p-6 border-2 border-blue-500/30 bg-gradient-to-r from-blue-500/10 to-cyan-500/10">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Soporte</h3>
            <p className="text-sm text-white/70">Envianos un mensaje o solicitá un cambio</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border border-white/20 rounded-xl overflow-hidden">
          <button
            onClick={() => setActiveTab('message')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'message'
                ? 'bg-blue-500/20 text-blue-400 border-r border-white/20'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <MessageSquare className="w-4 h-4 inline mr-2" />
            Enviar Mensaje
          </button>
          <button
            onClick={() => setActiveTab('change')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'change'
                ? 'bg-blue-500/20 text-blue-400'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <RefreshCw className="w-4 h-4 inline mr-2" />
            Cambiar Número
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-green-400 text-sm">
            {success}
          </div>
        )}

        {/* Tab Content */}
        <div>
          {activeTab === 'message' ? (
            <form onSubmit={handleSendMessage} className="space-y-4">
              <div>
                <label className="text-white/60 text-sm block mb-2">Asunto</label>
                <Input
                  value={messageData.subject}
                  onChange={(e) => setMessageData({ ...messageData, subject: e.target.value })}
                  placeholder="Consulta sobre mi compra, problema técnico, etc."
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>

              <div>
                <label className="text-white/60 text-sm block mb-2">Mensaje</label>
                <textarea
                  value={messageData.message}
                  onChange={(e) => setMessageData({ ...messageData, message: e.target.value })}
                  placeholder="Describinos tu consulta en detalle..."
                  rows={4}
                  className="w-full bg-white/10 border border-white/20 text-white rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white"
              >
                <Send className="w-4 h-4 mr-2" />
                {isLoading ? 'Enviando...' : 'Enviar Mensaje'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleNumberChange} className="space-y-4">
              <div>
                <label className="text-white/60 text-sm block mb-2">Sala</label>
                <select
                  value={changeData.roomId}
                  onChange={(e) => setChangeData({ ...changeData, roomId: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="">Seleccioná una sala</option>
                  {userNumbers.map((num: any) => (
                    <option key={num.room_id} value={num.room_id}>
                      Sala {num.room_id} - Número #{num.number}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-white/60 text-sm block mb-2">Número Actual</label>
                  <Input
                    value={changeData.oldNumber}
                    onChange={(e) => setChangeData({ ...changeData, oldNumber: e.target.value })}
                    placeholder="Ej: 25"
                    type="number"
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
                <div>
                  <label className="text-white/60 text-sm block mb-2">Número Nuevo</label>
                  <Input
                    value={changeData.newNumber}
                    onChange={(e) => setChangeData({ ...changeData, newNumber: e.target.value })}
                    placeholder="Ej: 30"
                    type="number"
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-white/60 text-sm block mb-2">Motivo (opcional)</label>
                <textarea
                  value={changeData.reason}
                  onChange={(e) => setChangeData({ ...changeData, reason: e.target.value })}
                  placeholder="¿Por qué necesitás cambiar el número?"
                  rows={3}
                  className="w-full bg-white/10 border border-white/20 text-white rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                {isLoading ? 'Enviando...' : 'Solicitar Cambio'}
              </Button>
            </form>
          )}
        </div>

        {/* Info */}
        <div className="bg-black/20 rounded-xl p-4">
          <p className="text-sm text-white/60">
            <strong>Tiempo de respuesta:</strong> Generalmente respondemos dentro de las 24 horas.
            Los cambios de número están sujetos a disponibilidad y aprobación del administrador.
          </p>
        </div>
      </div>
    </div>
  );
}
