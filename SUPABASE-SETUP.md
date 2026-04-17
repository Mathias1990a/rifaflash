# RifaFlash - Configuración Web + Supabase

## 🎯 OBJETIVO
Página web con base de datos en la nube para que cualquiera juegue desde cualquier dispositivo.

## 🛠️ TECNOLOGÍAS
- **Frontend**: React + Vite (ya está)
- **Base de datos**: Supabase (PostgreSQL + Realtime)
- **Auth**: Supabase Auth
- **Deploy**: Vercel (gratis)

---

## 📋 PASOS PARA CONFIGURAR

### 1. Crear cuenta en Supabase (GRATIS)

1. Andá a: https://supabase.com
2. Click en "Start your project"
3. Registrate con GitHub o email
4. Creá un nuevo proyecto:
   - Name: `rifaflash`
   - Database Password: (generá una segura)
   - Region: `East US` (más cercana)
5. Esperá a que se cree (2-3 minutos)

### 2. Crear las tablas

En el SQL Editor de Supabase, ejecutá:

```sql
-- Tabla de usuarios
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  dni TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  cvu_alias TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de salas
CREATE TABLE rooms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  max_players INTEGER NOT NULL,
  price INTEGER NOT NULL,
  prize INTEGER NOT NULL,
  color TEXT NOT NULL,
  occupied_count INTEGER DEFAULT 0,
  is_complete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de números
CREATE TABLE numbers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id TEXT REFERENCES rooms(id),
  number INTEGER NOT NULL,
  status TEXT DEFAULT 'available',
  user_id UUID REFERENCES users(id),
  reserved_at TIMESTAMP,
  payment_method TEXT,
  UNIQUE(room_id, number)
);

-- Tabla de ganadores
CREATE TABLE winners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id TEXT REFERENCES rooms(id),
  room_name TEXT NOT NULL,
  number INTEGER NOT NULL,
  player_name TEXT NOT NULL,
  player_dni TEXT NOT NULL,
  prize INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insertar salas iniciales
INSERT INTO rooms (id, name, max_players, price, prize, color) VALUES
('standard', 'Sala Standard', 50, 3000, 100000, '#7c3aed'),
('premium', 'Sala Premium', 25, 5000, 100000, '#f59e0b'),
('vip', 'Sala VIP', 15, 10000, 100000, '#ef4444');

-- Crear 50 números para sala standard
INSERT INTO numbers (room_id, number, status)
SELECT 'standard', generate_series(1, 50), 'available';

-- Crear 25 números para sala premium
INSERT INTO numbers (room_id, number, status)
SELECT 'premium', generate_series(1, 25), 'available';

-- Crear 15 números para sala VIP
INSERT INTO numbers (room_id, number, status)
SELECT 'vip', generate_series(1, 15), 'available';
```

### 3. Configurar RLS (Seguridad)

```sql
-- Políticas para users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read all users" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own data" ON users
  FOR INSERT WITH CHECK (true);

-- Políticas para numbers
ALTER TABLE numbers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read numbers" ON numbers
  FOR SELECT USING (true);

CREATE POLICY "Anyone can update numbers" ON numbers
  FOR UPDATE USING (true);

-- Políticas para rooms
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read rooms" ON rooms
  FOR SELECT USING (true);

-- Políticas para winners
ALTER TABLE winners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read winners" ON winners
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert winners" ON winners
  FOR INSERT WITH CHECK (true);
```

### 4. Obtener credenciales

En Supabase:
1. Andá a **Project Settings** → **API**
2. Copiá:
   - **URL**: `https://xxxx.supabase.co`
   - **anon public**: `eyJhbG...`

### 5. Configurar variables de entorno

Creá archivo `.env` en la raíz del proyecto:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

---

## 🚀 DEPLOY EN VERCEL

### 1. Subir a GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/tuusuario/rifaflash.git
git push -u origin main
```

### 2. Conectar a Vercel

1. Andá a https://vercel.com
2. Importá el proyecto de GitHub
3. En **Environment Variables**, agregá:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy!

---

## 📱 PARA PROBAR

Una vez deployado, la URL será:
```
https://rifaflash.vercel.app
```

**Funcionalidades:**
- ✅ Registro de usuarios
- ✅ Compra de números en tiempo real
- ✅ Vés quién compró qué (tiempo real)
- ✅ Sorteo en vivo
- ✅ Historial de ganadores
- ✅ Funciona en cualquier dispositivo

---

## 💰 FLUJO DE PAGO

1. Usuario selecciona número
2. Muestra datos de pago (Ualá/MP)
3. Usuario paga y toca "Ya pagué"
4. Vos recibís notificación por Telegram
5. Confirmás el pago
6. El número se marca como ocupado para TODOS
7. Cuando se completa, sorteo automático

---

**¿Empezamos con la configuración de Supabase?**