import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { Sparkles, Volume2, VolumeX, RotateCcw, Trophy, Dices } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Button } from './ui/button';

interface CasinoBolilleroProps {
  availableNumbers: number[]; // Solo números disponibles
  totalNumbers: number;
  onNumberSelected: (number: number) => void;
  roomColor?: string;
  roomName?: string;
}

export function CasinoBolillero({
  availableNumbers,
  totalNumbers,
  onNumberSelected,
  roomColor = '#7c3aed',
  roomName = 'Sala'
}: CasinoBolilleroProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [displayNumber, setDisplayNumber] = useState<number | null>(null);
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [spinCount, setSpinCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showRoulette, setShowRoulette] = useState(false);
  
  const controls = useAnimation();
  const spinIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Sonidos (simulados con Web Audio API)
  const playTickSound = useCallback(() => {
    if (!soundEnabled) return;
    
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800 + Math.random() * 400;
    oscillator.type = 'square';
    gainNode.gain.value = 0.05;
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.05);
  }, [soundEnabled]);

  const playWinSound = useCallback(() => {
    if (!soundEnabled) return;
    
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Sonido de victoria
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C, E, G, C
    notes.forEach((freq, i) => {
      setTimeout(() => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = freq;
        oscillator.type = 'sine';
        gainNode.gain.value = 0.1;
        
        oscillator.start();
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        oscillator.stop(audioContext.currentTime + 0.5);
      }, i * 100);
    });
  }, [soundEnabled]);

  const startSpin = async () => {
    if (availableNumbers.length === 0 || isSpinning) return;
    
    setIsSpinning(true);
    setSelectedNumber(null);
    setShowRoulette(true);
    setSpinCount(prev => prev + 1);
    
    // Animación de entrada
    await controls.start({
      scale: [1, 1.1, 1],
      rotate: [0, 360],
      transition: { duration: 0.5 }
    });

    // Girar ruleta
    let iterations = 0;
    const maxIterations = 30 + Math.floor(Math.random() * 20);
    let currentSpeed = 80;

    const spin = () => {
      const randomIndex = Math.floor(Math.random() * availableNumbers.length);
      setDisplayNumber(availableNumbers[randomIndex]);
      playTickSound();
      
      iterations++;
      
      // Aumentar velocidad al final
      if (iterations > maxIterations - 10) {
        currentSpeed += 30;
      }
      
      if (iterations < maxIterations) {
        setTimeout(spin, currentSpeed);
      } else {
        // FIN DEL SORTEO
        const winnerIndex = Math.floor(Math.random() * availableNumbers.length);
        const winner = availableNumbers[winnerIndex];
        
        setDisplayNumber(winner);
        setSelectedNumber(winner);
        setIsSpinning(false);
        playWinSound();
        
        // Efecto de confeti
        const duration = 3000;
        const end = Date.now() + duration;
        
        const frame = () => {
          confetti({
            particleCount: 5,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: [roomColor, '#fbbf24', '#ffffff']
          });
          confetti({
            particleCount: 5,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: [roomColor, '#fbbf24', '#ffffff']
          });
          
          if (Date.now() < end) {
            requestAnimationFrame(frame);
          }
        };
        frame();
        
        // Notificar selección
        setTimeout(() => {
          onNumberSelected(winner);
        }, 2000);
      }
    };
    
    spin();
  };

  const reset = () => {
    setSelectedNumber(null);
    setDisplayNumber(null);
    setShowRoulette(false);
    if (spinIntervalRef.current) {
      clearInterval(spinIntervalRef.current);
    }
  };

  useEffect(() => {
    return () => {
      if (spinIntervalRef.current) {
        clearInterval(spinIntervalRef.current);
      }
    };
  }, []);

  const occupiedCount = totalNumbers - availableNumbers.length;
  const progress = (occupiedCount / totalNumbers) * 100;

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4"
          style={{ backgroundColor: `${roomColor}30`, border: `1px solid ${roomColor}50` }}
        >
          <Dices className="w-5 h-5" style={{ color: roomColor }} />
          <span className="font-medium" style={{ color: roomColor }}>
            {roomName}
          </span>
          <span className="text-white/60 text-sm">
            • {availableNumbers.length} disponibles
          </span>
        </motion.div>
        
        <h2 className="text-3xl font-display text-white mb-2">
          🎰 Probar Suerte
        </h2>
        <p className="text-white/50 text-sm">
          La ruleta elegirá un número disponible al azar
        </p>
      </div>

      {/* Barra de progreso */}
      <div className="mb-8">
        <div className="flex justify-between text-xs text-white/40 mb-2">
          <span>Ocupados: {occupiedCount}</span>
          <span>Disponibles: {availableNumbers.length}</span>
        </div>
        <div className="h-3 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: roomColor }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1 }}
          />
        </div>
      </div>

      {/* Máquina de casino */}
      <div className="relative mb-8">
        {/* Marco exterior */}
        <div 
          className="relative p-8 rounded-3xl border-4"
          style={{ 
            background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 100%)',
            borderColor: roomColor,
            boxShadow: `0 0 60px ${roomColor}40, inset 0 0 60px rgba(0,0,0,0.5)`
          }}
        >
          {/* Luces parpadeantes */}
          <div className="absolute -top-2 left-0 right-0 flex justify-between px-4">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: i % 2 === 0 ? '#fbbf24' : '#ef4444' }}
                animate={{
                  opacity: [1, 0.3, 1],
                  scale: [1, 1.2, 1]
                }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  delay: i * 0.1
                }}
              />
            ))}
          </div>

          {/* Pantalla de la ruleta */}
          <div className="relative bg-black rounded-2xl p-8 border-4 border-gray-800">
            {/* Reflejo */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl pointer-events-none" />
            
            {/* Número */}
            <AnimatePresence mode="wait">
              {showRoulette ? (
                <motion.div
                  key="roulette"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="relative"
                >
                  <motion.div
                    animate={isSpinning ? {
                      scale: [1, 1.05, 1],
                      rotate: [0, 5, -5, 0]
                    } : {}}
                    transition={{ duration: 0.1, repeat: isSpinning ? Infinity : 0 }}
                    className="text-8xl font-display text-center"
                    style={{
                      color: isSpinning ? '#ffffff' : selectedNumber ? '#fbbf24' : '#ffffff',
                      textShadow: isSpinning 
                        ? `0 0 30px ${roomColor}, 0 0 60px ${roomColor}`
                        : selectedNumber
                          ? '0 0 30px #fbbf24, 0 0 60px #fbbf24'
                          : 'none'
                    }}
                  >
                    {displayNumber?.toString().padStart(2, '0') || '00'}
                  </motion.div>
                  
                  {isSpinning && (
                    <motion.div
                      className="absolute inset-0 flex items-center justify-center"
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ duration: 0.2, repeat: Infinity }}
                    >
                      <Sparkles className="w-16 h-16 text-yellow-400" />
                    </motion.div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="placeholder"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-6xl font-display text-center text-white/20"
                >
                  ?
                </motion.div>
              )}
            </AnimatePresence>

            {/* Indicador */}
            {isSpinning && (
              <motion.div
                className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2"
                animate={{ y: [0, 5, 0] }}
                transition={{ duration: 0.3, repeat: Infinity }}
              >
                <div 
                  className="w-0 h-0 border-l-8 border-r-8 border-t-12 border-transparent"
                  style={{ borderTopColor: '#fbbf24' }}
                />
              </motion.div>
            )}
          </div>

          {/* Botón de sonido */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white/60 hover:text-white transition-colors"
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
        </div>

        {/* Sombra */}
        <div 
          className="absolute -bottom-4 left-4 right-4 h-8 rounded-full blur-xl -z-10"
          style={{ backgroundColor: `${roomColor}40` }}
        />
      </div>

      {/* Resultado */}
      <AnimatePresence>
        {selectedNumber && !isSpinning && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center mb-6"
          >
            <div 
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full mb-4"
              style={{ backgroundColor: '#fbbf24', color: '#000' }}
            >
              <Trophy className="w-5 h-5" />
              <span className="font-bold text-lg">
                ¡Número {selectedNumber.toString().padStart(2, '0')} seleccionado!
              </span>
            </div>
            <p className="text-white/60 text-sm">
              Serás redirigido al pago...
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controles */}
      <div className="flex justify-center gap-4">
        {!selectedNumber ? (
          <Button
            onClick={startSpin}
            disabled={isSpinning || availableNumbers.length === 0}
            size="lg"
            className="gap-2 text-lg px-8 py-6"
            style={{
              background: isSpinning ? '#374151' : `linear-gradient(135deg, ${roomColor} 0%, ${roomColor}dd 100%)`,
              opacity: isSpinning || availableNumbers.length === 0 ? 0.5 : 1
            }}
          >
            <motion.div
              animate={isSpinning ? { rotate: 360 } : {}}
              transition={{ duration: 1, repeat: isSpinning ? Infinity : 0, ease: "linear" }}
            >
              <Dices className="w-6 h-6" />
            </motion.div>
            {isSpinning ? 'Girando...' : '¡Girar Ruleta!'}
          </Button>
        ) : (
          <Button
            onClick={reset}
            variant="outline"
            size="lg"
            className="gap-2 border-white/20 text-white hover:bg-white/10"
          >
            <RotateCcw className="w-5 h-5" />
            Probar Otra Vez
          </Button>
        )}
      </div>

      {/* Info */}
      <div className="mt-8 text-center">
        <p className="text-white/30 text-xs">
          La ruleta solo gira sobre los números disponibles
        </p>
      </div>
    </div>
  );
}

// Versión demo/probar
export function CasinoBolilleroDemo() {
  const [availableNumbers, setAvailableNumbers] = useState<number[]>(
    Array.from({ length: 15 }, (_, i) => i + 1)
  );
  const [lastSelected, setLastSelected] = useState<number | null>(null);

  const handleNumberSelected = (num: number) => {
    setLastSelected(num);
    // Simular que el número fue ocupado
    setTimeout(() => {
      setAvailableNumbers(prev => prev.filter(n => n !== num));
    }, 2000);
  };

  const reset = () => {
    setAvailableNumbers(Array.from({ length: 15 }, (_, i) => i + 1));
    setLastSelected(null);
  };

  return (
    <div className="bg-black/40 rounded-3xl p-8 border border-white/10">
      <CasinoBolillero
        availableNumbers={availableNumbers}
        totalNumbers={15}
        onNumberSelected={handleNumberSelected}
        roomColor="#ef4444"
        roomName="Sala VIP"
      />
      
      {availableNumbers.length === 0 && (
        <div className="text-center mt-6">
          <p className="text-white/60 mb-4">¡Todos los números han sido seleccionados!</p>
          <Button onClick={reset} variant="outline" className="border-white/20 text-white">
            <RotateCcw className="w-4 h-4 mr-2" />
            Reiniciar Demo
          </Button>
        </div>
      )}
    </div>
  );
}