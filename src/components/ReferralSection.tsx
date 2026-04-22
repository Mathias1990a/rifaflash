import { useState } from 'react';
import { motion } from 'framer-motion';
import { Gift, Share2, Copy, CheckCircle, Users, TrendingUp } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface ReferralSectionProps {
  userReferralCode?: string;
  userName?: string;
  userBalance?: number;
}

export function ReferralSection({ userReferralCode, userName, userBalance = 0 }: ReferralSectionProps) {
  const [copied, setCopied] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);

  const referralMessage = `¡Hola! Soy ${userName || 'un amigo'} y te invito a participar en RafaFlash. \n\nRegistrate con mi código de referido: ${userReferralCode || ''}\n\nPodés ganar increíbles premios y yo recibo $3.000 por tu primera compra. ¡Ambos ganamos! \n\nRegistrate aquí: https://rapi-premio.vercel.app`;

  const copyReferralCode = () => {
    if (userReferralCode) {
      navigator.clipboard.writeText(userReferralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const copyReferralMessage = () => {
    navigator.clipboard.writeText(referralMessage);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 2000);
  };

  const shareReferral = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Invitación a RafaFlash',
        text: referralMessage,
        url: 'https://rapi-premio.vercel.app'
      });
    } else {
      copyReferralMessage();
    }
  };

  if (!userReferralCode) {
    return (
      <div className="rounded-2xl p-6 border-2 border-green-500/30 bg-gradient-to-r from-green-500/10 to-emerald-500/10">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
            <Gift className="w-6 h-6 text-green-400" />
          </div>
          <h3 className="text-lg font-bold text-white">¿Querés ganar $3.000?</h3>
          <p className="text-sm text-white/70">
            Tu código de referido está disponible. Compartilo con tus amigos y ganá $3.000 por cada primera compra.
          </p>
          <p className="text-xs text-white/50">
            Si no ves tu código, refrescá la página.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-6 border-2 border-green-500/30 bg-gradient-to-r from-green-500/10 to-emerald-500/10">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
              <Gift className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Referí y Ganá</h3>
              <p className="text-sm text-white/70">Ganá $3.000 por cada amigo</p>
            </div>
          </div>
          {userBalance > 0 && (
            <div className="text-right">
              <p className="text-xs text-white/50">Saldo disponible</p>
              <p className="text-lg font-bold text-green-400">${userBalance.toLocaleString()}</p>
            </div>
          )}
        </div>

        {/* Tu Código */}
        <div className="bg-black/30 rounded-xl p-4">
          <p className="text-sm text-white/60 mb-2">Tu código de referido</p>
          <div className="flex items-center gap-2">
            <Input
              value={userReferralCode}
              readOnly
              className="bg-white/10 border-white/20 text-green-400 font-mono text-lg text-center"
            />
            <Button
              onClick={copyReferralCode}
              variant="outline"
              size="sm"
              className="border-green-500/50 text-green-400 hover:bg-green-500/10"
            >
              {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
          {copied && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-green-400 mt-2"
            >
              ¡Código copiado!
            </motion.p>
          )}
        </div>

        {/* Cómo Funciona */}
        <div className="space-y-3">
          <h4 className="text-white font-medium flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            ¿Cómo funciona?
          </h4>
          <div className="space-y-2 text-sm text-white/70">
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs text-green-400">1</span>
              </div>
              <p>Compartí tu código con amigos</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs text-green-400">2</span>
              </div>
              <p>Se registren con tu código</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs text-green-400">3</span>
              </div>
              <p>Hagan su primera compra y la aprueben</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs text-green-400">4</span>
              </div>
              <p>¡Recibís $3.000 en tu saldo!</p>
            </div>
          </div>
        </div>

        {/* Botones de Compartir */}
        <div className="space-y-3">
          <Button
            onClick={shareReferral}
            className="w-full bg-green-500 hover:bg-green-600 text-white"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Compartir Referido
          </Button>
          
          <Button
            onClick={copyReferralMessage}
            variant="outline"
            className="w-full border-green-500/50 text-green-400 hover:bg-green-500/10"
          >
            <Copy className="w-4 h-4 mr-2" />
            {copiedMessage ? '¡Mensaje copiado!' : 'Copiar Mensaje'}
          </Button>
        </div>

        {/* Estadísticas */}
        <div className="bg-black/20 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-green-400" />
              <span className="text-sm text-white/60">Tus referidos</span>
            </div>
            <span className="text-sm font-bold text-green-400">0 amigos</span>
          </div>
        </div>
      </div>
    </div>
  );
}
