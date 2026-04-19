export type RoomType = 'standard' | 'premium' | 'vip';

export interface RoomConfig {
  id: RoomType;
  name: string;
  maxPlayers: number;
  price: number;
  prize: number;
  color: string;
  description: string;
}

export const ROOMS: RoomConfig[] = [
  {
    id: 'standard',
    name: 'Sala Standard',
    maxPlayers: 50,
    price: 3000,
    prize: 100000,
    color: '#7c3aed',
    description: '50 números - $3.000 c/u'
  },
  {
    id: 'premium',
    name: 'Sala Premium',
    maxPlayers: 25,
    price: 5000,
    prize: 100000,
    color: '#f59e0b',
    description: '25 números - $5.000 c/u - Mejores chances!'
  },
  {
    id: 'vip',
    name: 'Sala VIP',
    maxPlayers: 15,
    price: 10000,
    prize: 100000,
    color: '#ef4444',
    description: '15 números - $10.000 c/u - Chances máximas!'
  }
];

export interface Winner {
  id: string;
  roomType: RoomType;
  roomName: string;
  number: number;
  playerName: string;
  playerDNI: string;
  prize: number;
  date: string;
  timestamp: number;
}

export interface RoomState {
  type: RoomType;
  numbers: RaffleNumber[];
  occupiedCount: number;
  reservedCount: number;
  isComplete: boolean;
  winner?: Winner;
}

export interface UserProfile {
  fullName: string;
  dni: string;
  phone: string;
  cvuAlias: string;
  password?: string;
}

export type NumberStatus = 'available' | 'reserved' | 'occupied';

export interface RaffleNumber {
  number: number;
  status: NumberStatus;
  owner?: UserProfile;
  reservedAt?: Date;
  paymentMethod?: 'uala' | 'mercadopago';
}