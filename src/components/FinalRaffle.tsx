import { useState, useEffect } from 'react';
import { Trophy, Sparkles, X } from 'lucide-react';

interface FinalRaffleProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (winnerNumber: number) => void;
  roomName: string;
}

export function FinalRaffle({ isOpen, onClose, onComplete, roomName }: FinalRaffleProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentNumber, setCurrentNumber] = useState(0);
  const [winnerNumber, setWinnerNumber] = useState<number | null>(null);
  const [showWinner, setShowWinner] = useState(false);

  useEffect(() => {
    if (isOpen && !isSpinning && !winnerNumber) {
      // Auto-iniciar el sorteo
      setTimeout(() => startRaffle(), 1000);
    }
  }, [isOpen]);

  const startRaffle = () => {
    setIsSpinning(true);
    setShowWinner(false);
    
    let counter = 0;
    const maxNumbers = roomName.includes('Standard') ? 50 : roomName.includes('Premium') ? 25 : 15;
    
    const interval = setInterval(() => {
      counter++;
      setCurrentNumber(Math.floor(Math.random() * maxNumbers) + 1);
      
      if (counter > 50) {
        clearInterval(interval);
        const finalWinner = Math.floor(Math.random() * maxNumbers) + 1;
        setWinnerNumber(finalWinner);
        setCurrentNumber(finalWinner);
        setIsSpinning(false);
        setTimeout(() => setShowWinner(true), 500);
      }
    }, 100);
  };

  const handleConfirmWinner = () => {
    if (winnerNumber) {
      onComplete(winnerNumber);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-3xl max-w-lg w-full p-8 text-center relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-white mb-2">¡Sorteo Final!</h2>
          <p className="text-purple-200">Sala {roomName}</p>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-6">
          <div className="text-6xl font-bold text-white mb-4">
            {currentNumber.toString().padStart(2, '0')}
          </div>
          
          {isSpinning && (
            <div className="flex items-center justify-center gap-2 text-yellow-400">
              <Sparkles className="w-5 h-5 animate-spin" />
              <span className="text-lg">Sorteando...</span>
              <Sparkles className="w-5 h-5 animate-spin" />
            </div>
          )}
          
          {showWinner && winnerNumber && (
            <div className="space-y-4">
              <div className="text-2xl text-yellow-400 font-bold">
                ¡GANADOR!
              </div>
              <div className="text-white text-lg">
                El número ganador es: <span className="text-3xl font-bold text-yellow-400">{winnerNumber}</span>
              </div>
              <div className="text-purple-200">
                Premio: $100.000
              </div>
            </div>
          )}
        </div>

        {showWinner && winnerNumber && (
          <button
            onClick={handleConfirmWinner}
            className="w-full bg-yellow-400 text-purple-900 font-bold py-3 px-6 rounded-xl hover:bg-yellow-300 transition-colors"
          >
            Confirmar Ganador
          </button>
        )}
      </div>
    </div>
  );
}
