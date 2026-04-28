-- ============================================
-- SQL COMPLETO - TODO EN UNO
-- Ejecutar esto UNA SOLA VEZ
-- ============================================

-- 1. TABLAS (solo si no existen)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  dni TEXT UNIQUE NOT NULL,
  phone TEXT,
  cvu_alias TEXT,
  referral_code TEXT UNIQUE,
  referred_by UUID REFERENCES users(id),
  balance INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rooms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  max_players INTEGER NOT NULL,
  price INTEGER NOT NULL,
  prize INTEGER NOT NULL,
  color TEXT DEFAULT '#7c3aed',
  description TEXT,
  occupied_count INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS numbers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id TEXT REFERENCES rooms(id) ON DELETE CASCADE,
  number INTEGER NOT NULL,
  status TEXT DEFAULT 'available',
  user_id UUID REFERENCES users(id),
  reserved_at TIMESTAMP WITH TIME ZONE,
  payment_method TEXT,
  payment_confirmed BOOLEAN DEFAULT FALSE,
  UNIQUE(room_id, number)
);

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  room_id TEXT REFERENCES rooms(id),
  number INTEGER NOT NULL,
  amount INTEGER NOT NULL,
  sender_name TEXT,
  sender_cbu TEXT,
  date DATE,
  notes TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS winners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id TEXT REFERENCES rooms(id),
  room_name TEXT,
  number INTEGER NOT NULL,
  player_name TEXT,
  player_dni TEXT,
  prize INTEGER NOT NULL,
  draw_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. INSERTAR SALAS (solo si no existen)
INSERT INTO rooms (id, name, max_players, price, prize, color, description) VALUES
('standard', 'Sala $3000', 50, 3000, 100000, '#7c3aed', 'Sala estándar con 50 números'),
('premium', 'Sala $5000', 25, 5000, 100000, '#f59e0b', 'Sala premium con 25 números'),
('vip', 'Sala $10000', 15, 10000, 100000, '#ef4444', 'Sala VIP con 15 números')
ON CONFLICT (id) DO NOTHING;

-- 3. INSERTAR NÚMEROS SOLO SI LA TABLA ESTÁ VACÍA
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM numbers LIMIT 1) THEN
    INSERT INTO numbers (room_id, number, status)
    SELECT 'standard', generate_series(1, 50), 'available';
    INSERT INTO numbers (room_id, number, status)
    SELECT 'premium', generate_series(1, 25), 'available';
    INSERT INTO numbers (room_id, number, status)
    SELECT 'vip', generate_series(1, 15), 'available';
  END IF;
END $$;

-- 4. FUNCIONES
CREATE OR REPLACE FUNCTION create_user_with_referral(
  p_full_name TEXT, p_dni TEXT, p_phone TEXT, p_cvu_alias TEXT, p_password TEXT, p_referral_code TEXT DEFAULT NULL
) RETURNS TABLE (id UUID, full_name TEXT, dni TEXT, phone TEXT, referral_code TEXT) AS $$
DECLARE v_user_id UUID; v_new_referral_code TEXT; v_referrer_id UUID;
BEGIN
  IF EXISTS (SELECT 1 FROM users WHERE users.dni = p_dni) THEN
    RAISE EXCEPTION 'Usuario con DNI % ya existe', p_dni USING ERRCODE = 'unique_violation';
  END IF;
  v_new_referral_code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
  IF p_referral_code IS NOT NULL THEN
    SELECT u.id INTO v_referrer_id FROM users u WHERE u.referral_code = UPPER(p_referral_code);
  END IF;
  INSERT INTO users (full_name, dni, phone, cvu_alias, referral_code, referred_by)
  VALUES (p_full_name, p_dni, p_phone, p_cvu_alias, v_new_referral_code, v_referrer_id)
  RETURNING users.id INTO v_user_id;
  RETURN QUERY SELECT u.id, u.full_name, u.dni, u.phone, u.referral_code FROM users u WHERE u.id = v_user_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION verify_user(p_dni TEXT, p_phone TEXT)
RETURNS TABLE (id UUID, full_name TEXT, dni TEXT, phone TEXT, referral_code TEXT, balance INTEGER) AS $$
BEGIN
  RETURN QUERY SELECT u.id, u.full_name, u.dni, u.phone, u.referral_code, u.balance FROM users u WHERE u.dni = p_dni AND u.phone = p_phone;
END;
$$ LANGUAGE plpgsql;

-- 5. VERIFICACIÓN
SELECT room_id, COUNT(*) as total FROM numbers GROUP BY room_id ORDER BY room_id;
