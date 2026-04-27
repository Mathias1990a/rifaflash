import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { RoomType, RaffleNumber } from '../types';

const ROOM_CONFIG = {
  standard: { name: 'Sala Standard', max: 50, price: 3000, color: '#7c3aed' },
  premium: { name: 'Sala Premium', max: 25, price: 5000, color: '#f59e0b' },
  vip: { name: 'Sala VIP', max: 15, price: 10000, color: '#ef4444' }
};

export function useSimpleRoom(roomType: RoomType) {
  const [numbers, setNumbers] = useState<RaffleNumber[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('numbers')
        .select('*')
        .eq('room_id', roomType)
        .order('number');
      
      if (data) {
        setNumbers(data.map(n => ({
          number: n.number,
          status: n.status || 'available'
        })));
      }
      setLoading(false);
    };
    load();
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
    progress: config.max > 0 ? (occupied / config.max) * 100 : 0,
    isComplete: occupied >= config.max
  };
}
