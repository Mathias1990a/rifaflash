-- ============================================
-- RIFAFASH - CONFIGURACIÓN COMPLETA SUPABASE
-- ============================================

-- 1. TABLA DE USUARIOS
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  dni TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  cvu_alias TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. TABLA DE SALAS
CREATE TABLE IF NOT EXISTS rooms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  max_players INTEGER NOT NULL,
  price INTEGER NOT NULL,
  prize INTEGER NOT NULL,
  color TEXT NOT NULL,
  occupied_count INTEGER DEFAULT 0,
  is_complete BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. TABLA DE NÚMEROS
CREATE TABLE IF NOT EXISTS numbers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id TEXT REFERENCES rooms(id) ON DELETE CASCADE,
  number INTEGER NOT NULL,
  status TEXT DEFAULT 'available', -- available, reserved, occupied
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  reserved_at TIMESTAMP,
  payment_method TEXT,
  payment_confirmed BOOLEAN DEFAULT FALSE,
  UNIQUE(room_id, number)
);

-- 4. TABLA DE GANADORES
CREATE TABLE IF NOT EXISTS winners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id TEXT REFERENCES rooms(id),
  room_name TEXT NOT NULL,
  number INTEGER NOT NULL,
  player_name TEXT NOT NULL,
  player_dni TEXT NOT NULL,
  prize INTEGER NOT NULL,
  draw_date TIMESTAMP DEFAULT NOW()
);

-- 5. TABLA DE PAGOS (para Ualá Bis)
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  room_id TEXT REFERENCES rooms(id),
  number INTEGER NOT NULL,
  amount INTEGER NOT NULL,
  payment_method TEXT NOT NULL, -- 'uala', 'mercadopago', 'transfer'
  status TEXT DEFAULT 'pending', -- pending, confirmed, rejected
  uala_transaction_id TEXT,
  mp_preference_id TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  confirmed_at TIMESTAMP
);

-- ============================================
-- INSERTAR SALAS INICIALES
-- ============================================

INSERT INTO rooms (id, name, max_players, price, prize, color) VALUES
('standard', 'Sala Standard', 50, 3000, 100000, '#7c3aed'),
('premium', 'Sala Premium', 25, 5000, 100000, '#f59e0b'),
('vip', 'Sala VIP', 15, 10000, 100000, '#ef4444')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- CREAR NÚMEROS PARA CADA SALA
-- ============================================

-- Sala Standard (50 números)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM numbers WHERE room_id = 'standard') THEN
    INSERT INTO numbers (room_id, number, status)
    SELECT 'standard', generate_series(1, 50), 'available';
  END IF;
END $$;

-- Sala Premium (25 números)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM numbers WHERE room_id = 'premium') THEN
    INSERT INTO numbers (room_id, number, status)
    SELECT 'premium', generate_series(1, 25), 'available';
  END IF;
END $$;

-- Sala VIP (15 números)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM numbers WHERE room_id = 'vip') THEN
    INSERT INTO numbers (room_id, number, status)
    SELECT 'vip', generate_series(1, 15), 'available';
  END IF;
END $$;

-- ============================================
-- POLÍTICAS DE SEGURIDAD (RLS)
-- ============================================

-- Habilitar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE winners ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Políticas para users
CREATE POLICY "Allow all read users" ON users
  FOR SELECT USING (true);

CREATE POLICY "Allow insert users" ON users
  FOR INSERT WITH CHECK (true);

-- Políticas para rooms
CREATE POLICY "Allow all read rooms" ON rooms
  FOR SELECT USING (true);

-- Políticas para numbers
CREATE POLICY "Allow all read numbers" ON numbers
  FOR SELECT USING (true);

CREATE POLICY "Allow update numbers" ON numbers
  FOR UPDATE USING (true);

-- Políticas para winners
CREATE POLICY "Allow all read winners" ON winners
  FOR SELECT USING (true);

CREATE POLICY "Allow insert winners" ON winners
  FOR INSERT WITH CHECK (true);

-- Políticas para payments
CREATE POLICY "Allow all read payments" ON payments
  FOR SELECT USING (true);

CREATE POLICY "Allow insert payments" ON payments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update payments" ON payments
  FOR UPDATE USING (true);

-- ============================================
-- FUNCIONES AUXILIARES
-- ============================================

-- Función para incrementar contador de ocupados
CREATE OR REPLACE FUNCTION increment_occupied(room_id_param TEXT)
RETURNS void AS $$
BEGIN
  UPDATE rooms 
  SET occupied_count = occupied_count + 1
  WHERE id = room_id_param;
END;
$$ LANGUAGE plpgsql;

-- Función para verificar si la sala está completa
CREATE OR REPLACE FUNCTION check_room_complete()
RETURNS TRIGGER AS $$
DECLARE
  room_max INTEGER;
  room_occupied INTEGER;
BEGIN
  SELECT max_players, occupied_count 
  INTO room_max, room_occupied
  FROM rooms 
  WHERE id = NEW.room_id;
  
  IF room_occupied >= room_max THEN
    UPDATE rooms 
    SET is_complete = true 
    WHERE id = NEW.room_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para verificar sala completa
DROP TRIGGER IF EXISTS trigger_check_complete ON numbers;
CREATE TRIGGER trigger_check_complete
  AFTER UPDATE ON numbers
  FOR EACH ROW
  WHEN (NEW.status = 'occupied')
  EXECUTE FUNCTION check_room_complete();

-- ============================================
-- CONFIGURACIÓN REALTIME
-- ============================================

-- Habilitar realtime para todas las tablas
ALTER PUBLICATION supabase_realtime ADD TABLE numbers;
ALTER PUBLICATION supabase_realtime ADD TABLE rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE winners;
ALTER PUBLICATION supabase_realtime ADD TABLE payments;