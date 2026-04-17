import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { 
  Trophy, 
  Sparkles, 
  Crown,
  X,
  RotateCcw,
  User
} from 'lucide-react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
} from './ui/dialog';
import { Winner } from '../types';

interface WinnerAnimationProps {
  isOpen: boolean;
  onClose: () => void;
  winner: Winner | null;
  onReset: () => void;
}

export function WinnerAnimation({ isOpen, onClose, winner, onReset }: WinnerAnimationProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentNumber, setCurrentNumber] = useState<number | null>(null);
  const [showWinner, setShowWinner] = useState(false);

  useEffect(() => {
    if (isOpen && winner && !isAnimating && !showWinner) {
      startAnimation();
    }
  }, [isOpen, winner]);

  const startAnimation = () => {
    setIsAnimating(true);
    setShowWinner(false);
    
    let iterations = 0;
    const maxIterations = 40;
    const interval = setInterval(() => {
      setCurrentNumber(Math.floor(Math.random() * 50) + 1);
      iterations++;
      
      if (iterations >= maxIterations) {
        clearInterval(interval);
        setCurrentNumber(winner?.number || 0);
        setIsAnimating(false);
        setShowWinner(true);
        
        // Confeti
        const duration = 4000;
        const end = Date.now() + duration;
        const frame = () => {
          confetti({
            particleCount: 4,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#7c3aed', '#fbbf24', '#ffffff', '#a855f7']
          });
          confetti({
            particleCount: 4,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#7c3aed', '#fbbf24', '#ffffff', '#a855f7']
          });
          if (Date.now() < end) requestAnimationFrame(frame);
        };
        frame();
      }
    }, 80);
  };

  const handleReset = () => {
    setShowWinner(false);
    setCurrentNumber(null);
    onReset();
    onClose();
  };

  if (!winner) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-gradient-to-b from-[#1a0a3e] to-[#0f0518] border-gold/30 overflow-hidden">
        <button onClick={onClose} className="absolute right-4 top-4 p-2 rounded-full hover:bg-white/10">
          <X className="w-5 h-5 text-white/60" />
        </button>

        <div className="py-8 text-center">
          <AnimatePresence mode="wait">
            {!showWinner ? (
              <motion.div key="animating" className="space-y-6">
                <motion.div animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }} transition={{ duration: 0.5, repeat: Infinity }}
                  className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center"
                >
                  <Trophy className="w-12 h-12 text-black" />
                </motion.div>

                <div className="space-y-2">
                  <p className="text-white/60 text-lg">Seleccionando ganador...</p>
                  <motion.div className="text-8xl font-display text-gradient-gold"
                    animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 0.1 }}
                  >
                    {currentNumber?.toString().padStart(2, '0') || '00'}
                  </motion.div>
                </div>
              </motion.div>
            ) : (
              <motion.div key="winner" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} className="space-y-5"
              >
                <motion.div initial={{ y: -50 }} animate={{ y: 0 }} className="flex items-center justify-center gap-2"
                >
                  <Crown className="w-8 h-8 text-gold" />
                  <span className="text-2xl font-display text-gradient-gold">¡GANADOR {winner.roomName}!</span>
                  <Crown className="w-8 h-8 text-gold" />
                </motion.div>

                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-gold/20 blur-3xl rounded-full" />
                  <div className="relative mx-auto w-32 h-32 rounded-full bg-gradient-to-br from-gold via-gold-light to-gold-dark flex items-center justify-center shadow-2xl border-4 border-gold/30"
                  >
                    <span className="text-6xl font-display text-black">
                      {winner.number.toString().padStart(2, '0')}
                    </span>
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-2"
                >
                  <p className="text-white/60">¡Felicitaciones! 🎉</p>
                  
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <p className="text-xl font-medium text-white">{winner.playerName}</p>
                    <div className="flex items-center justify-center gap-4 text-sm text-white/40 mt-2">
                      <span className="flex items-center gap-1"><User className="w-3 h-3" />{winner.playerDNI}</span>
                    </div>
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-2"
                >
                  <div className="bg-gradient-to-r from-gold/20 to-gold/5 rounded-xl p-5 border border-gold/30"
                  >
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Sparkles className="w-5 h-5 text-gold" />
                      <span className="text-gold-light text-sm font-medium">PREMIO GANADO</span>
                      <Sparkles className="w-5 h-5 text-gold" />
                    </div>
                    
                    <p className="text-5xl font-display text-gradient-gold">${winner.prize.toLocaleString()}</p>
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-4"
                >
                  <Button onClick={handleReset} variant="outline" className="gap-2 border-gold/50 text-gold hover:bg-gold/20"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Nueva Rifa
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}