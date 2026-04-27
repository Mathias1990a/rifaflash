import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { RoomType, RaffleNumber, RoomConfig } from '../types';

const ROOMS: RoomConfig[] = [
  { id: 'standard', name: 'Sala Standard', maxPlayers: 50, price: 3000, prize: 100000, color: '#7c3aed' },
  { id: 'premium', name: 'Sala Premium', maxPlayers: 25, price: 5000, prize: 100000, color: '#f59e0b' },
  { id: 'vip', name: 'Sala VIP', maxPlayers: 15, price: 10000, prize: 100000, color: '#ef4444' }
];

export function useSimpleRoom(roomType: RoomType) {
  const [numbers, setNumbers] = useState<RaffleNumber[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const roomConfig = ROOMS.find(r => r.id === roomType)!;

  useEffect(() => {
    const loadNumbers = async () => {
      const { data } = await supabase
        .from('numbers')
        .select('*')
        .eq('room_id', roomType)
        .order('number', { ascending: true });
      
      if (data) {
        setNumbers(data.map((n: any) => ({
          number: n.number,
          status: n.status,
          reservedAt: n.reserved_at,
          paymentMethod: n.payment_method
        })));
      }
      setIsLoading(false);
    };
    
    loadNumbers();
  }, [roomType]);

  const occupiedCount = numbers.filter(n => n.status === 'occupied').length;
  const reservedCount = numbers.filter(n => n.status === 'reserved').length;
  const progress = roomConfig.maxPlayers > 0 ? (occupiedCount / roomConfig.maxPlayers) * 100 : 0;
  const isComplete = occupiedCount >= roomConfig.maxPlayers;

  return { numbers, isLoading, occupiedCount, reservedCount, roomConfig, progress, isComplete };
}
