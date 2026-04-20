import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Clock, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface FinalRaffleProps {
  isOpen: boolean;
  occupiedNumbers: number[];
  roomName: string;
  roomColor: string;
  onComplete: (winnerNumber: number) => void;
  onClose: () => void;
}

export function FinalRaffle({
  isOpen,
  occupiedNumbers,
  roomName,
  roomColor,
  onComplete,
  onClose
}: FinalRaffleProps) {
  const [countdown, setCountdown] = useState(10);
  const [isSpinning, setIsSpinning] = useState(false);
  const [displayNumber, setDisplayNumber] = useState<number | null>(null);
  const [winner, setWinner] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setCountdown(10);
      setIsSpinning(false);
      setDisplayNumber(null);
      setWinner(null);
      return;
    }

    // Conteo regresivo de 10 segundos
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          startRaffle();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, [isOpen]);

  const startRaffle = () => {
    setIsSpinning(true);
    
    // Girar ruleta por 5 segundos
    let iterations = 0;
    const maxIterations = 50;
    let currentSpeed = 50;

    const spin = () => {
      const randomIndex = Math.floor(Math.random() * occupiedNumbers.length);
      setDisplayNumber(occupiedNumbers[randomIndex]);
      
      iterations++;
      
      // Aumentar velocidad al final
      if (iterations > maxIterations - 15) {
        currentSpeed += 20;
      }
      
      if (iterations < maxIterations) {
        setTimeout(spin, currentSpeed);
      } else {
        // FIN DEL SORTEO
        const winnerIndex = Math.floor(Math.random() * occupiedNumbers.length);
        const winnerNumber = occupiedNumbers[winnerIndex];
        
        setDisplayNumber(winnerNumber);
        setWinner(winnerNumber);
        setIsSpinning(false);
        
        // Efecto de confeti
        const duration = 5000;
        const end = Date.now() + duration;
        
        const frame = () => {
          confetti({
            particleCount: 8,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: [roomColor, '#fbbf24', '#ffffff', '#22c55e']
          });
          confetti({
            particleCount: 8,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: [roomColor, '#fbbf24', '#ffffff', '#22c55e']
          });
          
          if (Date.now() < end) {
            requestAnimationFrame(frame);
          }
        };
        frame();
        
        // Notificar ganador después de 3 segundos
        setTimeout(() => {
          onComplete(winnerNumber);
        }, 3000);
      }
    };
    
    spin();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full mb-4"
            style={{ backgroundColor: `${roomColor}30`, border: `2px solid ${roomColor}` }}
          >
            <Trophy className="w-6 h-6 text-yellow-400" />
            <span className="font-bold text-xl" style={{ color: roomColor }}>
              {roomName}
            </span>
          </motion.div>
          
          <h2 className="text-4xl font-display text-white mb-2">
            🎉 ¡Sala Completa! 🎉
          </h2>
          <p className="text-white/60 text-lg">
            Se vendieron todos los números. ¡Preparate para el sorteo!
          </p>
        </div>

        {/* Conteo o Ruleta */}
        <div className="relative">
          <AnimatePresence mode="wait">
            {!isSpinning && !winner ? (
              /* Conteo Regresivo */
              <motion.div
                key="countdown"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.5 }}
                className="text-center"
              >
                <div className="mb-4">
                  <Clock className="w-16 h-16 text-yellow-400 mx-auto animate-pulse" />
                </div>
                <motion.div
                  key={countdown}
                  initial={{ scale: 1.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  className="text-9xl font-display"
                  style={{ 
                    color: countdown <= 3 ? '#ef4444' : '#fbbf24',
                    textShadow: `0 0 60px ${countdown <= 3 ? '#ef4444' : '#fbbf24'}`
                  }}
                >
                  {countdown}
                </motion.div>
                <p className="text-white/50 text-xl mt-4">
                  El sorteo comienza en...
                </p>
              </motion.div>
            ) : (
              /* Ruleta Girando */
              <motion.div
                key="roulette"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center"
              >
                <div 
                  className="relative mx-auto mb-8 p-12 rounded-3xl border-4"
                  style={{ 
                    background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 100%)',
                    borderColor: roomColor,
                    boxShadow: `0 0 80px ${roomColor}60`,
                    maxWidth: '400px'
                  }}
                >
                  {/* Luces */}
                  <div className="absolute -top-3 left-0 right-0 flex justify-between px-6">
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: i % 2 === 0 ? '#fbbf24' : '#ef4444' }}
                        animate={{
                          opacity: [1, 0.3, 1],
                          scale: [1, 1.3, 1]
                        }}
                        transition={{
                          duration: 0.4,
                          repeat: Infinity,
                          delay: i * 0.08
                        }}
                      />
                    ))}
                  </div>

                  {/* Número */}
                  <motion.div
                    animate={isSpinning ? {
                      scale: [1, 1.1, 1],
                    } : {}}
                    transition={{ duration: 0.1, repeat: Infinity }}
                    className="text-9xl font-display"
                    style={{
                      color: winner ? '#22c55e' : '#ffffff',
                      textShadow: winner 
                        ? '0 0 40px #22c55e, 0 0 80px #22c55e'
                        : `0 0 40px ${roomColor}, 0 0 80px ${roomColor}`
                    }}
                  >
                    {displayNumber?.toString().padStart(2, '0') || '00'}
                  </motion.div>

                  {isSpinning && (
                    <motion.div
                      className="absolute inset-0 flex items-center justify-center"
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ duration: 0.15, repeat: Infinity }}
                    >
                      <Sparkles className="w-24 h-24 text-yellow-400" />
                    </motion.div>
                  )}
                </div>

                <motion.p
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="text-2xl font-bold"
                  style={{ color: roomColor }}
                >
                  {winner ? '¡TENEMOS GANADOR!' : 'SORTEANDO...'}
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Info de participantes */}
        <div className="mt-8 text-center">
          <p className="text-white/40">
            Participantes: <span className="text-white">{occupiedNumbers.length}</span> números
          </p>
        </div>
      </motion.div>
    </div>
  );
}
