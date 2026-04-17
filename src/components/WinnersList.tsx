import { motion } from 'framer-motion';
import { Trophy, Calendar, User, Hash, Sparkles } from 'lucide-react';
import { Winner, RoomType, ROOMS } from '../types';

interface WinnersListProps {
  winners: Winner[];
  selectedRoom?: RoomType | 'all';
  onSelectRoom?: (room: RoomType | 'all') => void;
  maxDisplay?: number;
}

export function WinnersList({ 
  winners, 
  selectedRoom = 'all', 
  onSelectRoom,
  maxDisplay = 10 
}: WinnersListProps) {
  
  const filteredWinners = selectedRoom === 'all' 
    ? winners 
    : winners.filter(w => w.roomType === selectedRoom);
  
  const displayWinners = filteredWinners.slice(0, maxDisplay);
  
  const getRoomColor = (roomType: RoomType) => {
    const room = ROOMS.find(r => r.id === roomType);
    return room?.color || '#7c3aed';
  };

  return (
    <div className="w-full">
      {/* Header con selector de salas */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-6 h-6 text-yellow-400" />
          <h2 className="text-2xl font-display text-white">🏆 Ganadores</h2>
          <span className="text-white/50 text-sm">({winners.length} total)</span>
        </div>
        
        {/* Tabs de salas */}
        {onSelectRoom && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onSelectRoom('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedRoom === 'all'
                  ? 'bg-white/20 text-white'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              Todas las salas
            </button>
            {ROOMS.map(room => (
              <button
                key={room.id}
                onClick={() => onSelectRoom(room.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  selectedRoom === room.id
                    ? 'text-white'
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}
                style={{
                  backgroundColor: selectedRoom === room.id ? room.color : undefined
                }}
              >
                <span 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: room.color }}
                />
                {room.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lista de ganadores */}
      <div className="space-y-3">
        {displayWinners.length === 0 ? (
          <div className="text-center py-8 text-white/50">
            <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Aún no hay ganadores en esta sala</p>
            <p className="text-sm">¡Sé el primero en ganar! 🎉</p>
          </div>
        ) : (
          displayWinners.map((winner, index) => (
            <motion.div
              key={winner.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-white/20 transition-colors"
            >
              <div className="flex items-center gap-4">
                {/* Posición */}
                <div className="flex-shrink-0">
                  {index === 0 ? (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
                      <Trophy className="w-5 h-5 text-black" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/60 font-bold">
                      #{index + 1}
                    </div>
                  )}
                </div>

                {/* Info del ganador */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="w-4 h-4 text-white/50" />
                    <span className="font-medium text-white truncate">{winner.playerName}</span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-white/50">
                    <span className="flex items-center gap-1">
                      <Hash className="w-3 h-3" />
                      N° {winner.number.toString().padStart(2, '0')}
                    </span>
                    
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(winner.date).toLocaleDateString('es-AR')}
                    </span>
                  </div>
                </div>

                {/* Sala y premio */}
                <div className="text-right">
                  <div 
                    className="text-xs font-medium px-2 py-1 rounded-full mb-1 inline-block"
                    style={{ 
                      backgroundColor: `${getRoomColor(winner.roomType)}30`,
                      color: getRoomColor(winner.roomType)
                    }}
                  >
                    {winner.roomName}
                  </div>
                  
                  <div className="text-xl font-display text-gradient-gold">
                    ${winner.prize.toLocaleString()}
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Ver más */}
      {filteredWinners.length > maxDisplay && (
        <div className="text-center mt-4">
          <p className="text-white/50 text-sm">
            +{filteredWinners.length - maxDisplay} ganadores más
          </p>
        </div>
      )}
    </div>
  );
}

// Componente compacto para el header
export function WinnersCompact({ winners }: { winners: Winner[] }) {
  const recentWinners = winners.slice(0, 5);
  
  return (
    <div className="bg-gradient-to-r from-violet-600/20 via-violet-500/10 to-violet-600/20 rounded-xl p-4 border border-violet-500/30">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          <span className="font-medium text-white">Últimos Ganadores</span>
        </div>
        <span className="text-white/50 text-sm">{winners.length} total</span>
      </div>
      
      <div className="flex gap-2 overflow-x-auto pb-2">
        {recentWinners.length === 0 ? (
          <span className="text-white/40 text-sm">Aún no hay ganadores</span>
        ) : (
          recentWinners.map(winner => (
            <div 
              key={winner.id}
              className="flex-shrink-0 bg-white/10 rounded-lg px-3 py-2"
            >
              <div className="text-xs text-white/60">{winner.roomName}</div>
              <div className="font-medium text-white truncate max-w-[120px]">{winner.playerName}</div>
              <div className="text-yellow-400 font-display">${winner.prize.toLocaleString()}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}