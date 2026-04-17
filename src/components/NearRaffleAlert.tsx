import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Trophy, Clock, Zap } from 'lucide-react';
import { Button } from './ui/button';

interface NearRaffleAlertProps {
  remainingNumbers: number;
  isVisible: boolean;
  onClose: () => void;
}

export function NearRaffleAlert({ remainingNumbers, isVisible, onClose }: NearRaffleAlertProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => setProgress((50 - remainingNumbers) / 50 * 100), 300);
      return () => clearTimeout(timer);
    }
  }, [isVisible, remainingNumbers]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="w-full max-w-md bg-gradient-to-b from-[#1a0a3e] to-[#0f0518] rounded-2xl border-2 border-yellow-400/50 shadow-2xl overflow-hidden"
        >
          {/* Header con animación de pulso */}
          <div className="relative bg-gradient-to-r from-yellow-400/20 via-yellow-500/20 to-yellow-400/20 p-6">
            <motion.div
              animate={{ 
                boxShadow: ['0 0 20px rgba(251, 191, 36, 0.3)', '0 0 40px rgba(251, 191, 36, 0.5)', '0 0 20px rgba(251, 191, 36, 0.3)']
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0"
            />
            
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
                >
                  <AlertTriangle className="w-10 h-10 text-yellow-400" />
                </motion.div>
                <div>
                  <h2 className="text-2xl font-display text-yellow-400">¡Sorteo Cercano! 🔥</h2>
                  <p className="text-sm text-white/70">¡No te quedes afuera!</p>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Contador grande */}
            <div className="text-center">
              <p className="text-white/60 mb-2">Solo quedan</p>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-lg shadow-yellow-400/30"
              >
                <span className="text-5xl font-display text-black">{remainingNumbers}</span>
              </motion.div>
              <p className="text-white/60 mt-2">números disponibles</p>
            </div>

            {/* Barra de progreso */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/60">Progreso</span>
                <span className="text-yellow-400 font-medium">{50 - remainingNumbers}/50 vendidos</span>
              </div>
              
              <div className="h-4 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full"
                />
              </div>
              
              <p className="text-center text-sm text-white/50">
                {progress.toFixed(0)}% completado
              </p>
            </div>

            {/* Info del premio */}
            <div className="bg-gradient-to-r from-yellow-400/10 to-yellow-500/5 rounded-xl p-4 border border-yellow-400/20">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <span className="text-yellow-400 font-medium">PREMIO</span>
                <Trophy className="w-5 h-5 text-yellow-400" />
              </div>
              <p className="text-4xl font-display text-center text-gradient-gold">$100.000</p>
            </div>

            {/* Urgencia */}
            <div className="flex items-center gap-3 bg-red-500/10 rounded-lg p-3 border border-red-500/20">
              <Clock className="w-5 h-5 text-red-400" />
              <p className="text-sm text-white/80">
                <span className="text-red-400 font-medium">¡Apurate!</span> El sorteo se realizará en cuanto se vendan los últimos números.
              </p>
            </div>

            {/* Botones */}
            <div className="flex gap-3">
              <Button 
                onClick={onClose}
                className="flex-1 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold hover:from-yellow-300 hover:to-yellow-500"
              >
                <Zap className="w-4 h-4 mr-2" />
                Comprar número
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}