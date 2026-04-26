import { createClient } from '@supabase/supabase-js';
import { UserProfile, RoomType, Winner } from '../types';

// Tu proyecto de Supabase
const supabaseUrl = 'https://ezmpjdljotvbaxwhfubs.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6bXBqZGxqb3R2YmF4d2hmdWJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzMzg4MjIsImV4cCI6MjA5MTkxNDgyMn0.aASBBOob7uy7narXrIbWch7gOFCIkxdT22z1JKECRBg';

export const supabase = createClient(supabaseUrl, supabaseKey);

// ============================================
// USUARIOS
// ============================================

export async function createUser(profile: UserProfile) {
  // Verificar si ya existe
  const { data: existing } = await supabase
    .from('users')
    .select('*')
    .eq('dni', profile.dni)
    .single();

  if (existing) {
    return existing;
  }

  const { data, error } = await supabase
    .from('users')
    .insert([{
      full_name: profile.fullName,
      dni: profile.dni,
      phone: profile.phone,
      cvu_alias: profile.cvuAlias
    }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function getUserByDNI(dni: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('dni', dni)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

// ============================================
// SALAS
// ============================================

export async function getRooms() {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .order('price', { ascending: true });
  
  if (error) throw error;
  return data;
}

export async function getRoomById(roomId: RoomType) {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('id', roomId)
    .single();
  
  if (error) throw error;
  return data;
}

// ============================================
// NÚMEROS
// ============================================

export async function getNumbersByRoom(roomId: RoomType) {
  const { data, error } = await supabase
    .from('numbers')
    .select('*')
    .eq('room_id', roomId)
    .order('number', { ascending: true });
  
  if (error) throw error;
  return data || [];
}

export async function reserveNumber(roomId: RoomType, number: number, userId: string) {
  const { data, error } = await supabase
    .from('numbers')
    .update({
      status: 'reserved',
      user_id: userId,
      reserved_at: new Date().toISOString()
    })
    .eq('room_id', roomId)
    .eq('number', number)
    .eq('status', 'available') // Solo si está disponible
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function confirmPayment(roomId: RoomType, number: number, paymentMethod: string) {
  const { data, error } = await supabase
    .from('numbers')
    .update({
      status: 'occupied',
      payment_method: paymentMethod,
      payment_confirmed: true
    })
    .eq('room_id', roomId)
    .eq('number', number)
    .select()
    .single();
  
  if (error) throw error;
  
  // Incrementar contador de ocupados
  await supabase.rpc('increment_occupied', { room_id_param: roomId });
  
  return data;
}

export async function releaseNumber(roomId: RoomType, number: number) {
  const { data, error } = await supabase
    .from('numbers')
    .update({
      status: 'available',
      user_id: null,
      reserved_at: null,
      payment_method: null,
      payment_confirmed: false
    })
    .eq('room_id', roomId)
    .eq('number', number)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// ============================================
// GANADORES
// ============================================

export async function addWinner(winner: Winner) {
  const { data, error } = await supabase
    .from('winners')
    .insert([{
      room_id: winner.roomType,
      room_name: winner.roomName,
      number: winner.number,
      player_name: winner.playerName,
      player_dni: winner.playerDNI,
      prize: winner.prize
    }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function getWinners(limit: number = 50) {
  const { data, error } = await supabase
    .from('winners')
    .select('*')
    .order('draw_date', { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  return data;
}

// ============================================
// SUSCRIPCIONES REALTIME
// ============================================

export function subscribeToNumbers(roomId: RoomType, callback: (payload: any) => void) {
  return supabase
    .channel(`room-${roomId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'numbers',
        filter: `room_id=eq.${roomId}`
      },
      callback
    )
    .subscribe();
}

export function subscribeToWinners(callback: (payload: any) => void) {
  return supabase
    .channel('winners')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'winners'
      },
      callback
    )
    .subscribe();
}

// Guardar pago pendiente
export async function createPayment(paymentData: {
  userId: string;
  roomId: string;
  number: number;
  amount: number;
  senderName: string;
  senderCbu: string;
  date: string;
  notes?: string;
}) {
  const { data, error } = await supabase
    .from('payments')
    .insert([{
      user_id: paymentData.userId,
      room_id: paymentData.roomId,
      number: paymentData.number,
      amount: paymentData.amount,
      sender_name: paymentData.senderName,
      sender_cbu: paymentData.senderCbu,
      date: paymentData.date,
      notes: paymentData.notes,
      status: 'pending'
    }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}