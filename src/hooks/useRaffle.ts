import { useState, useEffect, useCallback } from 'react';
import { UserProfile, RaffleNumber, NumberStatus } from '../types';

export type { UserProfile, RaffleNumber, NumberStatus };

const STORAGE_KEY = 'rifaflash_user_profile';
const NUMBERS_KEY = 'rifaflash_numbers';

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setProfile(JSON.parse(stored));
      } catch (e) {
        console.error('Error parsing profile:', e);
      }
    }
    setIsLoaded(true);
  }, []);

  const saveProfile = useCallback((newProfile: UserProfile) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newProfile));
    setProfile(newProfile);
  }, []);

  const clearProfile = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setProfile(null);
  }, []);

  return { profile, isLoaded, saveProfile, clearProfile };
}

export function useRaffleNumbers() {
  const [numbers, setNumbers] = useState<RaffleNumber[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(NUMBERS_KEY);
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
  }, []);

  const initializeNumbers = () => {
    const initial: RaffleNumber[] = Array.from({ length: 50 }, (_, i) => ({
      number: i + 1,
      status: 'available'
    }));
    setNumbers(initial);
    localStorage.setItem(NUMBERS_KEY, JSON.stringify(initial));
  };

  const saveNumbers = useCallback((newNumbers: RaffleNumber[]) => {
    setNumbers(newNumbers);
    localStorage.setItem(NUMBERS_KEY, JSON.stringify(newNumbers));
  }, []);

  const reserveNumber = useCallback((num: number, profile: UserProfile) => {
    setNumbers(prev => {
      const updated = prev.map(n =>
        n.number === num && n.status === 'available'
          ? { ...n, status: 'reserved' as NumberStatus, owner: profile, reservedAt: new Date() }
          : n
      );
      localStorage.setItem(NUMBERS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const confirmPayment = useCallback((num: number) => {
    setNumbers(prev => {
      const updated = prev.map(n =>
        n.number === num && n.status === 'reserved'
          ? { ...n, status: 'occupied' as NumberStatus }
          : n
      );
      localStorage.setItem(NUMBERS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const releaseNumber = useCallback((num: number) => {
    setNumbers(prev => {
      const updated = prev.map(n =>
        n.number === num && n.status === 'reserved'
          ? { ...n, status: 'available' as NumberStatus, owner: undefined, reservedAt: undefined }
          : n
      );
      localStorage.setItem(NUMBERS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const occupiedCount = numbers.filter(n => n.status === 'occupied').length;
  const reservedCount = numbers.filter(n => n.status === 'reserved').length;
  const progress = (occupiedCount / 50) * 100;
  const isComplete = occupiedCount === 50;

  return {
    numbers,
    isLoaded,
    saveNumbers,
    reserveNumber,
    confirmPayment,
    releaseNumber,
    occupiedCount,
    reservedCount,
    progress,
    isComplete
  };
}