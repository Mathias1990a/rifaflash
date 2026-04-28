import { useState, useEffect } from 'react';
import { getNumbersByRoom, subscribeToNumbers, getRoomById } from '../services/firebase';
import { RoomType, RaffleNumber } from '../types';

const ROOM_CONFIG = {
  standard: { name: 'Sala $3000', maxPlayers: 50, price: 3000, prize: 100000, color: '#7c3aed', description: 'Sala estándar con 50 números' },
  premium: { name: 'Sala $5000', maxPlayers: 25, price: 5000, prize: 100000, color: '#f59e0b', description: 'Sala premium con 25 números' },
  vip: { name: 'Sala $10000', maxPlayers: 15, price: 10000, prize: 100000, color: '#ef4444', description: 'Sala VIP con 15 números' }
};

export function useSimpleRoom(roomType: RoomType) {
  const [numbers, setNumbers] = useState<RaffleNumber[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cargar números iniciales
    const loadNumbers = async () => {
      try {
        const data = await getNumbersByRoom(roomType);
        setNumbers(data.map((n: any) => ({
          number: n.number,
          status: n.status || 'available',
          userId: n.userId,
          userName: n.userName
        })));
      } catch (error) {
        console.error('Error cargando números:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadNumbers();

    // Suscribirse a cambios en tiempo real
    const unsubscribe = subscribeToNumbers(roomType, (updatedNumbers) => {
      setNumbers(updatedNumbers.map((n: any) => ({
        number: n.number,
        status: n.status || 'available',
        userId: n.userId,
        userName: n.userName
      })));
    });

    return () => unsubscribe();
  }, [roomType]);

  const config = ROOM_CONFIG[roomType];
  const occupied = numbers.filter(n => n.status === 'occupied').length;
  const reserved = numbers.filter(n => n.status === 'reserved').length;

  return {
    numbers,
    isLoading: loading,
    roomConfig: { id: roomType, ...config },
    occupiedCount: occupied,
    reservedCount: reserved,
    progress: config.maxPlayers > 0 ? (occupied / config.maxPlayers) * 100 : 0,
    isComplete: occupied >= config.maxPlayers
  };
}
