// ============================================
// FIREBASE CONFIGURATION - Reemplaza Supabase
// ============================================

import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy,
  onSnapshot,
  writeBatch,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { RoomType, RaffleNumber, UserProfile, Winner } from '../types';

// Tu configuración de Firebase (la vas a obtener de la consola de Firebase)
const firebaseConfig = {
  apiKey: "AIzaSyDQBA09NCb9JbDKcHmb75HoEQfRZHtcbLg",
  authDomain: "rifaflash-1f668.firebaseapp.com",
  projectId: "rifaflash-1f668",
  storageBucket: "rifaflash-1f668.firebasestorage.app",
  messagingSenderId: "732413930662",
  appId: "1:732413930662:web:c3ef8d8a21cfaf4344d867"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// ============================================
// USUARIOS
// ============================================

export async function createUserInFirebase(profile: UserProfile & { password: string, referralCode?: string }) {
  // Crear usuario en Auth
  const email = `${profile.dni}@rifaflash.local`;
  const userCredential = await createUserWithEmailAndPassword(auth, email, profile.password);
  
  // Generar código de referido único
  const newReferralCode = Math.random().toString(36).substring(2, 10).toUpperCase();
  
  // Guardar datos adicionales en Firestore
  const userData = {
    id: userCredential.user.uid,
    fullName: profile.fullName,
    dni: profile.dni,
    phone: profile.phone,
    cvuAlias: profile.cvuAlias,
    referralCode: newReferralCode,
    referredBy: profile.referralCode || null,
    balance: 0,
    createdAt: serverTimestamp()
  };
  
  await setDoc(doc(db, 'users', userCredential.user.uid), userData);
  
  // Si tiene código de referido, procesarlo
  if (profile.referralCode) {
    await processReferral(profile.referralCode, userCredential.user.uid);
  }
  
  return userData;
}

async function processReferral(referralCode: string, newUserId: string) {
  // Buscar al usuario que tiene ese código de referido
  const q = query(collection(db, 'users'), where('referralCode', '==', referralCode.toUpperCase()));
  const snapshot = await getDocs(q);
  
  if (!snapshot.empty) {
    const referrerId = snapshot.docs[0].id;
    // Guardar la referencia
    await setDoc(doc(db, 'referrals', `${referrerId}_${newUserId}`), {
      referrerId,
      referredId: newUserId,
      status: 'pending',
      createdAt: serverTimestamp()
    });
  }
}

export async function loginUser(dni: string, password: string) {
  const email = `${dni}@rifaflash.local`;
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  
  // Obtener datos adicionales de Firestore
  const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
  if (userDoc.exists()) {
    return userDoc.data();
  }
  throw new Error('Usuario no encontrado en base de datos');
}

export async function logoutUser() {
  await signOut(auth);
}

export function onAuthChange(callback: (user: any) => void) {
  return onAuthStateChanged(auth, callback);
}

export async function getUserByDNI(dni: string) {
  const q = query(collection(db, 'users'), where('dni', '==', dni));
  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    return snapshot.docs[0].data();
  }
  return null;
}

// ============================================
// SALAS (ROOMS)
// ============================================

const ROOMS_CONFIG = {
  standard: { name: 'Sala $3000', maxPlayers: 50, price: 3000, prize: 100000, color: '#7c3aed', description: 'Sala estándar con 50 números' },
  premium: { name: 'Sala $5000', maxPlayers: 25, price: 5000, prize: 100000, color: '#f59e0b', description: 'Sala premium con 25 números' },
  vip: { name: 'Sala $10000', maxPlayers: 15, price: 10000, prize: 100000, color: '#ef4444', description: 'Sala VIP con 15 números' }
};

export async function initializeRooms() {
  // Crear salas si no existen
  for (const [roomId, config] of Object.entries(ROOMS_CONFIG)) {
    const roomRef = doc(db, 'rooms', roomId);
    const roomSnap = await getDoc(roomRef);
    
    if (!roomSnap.exists()) {
      await setDoc(roomRef, {
        id: roomId,
        ...config,
        occupiedCount: 0,
        createdAt: serverTimestamp()
      });
      
      // Crear números para esta sala
      await initializeNumbersForRoom(roomId, config.maxPlayers);
    }
  }
}

async function initializeNumbersForRoom(roomId: string, count: number) {
  const batch = writeBatch(db);
  
  for (let i = 1; i <= count; i++) {
    const numberRef = doc(db, 'numbers', `${roomId}_${i}`);
    batch.set(numberRef, {
      roomId,
      number: i,
      status: 'available',
      userId: null,
      reservedAt: null,
      paymentMethod: null,
      paymentConfirmed: false
    });
  }
  
  await batch.commit();
}

export async function getRooms() {
  const snapshot = await getDocs(collection(db, 'rooms'));
  return snapshot.docs.map(doc => doc.data());
}

export async function getRoomById(roomId: RoomType) {
  const roomSnap = await getDoc(doc(db, 'rooms', roomId));
  if (roomSnap.exists()) {
    return roomSnap.data();
  }
  return null;
}

// ============================================
// NÚMEROS
// ============================================

export async function getNumbersByRoom(roomId: RoomType) {
  const q = query(
    collection(db, 'numbers'), 
    where('roomId', '==', roomId),
    orderBy('number')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

export function subscribeToNumbers(roomId: RoomType, callback: (numbers: any[]) => void) {
  const q = query(
    collection(db, 'numbers'),
    where('roomId', '==', roomId),
    orderBy('number')
  );
  
  return onSnapshot(q, (snapshot) => {
    const numbers = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(numbers);
  });
}

export async function reserveNumber(roomId: RoomType, number: number, userId: string) {
  const numberRef = doc(db, 'numbers', `${roomId}_${number}`);
  const numberSnap = await getDoc(numberRef);
  
  if (!numberSnap.exists() || numberSnap.data().status !== 'available') {
    throw new Error('Número no disponible');
  }
  
  await updateDoc(numberRef, {
    status: 'reserved',
    userId,
    reservedAt: serverTimestamp()
  });
  
  return numberSnap.data();
}

export async function confirmNumberPayment(roomId: RoomType, number: number) {
  const numberRef = doc(db, 'numbers', `${roomId}_${number}`);
  
  await updateDoc(numberRef, {
    status: 'occupied',
    paymentConfirmed: true
  });
  
  // Incrementar contador de ocupados en la sala
  const roomRef = doc(db, 'rooms', roomId);
  const roomSnap = await getDoc(roomRef);
  if (roomSnap.exists()) {
    const currentCount = roomSnap.data().occupiedCount || 0;
    await updateDoc(roomRef, { occupiedCount: currentCount + 1 });
  }
}

export async function releaseNumber(roomId: RoomType, number: number) {
  const numberRef = doc(db, 'numbers', `${roomId}_${number}`);
  
  await updateDoc(numberRef, {
    status: 'available',
    userId: null,
    reservedAt: null,
    paymentMethod: null,
    paymentConfirmed: false
  });
}

// ============================================
// PAGOS
// ============================================

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
  const paymentRef = doc(collection(db, 'payments'));
  await setDoc(paymentRef, {
    ...paymentData,
    status: 'pending',
    createdAt: serverTimestamp()
  });
  return paymentRef.id;
}

export async function getPendingPayments() {
  const q = query(
    collection(db, 'payments'),
    where('status', '==', 'pending'),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function approvePayment(paymentId: string) {
  const paymentRef = doc(db, 'payments', paymentId);
  await updateDoc(paymentRef, { status: 'approved' });
}

export async function rejectPayment(paymentId: string) {
  const paymentRef = doc(db, 'payments', paymentId);
  await updateDoc(paymentRef, { status: 'rejected' });
}

// ============================================
// GANADORES
// ============================================

export async function addWinner(winner: Winner) {
  const winnerRef = doc(collection(db, 'winners'));
  await setDoc(winnerRef, {
    roomId: winner.roomType,
    roomName: winner.roomName,
    number: winner.number,
    playerName: winner.playerName,
    playerDni: winner.playerDNI,
    prize: winner.prize,
    drawDate: serverTimestamp()
  });
}

export async function getWinners(maxWinners: number = 50) {
  const q = query(
    collection(db, 'winners'),
    orderBy('drawDate', 'desc'),
    limit(maxWinners)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data());
}

export function subscribeToWinners(callback: (winners: any[]) => void) {
  const q = query(collection(db, 'winners'), orderBy('drawDate', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const winners = snapshot.docs.map(doc => doc.data());
    callback(winners);
  });
}

// ============================================
// ADMIN
// ============================================

export async function verifyAdmin(username: string, password: string) {
  // Simple verificación para admin
  // En producción, usar Firebase Auth con cuenta de admin
  return username === 'admin' && password === 'RifaFlash2024!';
}

// Inicializar datos al cargar
export async function initializeFirebaseData() {
  await initializeRooms();
}
