import { motion } from 'framer-motion';
import { Users, Trophy, Zap, Crown, Star } from 'lucide-react';
import { RoomType, ROOMS } from '../types';

interface RoomSelectorProps {
  selectedRoom: RoomType;
  onSelectRoom: (room: RoomType) => void;
  occupiedCounts: Record<RoomType, number>;
}

export function RoomSelector({ selectedRoom, onSelectRoom, occupiedCounts }: RoomSelectorProps) {
  const getRoomIcon = (roomId: RoomType) => {
    switch (roomId) {
      case 'standard': return <Users className="w-6 h-6" />;
      case 'premium': return <Star className="w-6 h-6" />;
      case 'vip': return <Crown className="w-6 h-6" />;
    }
  };

  const getChancesText = (maxPlayers: number) => {
    const chance = (1 / maxPlayers * 100).toFixed(1);
    return `${chance}% chance de ganar`;
  };

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-6 h-6 text-yellow-400" />
        <h2 className="text-2xl font-display text-white">Seleccioná tu Sala</h2>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {ROOMS.map((room, index) => {
          const isSelected = selectedRoom === room.id;
          const occupied = occupiedCounts[room.id] || 0;
          const available = room.maxPlayers - occupied;
          const progress = (occupied / room.maxPlayers) * 100;
          
          return (
            <motion.button
              key={room.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onSelectRoom(room.id)}
              className={`relative rounded-2xl p-5 border-2 transition-all text-left ${
                isSelected 
                  ? 'border-white shadow-lg scale-[1.02]' 
                  : 'border-white/10 hover:border-white/30'
              }`}
              style={{
                background: isSelected 
                  ? `linear-gradient(135deg, ${room.color}40 0%, ${room.color}20 100%)`
                  : 'rgba(255, 255, 255, 0.05)'
              }}
            >
              {/* Badge de seleccionado */}
              {isSelected && (
                <motion.div
                  layoutId="selectedRoom"
                  className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: room.color }}
                >
                  <Zap className="w-4 h-4 text-white" />
                </motion.div>
              )}

              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div 
                  className="p-3 rounded-xl"
                  style={{ backgroundColor: `${room.color}30`, color: room.color }}
                >
                  {getRoomIcon(room.id)}
                </div>
                
                <div className="text-right">
                  <div className="text-2xl font-display text-white">
                    ${room.price.toLocaleString()}
                  </div>
                  <div className="text-xs text-white/50">por número</div>
                </div>
              </div>

              {/* Info */}
              <div className="mb-4">
                <h3 className="text-xl font-bold text-white mb-1">{room.name}</h3>
                <p className="text-sm text-white/60">{room.description}</p>
              </div>

              {/* Stats */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">Disponibles</span>
                  <span className="font-medium text-white">{available}/{room.maxPlayers}</span>
                </div>
                
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all"
                    style={{ 
                      width: `${progress}%`,
                      backgroundColor: room.color
                    }}
                  />
                </div>
                
                <div 
                  className="text-xs font-medium text-center py-1 rounded-lg"
                  style={{ 
                    backgroundColor: `${room.color}20`,
                    color: room.color
                  }}
                >
                  {getChancesText(room.maxPlayers)}
                </div>
              </div>

              {/* Premio */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex items-center justify-center gap-2">
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  <span className="text-yellow-400 font-display text-lg">
                    ${room.prize.toLocaleString()} en premios
                  </span>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}