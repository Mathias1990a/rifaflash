import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { RoomType, RaffleNumber, RoomConfig } from '../types';

// Configuración de las salas
const ROOMS: RoomConfig[] = [
  { id: 'standard', name: 'Sala Standard', maxPlayers: 50, price: 3000, prize: 100000, color: '#7c3aed' },
  { id: 'premium', name: 'Sala Premium', maxPlayers: 25, price: 5000, prize: 100000, color: '#f59e0b' },
  { id: 'vip', name: 'Sala VIP', maxPlayers: 15, price: 10000, prize: 100000, color: '#ef4444' }
];

// Hook simplificado para cargar números de una sala
export function useSimpleRoom(roomType: RoomType) {
  const [numbers, setNumbers] = useState<RaffleNumber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const roomConfig = ROOMS.find(r => r.id === roomType)!;

  useEffect(() => {
    const loadNumbers = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('Cargando números para sala:', roomType);
        
        const { data, error: supabaseError } = await supabase
          .from('numbers')
          .select('*')
          .eq('room_id', roomType)
          .order('number', { ascending: true });
        
        if (supabaseError) {
          console.error('Error de Supabase:', supabaseError);
          setError(supabaseError.message);
          setIsLoading(false);
          return;
        }
        
        console.log('Datos recibidos:', data);
        
        if (!data || data.length === 0) {
          console.warn('No se encontraron números para la sala:', roomType);
          setNumbers([]);
          setIsLoading(false);
          return;
        }
        
        const formatted: RaffleNumber[] = data.map((n: any) => ({
          number: n.number,
          status: n.status,
          reservedAt: n.reserved_at,
          paymentMethod: n.payment_method
        }));
        
        console.log('Números formateados:', formatted.length);
        setNumbers(formatted);
      } catch (err: any) {
        console.error('Error inesperado:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadNumbers();
  }, [roomType]);
  
  // Calcular contadores
  const occupiedCount = numbers.filter(n => n.status === 'occupied').length;
  const reservedCount = numbers.filter(n => n.status === 'reserved').length;
  const availableCount = numbers.length - occupiedCount - reservedCount;
  const progress = roomConfig.maxPlayers > 0 ? (occupiedCount / roomConfig.maxPlayers) * 100 : 0;
  const isComplete = occupiedCount >= roomConfig.maxPlayers;
  
  return {
    numbers,
    isLoading,
    error,
    occupiedCount,
    reservedCount,
    availableCount,
    roomConfig,
    progress,
    isComplete
  };
}
