import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Sparkles, Play, RotateCcw } from 'lucide-react';
import { Button } from './ui/button';

interface BolilleroProps {
  totalNumbers: number;
  winningNumber: number | null;
  isDrawing: boolean;
  onStartDraw: () => void;
  onReset: () => void;
  roomColor?: string;
}

export function Bolillero({ 
  totalNumbers, 
  winningNumber, 
  isDrawing, 
  onStartDraw, 
  onReset,
  roomColor = '#7c3aed'
}: BolilleroProps) {
  const [displayNumber, setDisplayNumber] = useState<number | null>(null);
  const [history, setHistory] = useState<number[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isDrawing) {
      let iterations = 0;
      const maxIterations = 30 + Math.floor(Math.random() * 20); // 30-50 iteraciones
      
      intervalRef.current = setInterval(() => {
        const randomNum = Math.floor(Math.random() * totalNumbers) + 1;
        setDisplayNumber(randomNum);
        
        // Agregar al historial visual
        if (iterations % 3 === 0) {
          setHistory(prev => [randomNum, ...prev].slice(0, 5));
        }
        
        iterations++;
        
        if (iterations >= maxIterations) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          if (winningNumber) {
            setDisplayNumber(winningNumber);
            setHistory(prev => [winningNumber, ...prev].slice(0, 5));
          }
        }
      }, 80);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isDrawing, totalNumbers, winningNumber]);

  const getBallColor = (num: number, index: number) => {
    if (!isDrawing && num === winningNumber) {
      return 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-black shadow-lg shadow-yellow-400/50';
    }
    if (index === 0 && isDrawing) {
      return 'bg-white text-black shadow-lg';
    }
    return 'bg-white/10 text-white/60';
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Título */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Trophy className="w-5 h-5" style={{ color: roomColor }} />
          <h3 className="text-lg font-display text-white">Bolillero Virtual</h3>
        </div>
        <p className="text-white/50 text-sm">
          {totalNumbers} bolillas • Sorteo en vivo
        </p>
      </div>

      {/* Bola principal */}
      <div className="relative mb-8">
        {/* Efecto de brillo */}
        <div 
          className="absolute inset-0 blur-3xl opacity-30 rounded-full"
          style={{ backgroundColor: roomColor }}
        />
        
        {/* Bola */}
        <motion.div
          className="relative w-32 h-32 mx-auto rounded-full flex items-center justify-center"
          style={{
            background: isDrawing 
              ? 'linear-gradient(135deg, #ffffff 0%, #e5e7eb 100%)'
              : winningNumber 
                ? 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)'
                : `linear-gradient(135deg, ${roomColor} 0%, ${roomColor}dd 100%)`,
            boxShadow: isDrawing 
              ? '0 0 40px rgba(255,255,255,0.5), inset 0 -4px 10px rgba(0,0,0,0.2)'
              : winningNumber
                ? '0 0 50px rgba(251, 191, 36, 0.6), inset 0 -4px 10px rgba(0,0,0,0.2)'
                : `0 0 40px ${roomColor}50, inset 0 -4px 10px rgba(0,0,0,0.2)`
          }}
          animate={isDrawing ? {
            scale: [1, 1.05, 1],
            rotate: [0, 5, -5, 0]
          } : {}}
          transition={{ duration: 0.3, repeat: isDrawing ? Infinity : 0 }}
        >
          <span className={`text-5xl font-display ${
            isDrawing ? 'text-black' : winningNumber ? 'text-black' : 'text-white'
          }`}>
            {displayNumber?.toString().padStart(2, '0') || '00'}
          </span>
          
          {/* Brillo */}
          <div className="absolute top-4 left-4 w-8 h-8 rounded-full bg-white/30 blur-md" />
        </motion.div>

        {/* Número ganador destacado */}
        {winningNumber && !isDrawing && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -bottom-2 left-1/2 -translate-x-1/2"
          >
            <div className="bg-yellow-400 text-black px-4 py-1 rounded-full text-sm font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              ¡GANADOR!
            </div>
          </motion.div>
        )}
      </div>

      {/* Historial de números */}
      <AnimatePresence>
        {(history.length > 0 || isDrawing) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6"
          >
            <p className="text-white/40 text-xs text-center mb-3">Últimos números sorteados</p>
            
            <div className="flex justify-center gap-2">
              <AnimatePresence mode="popLayout">
                {history.map((num, index) => (
                  <motion.div
                    key={`${num}-${index}`}
                    layout
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${getBallColor(num, index)}`}
                  >
                    {num.toString().padStart(2, '0')}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controles */}
      <div className="flex justify-center gap-3">
        {!winningNumber ? (
          <Button
            onClick={onStartDraw}
            disabled={isDrawing}
            className="gap-2"
            style={{
              background: isDrawing ? '#374151' : roomColor,
              opacity: isDrawing ? 0.5 : 1
            }}
          >
            <Play className="w-4 h-4" />
            {isDrawing ? 'Sorteando...' : 'Iniciar Sorteo'}
          </Button>
        ) : (
          <Button
            onClick={onReset}
            variant="outline"
            className="gap-2 border-white/20 text-white hover:bg-white/10"
          >
            <RotateCcw className="w-4 h-4" />
            Nuevo Sorteo
          </Button>
        )}
      </div>

      {/* Info */}
      <div className="mt-6 text-center">
        <p className="text-white/30 text-xs">
          {totalNumbers === 50 && 'Sala Standard • 50 bolillas'}
          {totalNumbers === 25 && 'Sala Premium • 25 bolillas'}
          {totalNumbers === 15 && 'Sala VIP • 15 bolillas'}
        </p>
      </div>
    </div>
  );
}

// Componente de preview/demo del bolillero
export function BolilleroDemo() {
  const [isDrawing, setIsDrawing] = useState(false);
  const [winningNumber, setWinningNumber] = useState<number | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<50 | 25 | 15>(50);

  const handleStartDraw = () => {
    setIsDrawing(true);
    setWinningNumber(null);
    
    // Simular sorteo
    setTimeout(() => {
      const winner = Math.floor(Math.random() * selectedRoom) + 1;
      setWinningNumber(winner);
      setIsDrawing(false);
    }, 4000);
  };

  const handleReset = () => {
    setWinningNumber(null);
    setIsDrawing(false);
  };

  const rooms = [
    { id: 50, name: 'Standard', color: '#7c3aed' },
    { id: 25, name: 'Premium', color: '#f59e0b' },
    { id: 15, name: 'VIP', color: '#ef4444' }
  ];

  return (
    <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
      {/* Selector de sala */}
      <div className="flex justify-center gap-2 mb-6">
        {rooms.map(room => (
          <button
            key={room.id}
            onClick={() => {
              setSelectedRoom(room.id as 50 | 25 | 15);
              handleReset();
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedRoom === room.id
                ? 'text-white'
                : 'bg-white/5 text-white/50 hover:bg-white/10'
            }`}
            style={{
              backgroundColor: selectedRoom === room.id ? room.color : undefined
            }}
          >
            {room.name}
          </button>
        ))}
      </div>

      <Bolillero
        totalNumbers={selectedRoom}
        winningNumber={winningNumber}
        isDrawing={isDrawing}
        onStartDraw={handleStartDraw}
        onReset={handleReset}
        roomColor={rooms.find(r => r.id === selectedRoom)?.color}
      />
    </div>
  );
}