-- ============================================
-- RIFAFASH - SQL COMPLETO CORREGIDO
-- ============================================

-- 1. TABLA DE USUARIOS (con todos los campos necesarios)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  dni TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  cvu_alias TEXT NOT NULL,
  email TEXT,
  password TEXT,
  referral_code TEXT UNIQUE,
  referred_by TEXT,
  game_balance INTEGER DEFAULT 0,
  has_made_first_purchase BOOLEAN DEFAULT FALSE,
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
  status TEXT DEFAULT 'available',
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

-- 5. TABLA DE PAGOS PENDIENTES
CREATE TABLE IF NOT EXISTS pending_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  room_id TEXT REFERENCES rooms(id),
  number INTEGER NOT NULL,
  amount INTEGER NOT NULL,
  sender_name TEXT NOT NULL,
  sender_cbu TEXT NOT NULL,
  transfer_date TEXT NOT NULL,
  notes TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  verified_at TIMESTAMP,
  verified_by UUID REFERENCES users(id)
);

-- 6. TABLA DE ADMINS
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- INSERTAR DATOS INICIALES
-- ============================================

-- Insertar salas
INSERT INTO rooms (id, name, max_players, price, prize, color) VALUES
('standard', 'Sala Standard', 50, 3000, 100000, '#7c3aed'),
('premium', 'Sala Premium', 25, 5000, 100000, '#f59e0b'),
('vip', 'Sala VIP', 15, 10000, 100000, '#ef4444')
ON CONFLICT (id) DO NOTHING;

-- Insertar admin por defecto
INSERT INTO admins (username, password) 
VALUES ('admin', 'RifaFlash2024!')
ON CONFLICT (username) DO UPDATE 
SET password = EXCLUDED.password;

-- Crear números para cada sala
DO $$
BEGIN
  -- Sala Standard (50 números)
  IF NOT EXISTS (SELECT 1 FROM numbers WHERE room_id = 'standard') THEN
    INSERT INTO numbers (room_id, number, status)
    SELECT 'standard', generate_series(1, 50), 'available';
  END IF;
  
  -- Sala Premium (25 números)
  IF NOT EXISTS (SELECT 1 FROM numbers WHERE room_id = 'premium') THEN
    INSERT INTO numbers (room_id, number, status)
    SELECT 'premium', generate_series(1, 25), 'available';
  END IF;
  
  -- Sala VIP (15 números)
  IF NOT EXISTS (SELECT 1 FROM numbers WHERE room_id = 'vip') THEN
    INSERT INTO numbers (room_id, number, status)
    SELECT 'vip', generate_series(1, 15), 'available';
  END IF;
END $$;

-- ============================================
-- FUNCIONES
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

-- Función para crear usuario con contraseña (SIMPLE - sin referidos por ahora)
CREATE OR REPLACE FUNCTION create_user_with_password(
  p_full_name TEXT,
  p_dni TEXT,
  p_phone TEXT,
  p_cvu_alias TEXT,
  p_password TEXT
)
RETURNS UUID AS $$
DECLARE
  new_user_id UUID;
BEGIN
  INSERT INTO users (full_name, dni, phone, cvu_alias, password)
  VALUES (p_full_name, p_dni, p_phone, p_cvu_alias, p_password)
  ON CONFLICT (dni) DO UPDATE 
  SET full_name = EXCLUDED.full_name,
      phone = EXCLUDED.phone,
      cvu_alias = EXCLUDED.cvu_alias,
      password = EXCLUDED.password
  RETURNING id INTO new_user_id;
  
  RETURN new_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar login de usuario
CREATE OR REPLACE FUNCTION verify_user(p_dni TEXT, p_password TEXT)
RETURNS TABLE (
  id UUID, 
  full_name TEXT, 
  dni TEXT, 
  phone TEXT, 
  cvu_alias TEXT,
  game_balance INTEGER,
  referral_code TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id, 
    u.full_name, 
    u.dni, 
    u.phone, 
    u.cvu_alias,
    u.game_balance,
    u.referral_code
  FROM users u
  WHERE u.dni = p_dni 
  AND u.password = p_password;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para crear pago pendiente
CREATE OR REPLACE FUNCTION create_pending_payment(
  p_user_id UUID,
  p_room_id TEXT,
  p_number INTEGER,
  p_amount INTEGER,
  p_sender_name TEXT,
  p_sender_cbu TEXT,
  p_transfer_date TEXT,
  p_notes TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  new_payment_id UUID;
BEGIN
  INSERT INTO pending_payments (
    user_id, room_id, number, amount, 
    sender_name, sender_cbu, transfer_date, notes
  )
  VALUES (
    p_user_id, p_room_id, p_number, p_amount,
    p_sender_name, p_sender_cbu, p_transfer_date, p_notes
  )
  RETURNING id INTO new_payment_id;
  
  RETURN new_payment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para aprobar pago (cambia reserved a occupied)
CREATE OR REPLACE FUNCTION approve_payment(
  p_payment_id UUID,
  p_admin_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_user_id UUID;
  v_room_id TEXT;
  v_number INTEGER;
BEGIN
  -- Obtener datos del pago
  SELECT user_id, room_id, number 
  INTO v_user_id, v_room_id, v_number
  FROM pending_payments 
  WHERE id = p_payment_id AND status = 'pending';
  
  IF v_user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Actualizar estado del pago
  UPDATE pending_payments 
  SET status = 'approved', 
      verified_at = NOW(),
      verified_by = p_admin_id
  WHERE id = p_payment_id;
  
  -- Cambiar número de reserved a occupied
  UPDATE numbers 
  SET status = 'occupied',
      payment_confirmed = TRUE
  WHERE room_id = v_room_id AND number = v_number AND status = 'reserved';
  
  -- Incrementar contador de ocupados
  PERFORM increment_occupied(v_room_id);
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para rechazar pago (libera el número)
CREATE OR REPLACE FUNCTION reject_payment(
  p_payment_id UUID,
  p_admin_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_room_id TEXT;
  v_number INTEGER;
BEGIN
  -- Obtener datos del pago
  SELECT room_id, number 
  INTO v_room_id, v_number
  FROM pending_payments 
  WHERE id = p_payment_id AND status = 'pending';
  
  -- Actualizar estado del pago
  UPDATE pending_payments 
  SET status = 'rejected', 
      verified_at = NOW(),
      verified_by = p_admin_id
  WHERE id = p_payment_id;
  
  -- Liberar el número (volver a available)
  IF v_room_id IS NOT NULL THEN
    UPDATE numbers 
    SET status = 'available',
        user_id = NULL,
        reserved_at = NULL
    WHERE room_id = v_room_id AND number = v_number AND status = 'reserved';
  END IF;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar admin
CREATE OR REPLACE FUNCTION verify_admin(p_username TEXT, p_password TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admins 
    WHERE username = p_username 
    AND password = p_password
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- POLÍTICAS DE SEGURIDAD (RLS)
-- ============================================

-- Habilitar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE winners ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

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

-- Políticas para pending_payments
CREATE POLICY "Allow all read pending_payments" ON pending_payments
  FOR SELECT USING (true);

CREATE POLICY "Allow insert pending_payments" ON pending_payments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update pending_payments" ON pending_payments
  FOR UPDATE USING (true);

-- Políticas para admins
CREATE POLICY "Allow all read admins" ON admins
  FOR SELECT USING (true);

-- ============================================
-- CONFIGURACIÓN REALTIME
-- ============================================

ALTER PUBLICATION supabase_realtime ADD TABLE numbers;
ALTER PUBLICATION supabase_realtime ADD TABLE rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE winners;
ALTER PUBLICATION supabase_realtime ADD TABLE pending_payments;
