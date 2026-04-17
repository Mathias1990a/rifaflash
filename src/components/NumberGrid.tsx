import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Users, 
  Wallet,
  Sparkles,
  Zap,
  Clock
} from 'lucide-react';
import { Progress } from './ui/progress';
import { Card } from './ui/card';
import { RaffleNumber } from '../types';

interface NumberGridProps {
  numbers: RaffleNumber[];
  onSelectNumber: (number: RaffleNumber) => void;
  occupiedCount: number;
  reservedCount: number;
  progress: number;
  isComplete: boolean;
  roomColor?: string;
}

export function NumberGrid({ 
  numbers, 
  onSelectNumber,
  occupiedCount,
  reservedCount,
  progress,
  isComplete
}: NumberGridProps) {
  const [selectedForPreview, setSelectedForPreview] = useState<number | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-white/5 hover:bg-violet-500/20 border-white/10 hover:border-violet-500/50 text-white';
      case 'reserved':
        return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400 cursor-not-allowed';
      case 'occupied':
        return 'bg-gradient-to-br from-red-500 to-red-600 border-red-500 text-white cursor-not-allowed';
      default:
        return 'bg-white/5';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'reserved':
        return <Clock className="w-3 h-3" />;
      case 'occupied':
        return <Zap className="w-3 h-3" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 text-center border-violet-500/20 bg-gradient-to-br from-violet-600/10 to-transparent">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span className="text-xs text-white/50">Premio</span>
          </div>
          <p className="text-xl font-display text-gradient-gold">$100K</p>
        </Card>
        
        <Card className="p-4 text-center border-violet-500/20 bg-gradient-to-br from-violet-600/10 to-transparent">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Wallet className="w-4 h-4 text-violet-400" />
            <span className="text-xs text-white/50">Precio</span>
          </div>
          <p className="text-xl font-display text-white">$3.000</p>
        </Card>
        
        <Card className="p-4 text-center border-violet-500/20 bg-gradient-to-br from-violet-600/10 to-transparent">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Users className="w-4 h-4 text-green-400" />
            <span className="text-xs text-white/50">Disponibles</span>
          </div>
          <p className="text-xl font-display text-white">{50 - occupiedCount - reservedCount}</p>
        </Card>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/60">Progreso de la sala</span>
          <span className="font-medium text-white">
            {occupiedCount}/50 <span className="text-white/50">vendidos</span>
          </span>
        </div>
        <div className="relative">
          <Progress value={progress} className="h-3" />
          {isComplete && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute -top-1 right-0"
            >
              <Sparkles className="w-5 h-5 text-yellow-400" />
            </motion.div>
          )}
        </div>
        
        <div className="flex items-center justify-between text-xs text-white/40">
          <span>{reservedCount} reservados</span>
          <span>Meta: 50 números</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-white/5 border border-white/10" />
          <span className="text-white/60">Disponible</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-yellow-500/20 border border-yellow-500/50" />
          <span className="text-white/60">Reservado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gradient-to-br from-red-500 to-red-600" />
          <span className="text-white/60">Ocupado</span>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
        <AnimatePresence>
          {numbers.map((num, index) => (
            <motion.button
              key={num.number}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.01 }}
              whileHover={num.status === 'available' ? { scale: 1.1 } : {}}
              whileTap={num.status === 'available' ? { scale: 0.95 } : {}}
              onClick={() => num.status === 'available' && onSelectNumber(num)}
              onMouseEnter={() => setSelectedForPreview(num.number)}
              onMouseLeave={() => setSelectedForPreview(null)}
              disabled={num.status !== 'available'}
              className={`
                relative aspect-square rounded-xl border-2 font-display text-lg
                transition-all duration-200 flex items-center justify-center
                ${getStatusColor(num.status)}
              `}
            >
              <span className="relative z-10">
                {num.number.toString().padStart(2, '0')}
              </span>
              
              {num.status !== 'available' && (
                <div className="absolute top-1 right-1">
                  {getStatusIcon(num.status)}
                </div>
              )}
              
              {selectedForPreview === num.number && num.status === 'available' && (
                <motion.div
                  layoutId="preview"
                  className="absolute inset-0 bg-violet-500/20 rounded-xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              )}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}