import { useState, useEffect } from 'react';
import { Trophy } from 'lucide-react';

interface Winner {
  id: string;
  room_type: string;
  room_name: string;
  number: number;
  player_name: string;
  player_dni: string;
  prize: number;
  date: string;
  win_timestamp: number;
}

interface WinnersListProps {
  compact?: boolean;
}

export function WinnersList({ compact = false }: WinnersListProps) {
  const [winners, setWinners] = useState<Winner[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadWinners = async () => {
      try {
        // Por ahora, datos de ejemplo hasta que haya ganadores reales
        setWinners([]);
      } catch (error) {
        console.error('Error loading winners:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadWinners();
  }, []);

  if (compact) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Trophy className="w-5 h-5 text-yellow-400" />
          <h3 className="text-white font-semibold">Ganadores</h3>
        </div>
        {isLoading ? (
          <div className="text-white/70 text-sm">Cargando...</div>
        ) : winners.length === 0 ? (
          <div className="text-white/70 text-sm">Próximamente ganadores</div>
        ) : (
          <div className="space-y-2">
            {winners.slice(0, 3).map((winner) => (
              <div key={winner.id} className="text-white/80 text-sm">
                <span className="font-medium">{winner.player_name}</span>
                <span className="text-white/60"> - Sala {winner.room_name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="w-6 h-6 text-yellow-400" />
        <h2 className="text-2xl font-bold text-white">Ganadores</h2>
      </div>
      
      {isLoading ? (
        <div className="text-white/70 text-center py-8">Cargando ganadores...</div>
      ) : winners.length === 0 ? (
        <div className="text-white/70 text-center py-8">
          <Trophy className="w-12 h-12 text-yellow-400/50 mx-auto mb-4" />
          <p>Próximamente los primeros ganadores</p>
          <p className="text-sm mt-2">¡Tú podrías ser el próximo!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {winners.map((winner) => (
            <div key={winner.id} className="bg-white/10 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white font-semibold">{winner.player_name}</h4>
                  <p className="text-white/70 text-sm">DNI: {winner.player_dni}</p>
                  <p className="text-white/60 text-xs">{winner.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-yellow-400 font-bold">${winner.prize.toLocaleString()}</p>
                  <p className="text-white/70 text-sm">{winner.room_name}</p>
                  <p className="text-white/60 text-xs">N°{winner.number}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function WinnersCompact() {
  return <WinnersList compact={true} />;
}
