import { useState, useEffect } from 'react';
import { supabase, subscribeToNumbers, subscribeToWinners } from '../services/supabase';
import { RoomType, Winner, UserProfile, RaffleNumber, ROOMS } from '../types';
import { TelegramService } from '../services/telegram';

export function useSupabaseUser() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('rifaflash_user');
    if (stored) {
      setUser(JSON.parse(stored));
    }
    setIsLoading(false);
  }, []);

  const registerUser = async (profile: UserProfile & { password?: string }) => {
    try {
      // Usar la función RPC para crear usuario
      const { data, error } = await supabase
        .rpc('create_user_with_password', {
          p_full_name: profile.fullName,
          p_dni: profile.dni,
          p_phone: profile.phone,
          p_cvu_alias: profile.cvuAlias,
          p_password: profile.password || '123456'
        });
      
      if (error) {
        console.error('Error creating user:', error);
        throw error;
      }

      // Guardar en localStorage con el código de referido generado
      const userData = {
        ...profile,
        id: data,
        referralCode: undefined,
        gameBalance: 0,
        hasMadeFirstPurchase: false
      };
      
      localStorage.setItem('rifaflash_user', JSON.stringify(userData));
      setUser(userData);
      
      // Notificar a Telegram
      await TelegramService.notifyNewUserRegistration({
        fullName: profile.fullName,
        dni: profile.dni,
        phone: profile.phone,
        cvuAlias: profile.cvuAlias,
        referralCode: undefined,
        referredBy: profile.referredBy
      });
      
      return userData;
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('rifaflash_user');
    setUser(null);
  };

  return { user, isLoading, registerUser, logout, setUser };
}

export function useSupabaseRoom(roomType: RoomType) {
  const roomConfig = ROOMS.find(r => r.id === roomType)!;
  const [numbers, setNumbers] = useState<RaffleNumber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [occupiedCount, setOccupiedCount] = useState(0);

  // Cargar números iniciales
  useEffect(() => {
    const loadNumbers = async () => {
      // Primero obtener el ID de la sala por nombre
      const { data: roomData, error: roomError } = await supabase
        .from('rooms')
        .select('id')
        .eq('name', roomType === 'standard' ? 'Sala Standard' : 
               roomType === 'premium' ? 'Sala Premium' : 'Sala VIP')
        .single();

      if (roomError || !roomData) {
        console.error('Error loading room:', roomError);
        return;
      }

      const { data, error } = await supabase
        .from('numbers')
        .select(`
          *,
          user:users(*)
        `)
        .eq('room_id', roomData.id)
        .order('number', { ascending: true });

      if (error) {
        console.error('Error loading numbers:', error);
        return;
      }

      const formatted = data.map((n: any) => ({
        number: n.number,
        status: n.status,
        owner: n.user ? {
          fullName: n.user.full_name,
          dni: n.user.dni,
          phone: n.user.phone,
          cvuAlias: n.user.cvu_alias
        } : undefined,
        reservedAt: n.reserved_at,
        paymentMethod: n.payment_method
      }));

      setNumbers(formatted);
      setOccupiedCount(formatted.filter((n: RaffleNumber) => n.status === 'occupied').length);
      setIsLoading(false);
    };

    loadNumbers();
  }, [roomType]);

  // Suscribirse a cambios en tiempo real
  useEffect(() => {
    const subscription = subscribeToNumbers(roomType, (payload) => {
      // Actualizar el número modificado
      setNumbers(prev => {
        const updated = [...prev];
        const index = updated.findIndex(n => n.number === payload.new.number);
        if (index !== -1) {
          updated[index] = {
            number: payload.new.number,
            status: payload.new.status,
            owner: payload.new.user_id ? updated[index]?.owner : undefined,
            reservedAt: payload.new.reserved_at,
            paymentMethod: payload.new.payment_method
          };
        }
        return updated;
      });
      
      // Actualizar contador
      if (payload.new.status === 'occupied') {
        setOccupiedCount(prev => prev + 1);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [roomType]);

  const reserveNumber = async (number: number, userId: string) => {
    const { error } = await supabase
      .from('numbers')
      .update({
        status: 'reserved',
        user_id: userId,
        reserved_at: new Date().toISOString()
      })
      .eq('room_id', roomType)
      .eq('number', number);

    if (error) throw error;
  };

  const confirmPayment = async (number: number, paymentMethod: string) => {
    const { error } = await supabase
      .from('numbers')
      .update({
        status: 'occupied',
        payment_method: paymentMethod
      })
      .eq('room_id', roomType)
      .eq('number', number);

    if (error) throw error;

    // Notificar por Telegram
    await TelegramService.notifyNewPayment({
      userName: 'Usuario', // Esto vendría del contexto
      userDNI: '00000000',
      userPhone: '0000000000',
      userCvuAlias: 'alias.mp',
      number,
      amount: roomConfig.price,
      paymentMethod: paymentMethod as 'uala' | 'mercadopago',
      timestamp: new Date()
    });
  };

  const selectWinner = async () => {
    const occupied = numbers.filter(n => n.status === 'occupied');
    if (occupied.length === 0) return null;
    
    const randomIndex = Math.floor(Math.random() * occupied.length);
    return occupied[randomIndex];
  };

  const progress = (occupiedCount / roomConfig.maxPlayers) * 100;
  const isComplete = occupiedCount === roomConfig.maxPlayers;

  return {
    roomConfig,
    numbers,
    isLoading,
    occupiedCount,
    progress,
    isComplete,
    reserveNumber,
    confirmPayment,
    selectWinner
  };
}

// Hook para obtener contadores de ocupación de todas las salas
export function useAllRoomsOccupiedCount() {
  const [occupiedCounts, setOccupiedCounts] = useState<Record<RoomType, number>>({
    standard: 0,
    premium: 0,
    vip: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCounts = async () => {
      // Obtener todos los rooms y contar números ocupados para cada uno
      const { data: rooms, error: roomsError } = await supabase
        .from('rooms')
        .select('id, name');
      
      if (roomsError) {
        console.error('Error loading rooms:', roomsError);
        return;
      }

      const counts: Record<RoomType, number> = {
        standard: 0,
        premium: 0,
        vip: 0
      };

      // Para cada room, contar números ocupados
      for (const room of rooms || []) {
        const { data: numbers, error: numbersError } = await supabase
          .from('numbers')
          .select('status')
          .eq('room_id', room.id);
        
        if (!numbersError && numbers) {
          const occupiedCount = numbers.filter(n => n.status === 'occupied').length;
          if (room.name === 'Sala Standard') {
            counts.standard = occupiedCount;
          } else if (room.name === 'Sala Premium') {
            counts.premium = occupiedCount;
          } else if (room.name === 'Sala VIP') {
            counts.vip = occupiedCount;
          }
        }
      }

      setOccupiedCounts(counts);
      setIsLoading(false);
    };

    loadCounts();

    // Suscribirse a cambios en tiempo real
    const subscription = supabase
      .channel('rooms-count')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'rooms' },
        () => loadCounts()
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { occupiedCounts, isLoading };
}

export function useSupabaseWinners() {
  const [winners, setWinners] = useState<Winner[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadWinners = async () => {
      const { data, error } = await supabase
        .from('winners')
        .select('*')
        .order('draw_date', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error loading winners:', error);
        return;
      }

      const formatted = data.map((w: any) => ({
        id: w.id,
        roomType: w.room_id,
        roomName: w.room_name,
        number: w.number,
        playerName: w.player_name,
        playerDNI: w.player_dni,
        prize: w.prize,
        date: w.draw_date,
        timestamp: new Date(w.draw_date).getTime()
      }));

      setWinners(formatted);
      setIsLoading(false);
    };

    loadWinners();
  }, []);

  // Suscribirse a nuevos ganadores
  useEffect(() => {
    const subscription = subscribeToWinners((payload) => {
      const w = payload.new;
      setWinners(prev => [{
        id: w.id,
        roomType: w.room_id,
        roomName: w.room_name,
        number: w.number,
        playerName: w.player_name,
        playerDNI: w.player_dni,
        prize: w.prize,
        date: w.draw_date,
        timestamp: new Date(w.draw_date).getTime()
      }, ...prev]);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const addWinner = async (winner: Winner) => {
    await TelegramService.notifyRaffleComplete(
      winner.playerName,
      winner.number,
      winner.playerDNI,
      `$${winner.prize.toLocaleString()}`
    );
  };

  return { winners, isLoading, addWinner };
}