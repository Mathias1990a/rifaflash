import { useState, useEffect, useCallback } from 'react';
import { TelegramService } from '../services/telegram';
import { 
  RoomType, 
  Winner, 
  UserProfile, 
  RaffleNumber,
  NumberStatus,
  ROOMS 
} from '../types';

// Storage simple con LocalStorage
const Storage = {
  async get(key: string): Promise<string | null> {
    return localStorage.getItem(key);
  },
  async set(key: string, value: string): Promise<void> {
    localStorage.setItem(key, value);
  },
  async remove(key: string): Promise<void> {
    localStorage.removeItem(key);
  }
};

const STORAGE_KEYS = {
  PROFILE: 'rifaflash_user_profile',
  WINNERS: 'rifaflash_winners_history',
  ROOM_PREFIX: 'rifaflash_room_'
};

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      const stored = await Storage.get(STORAGE_KEYS.PROFILE);
      if (stored) {
        try {
          setProfile(JSON.parse(stored));
        } catch (e) {
          console.error('Error parsing profile:', e);
        }
      }
      setIsLoaded(true);
    };
    load();
  }, []);

  const saveProfile = useCallback(async (newProfile: UserProfile) => {
    await Storage.set(STORAGE_KEYS.PROFILE, JSON.stringify(newProfile));
    setProfile(newProfile);
  }, []);

  const clearProfile = useCallback(async () => {
    await Storage.remove(STORAGE_KEYS.PROFILE);
    setProfile(null);
  }, []);

  return { profile, isLoaded, saveProfile, clearProfile };
}

export function useWinnersHistory() {
  const [winners, setWinners] = useState<Winner[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      const stored = await Storage.get(STORAGE_KEYS.WINNERS);
      if (stored) {
        try {
          setWinners(JSON.parse(stored));
        } catch (e) {
          console.error('Error parsing winners:', e);
        }
      }
      setIsLoaded(true);
    };
    load();
  }, []);

  const addWinner = useCallback(async (winner: Winner) => {
    const newWinners = [winner, ...winners].slice(0, 50);
    await Storage.set(STORAGE_KEYS.WINNERS, JSON.stringify(newWinners));
    setWinners(newWinners);
    
    await TelegramService.notifyRaffleComplete(
      winner.playerName,
      winner.number,
      winner.playerDNI,
      `$${winner.prize.toLocaleString()}`
    );
  }, [winners]);

  const getRecentWinners = useCallback((count: number = 5) => {
    return winners.slice(0, count);
  }, [winners]);

  return { winners, isLoaded, addWinner, getRecentWinners };
}

export function useRoom(roomType: RoomType, profile: UserProfile | null) {
  const roomConfig = ROOMS.find(r => r.id === roomType)!;
  const storageKey = `${STORAGE_KEYS.ROOM_PREFIX}${roomType}`;
  
  const [numbers, setNumbers] = useState<RaffleNumber[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      const stored = await Storage.get(storageKey);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setNumbers(parsed.map((n: RaffleNumber) => ({
            ...n,
            reservedAt: n.reservedAt ? new Date(n.reservedAt) : undefined
          })));
        } catch (e) {
          initializeNumbers();
        }
      } else {
        initializeNumbers();
      }
      setIsLoaded(true);
    };
    load();
  }, [roomType]);

  const initializeNumbers = () => {
    const initial: RaffleNumber[] = Array.from({ length: roomConfig.maxPlayers }, (_, i) => ({
      number: i + 1,
      status: 'available'
    }));
    setNumbers(initial);
    Storage.set(storageKey, JSON.stringify(initial));
  };

  const saveNumbers = useCallback(async (newNumbers: RaffleNumber[]) => {
    setNumbers(newNumbers);
    await Storage.set(storageKey, JSON.stringify(newNumbers));
  }, [storageKey]);

  const reserveNumber = useCallback(async (num: number) => {
    if (!profile) return;
    
    setNumbers(prev => {
      const updated = prev.map(n =>
        n.number === num && n.status === 'available'
          ? { ...n, status: 'reserved' as NumberStatus, owner: profile, reservedAt: new Date() }
          : n
      );
      Storage.set(storageKey, JSON.stringify(updated));
      return updated;
    });
  }, [profile, storageKey]);

  const confirmPayment = useCallback(async (num: number, paymentMethod?: 'uala' | 'mercadopago') => {
    setNumbers(prev => {
      const updated = prev.map(n =>
        n.number === num && (n.status === 'reserved' || n.status === 'available')
          ? { ...n, status: 'occupied' as NumberStatus, paymentMethod }
          : n
      );
      Storage.set(storageKey, JSON.stringify(updated));
      return updated;
    });
  }, [storageKey]);

  const releaseNumber = useCallback(async (num: number) => {
    setNumbers(prev => {
      const updated = prev.map(n =>
        n.number === num && n.status === 'reserved'
          ? { ...n, status: 'available' as NumberStatus, owner: undefined, reservedAt: undefined }
          : n
      );
      Storage.set(storageKey, JSON.stringify(updated));
      return updated;
    });
  }, [storageKey]);

  const selectWinner = useCallback(async () => {
    const occupied = numbers.filter(n => n.status === 'occupied');
    if (occupied.length === 0) return null;
    
    const randomIndex = Math.floor(Math.random() * occupied.length);
    return occupied[randomIndex];
  }, [numbers]);

  const resetRoom = useCallback(async () => {
    await initializeNumbers();
  }, []);

  const occupiedCount = numbers.filter(n => n.status === 'occupied').length;
  const reservedCount = numbers.filter(n => n.status === 'reserved').length;
  const progress = (occupiedCount / roomConfig.maxPlayers) * 100;
  const isComplete = occupiedCount === roomConfig.maxPlayers;
  const remainingNumbers = roomConfig.maxPlayers - occupiedCount;

  const userNumbers = profile 
    ? numbers.filter(n => n.owner?.dni === profile.dni)
    : [];

  return {
    roomConfig,
    numbers,
    isLoaded,
    occupiedCount,
    reservedCount,
    remainingNumbers,
    progress,
    isComplete,
    userNumbers,
    saveNumbers,
    reserveNumber,
    confirmPayment,
    releaseNumber,
    selectWinner,
    resetRoom
  };
}