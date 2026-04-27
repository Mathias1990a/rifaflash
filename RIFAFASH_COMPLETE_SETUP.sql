-- ============================================
-- SQL COMPLETO PARA RIFAFASH - TODO EN UNO
-- ============================================

-- 1. BORRAR TODO Y RECREAR DESDE CERO
DROP TABLE IF EXISTS pending_payments CASCADE;
DROP TABLE IF EXISTS winners CASCADE;
DROP TABLE IF EXISTS numbers CASCADE;
DROP TABLE IF EXISTS rooms CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS admins CASCADE;

-- 2. CREAR TABLA ADMINS
CREATE TABLE admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insertar admin
INSERT INTO admins (username, password) VALUES ('admin', 'RifaFlash2024!');

-- 3. CREAR TABLA USUARIOS
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  dni TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  cvu_alias TEXT NOT NULL,
  password TEXT,
  referral_code TEXT UNIQUE,
  referred_by TEXT,
  game_balance INTEGER DEFAULT 0,
  has_made_first_purchase BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. CREAR TABLA SALAS
CREATE TABLE rooms (
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

-- Insertar salas
INSERT INTO rooms (id, name, max_players, price, prize, color) VALUES
('standard', 'Sala Standard', 50, 3000, 100000, '#7c3aed'),
('premium', 'Sala Premium', 25, 5000, 100000, '#f59e0b'),
('vip', 'Sala VIP', 15, 10000, 100000, '#ef4444');

-- 5. CREAR TABLA NÚMEROS
CREATE TABLE numbers (
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

-- Crear números para cada sala
INSERT INTO numbers (room_id, number, status)
SELECT 'standard', generate_series(1, 50), 'available';

INSERT INTO numbers (room_id, number, status)
SELECT 'premium', generate_series(1, 25), 'available';

INSERT INTO numbers (room_id, number, status)
SELECT 'vip', generate_series(1, 15), 'available';

-- 6. CREAR TABLA GANADORES
CREATE TABLE winners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id TEXT REFERENCES rooms(id),
  room_name TEXT NOT NULL,
  number INTEGER NOT NULL,
  player_name TEXT NOT NULL,
  player_dni TEXT NOT NULL,
  prize INTEGER NOT NULL,
  draw_date TIMESTAMP DEFAULT NOW()
);

-- 7. CREAR TABLA PAGOS PENDIENTES
CREATE TABLE pending_payments (
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

-- 8. FUNCIONES

-- Función para generar código de referido
CREATE OR REPLACE FUNCTION generate_referral_code(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  new_code TEXT;
  exists_check BOOLEAN;
BEGIN
  SELECT UPPER(SUBSTRING(MD5(p_user_id::text), 1, 3) || LPAD(FLOOR(RANDOM() * 10000)::text, 4, '0'))
  INTO new_code;
  
  SELECT EXISTS(SELECT 1 FROM users WHERE referral_code = new_code) INTO exists_check;
  
  IF exists_check THEN
    SELECT UPPER(SUBSTRING(MD5(p_user_id::text || EXTRACT(EPOCH FROM NOW())::text), 1, 3) || LPAD(FLOOR(RANDOM() * 10000)::text, 4, '0'))
    INTO new_code;
  END IF;
  
  RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- Función para crear usuario con referido
CREATE OR REPLACE FUNCTION create_user_with_referral(
  p_full_name TEXT,
  p_dni TEXT,
  p_phone TEXT,
  p_cvu_alias TEXT,
  p_password TEXT,
  p_referral_code TEXT DEFAULT NULL
)
RETURNS TABLE (user_id UUID, code TEXT) AS $$
DECLARE
  new_user_id UUID;
  new_referral_code TEXT;
BEGIN
  SELECT generate_referral_code(gen_random_uuid()) INTO new_referral_code;
  
  INSERT INTO users (full_name, dni, phone, cvu_alias, password, referral_code, referred_by, game_balance)
  VALUES (p_full_name, p_dni, p_phone, p_cvu_alias, p_password, new_referral_code, p_referral_code, 0)
  ON CONFLICT (dni) DO UPDATE 
  SET full_name = EXCLUDED.full_name,
      phone = EXCLUDED.phone,
      cvu_alias = EXCLUDED.cvu_alias,
      password = EXCLUDED.password,
      referral_code = COALESCE(users.referral_code, new_referral_code)
  RETURNING users.id INTO new_user_id;
  
  RETURN QUERY SELECT new_user_id, new_referral_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar usuario
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
  SELECT u.id, u.full_name, u.dni, u.phone, u.cvu_alias, u.game_balance, u.referral_code
  FROM users u
  WHERE u.dni = p_dni AND u.password = p_password;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar admin
CREATE OR REPLACE FUNCTION verify_admin(p_username TEXT, p_password TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admins WHERE username = p_username AND password = p_password
  );
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
  INSERT INTO pending_payments (user_id, room_id, number, amount, sender_name, sender_cbu, transfer_date, notes, status, created_at)
  VALUES (p_user_id, p_room_id, p_number, p_amount, p_sender_name, p_sender_cbu, p_transfer_date, p_notes, 'pending', NOW())
  RETURNING id INTO new_payment_id;
  RETURN new_payment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para procesar bono de referido
CREATE OR REPLACE FUNCTION process_referral_bonus(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  referrer_code TEXT;
  referrer_id UUID;
  user_has_purchased BOOLEAN;
BEGIN
  SELECT has_made_first_purchase INTO user_has_purchased FROM users WHERE id = p_user_id;
  IF user_has_purchased THEN RETURN FALSE; END IF;
  
  SELECT referred_by INTO referrer_code FROM users WHERE id = p_user_id;
  IF referrer_code IS NULL THEN RETURN FALSE; END IF;
  
  SELECT id INTO referrer_id FROM users WHERE referral_code = referrer_code;
  IF referrer_id IS NULL THEN RETURN FALSE; END IF;
  
  UPDATE users SET game_balance = game_balance + 3000 WHERE id = referrer_id;
  UPDATE users SET has_made_first_purchase = TRUE WHERE id = p_user_id;
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para aprobar pago
CREATE OR REPLACE FUNCTION approve_payment(p_payment_id UUID, p_admin_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE pending_payments SET status = 'approved', verified_at = NOW(), verified_by = p_admin_id
  WHERE id = p_payment_id AND status = 'pending';
  IF NOT FOUND THEN RETURN FALSE; END IF;
  
  UPDATE numbers SET status = 'occupied', payment_confirmed = TRUE
  WHERE id IN (SELECT n.id FROM numbers n JOIN pending_payments pp ON pp.room_id = n.room_id AND pp.number = n.number WHERE pp.id = p_payment_id) AND status = 'reserved';
  
  UPDATE rooms SET occupied_count = occupied_count + 1 WHERE id = (SELECT room_id FROM pending_payments WHERE id = p_payment_id);
  
  PERFORM process_referral_bonus((SELECT user_id FROM pending_payments WHERE id = p_payment_id));
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para rechazar pago
CREATE OR REPLACE FUNCTION reject_payment(p_payment_id UUID, p_admin_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE pending_payments SET status = 'rejected', verified_at = NOW(), verified_by = p_admin_id
  WHERE id = p_payment_id AND status = 'pending';
  IF NOT FOUND THEN RETURN FALSE; END IF;
  
  UPDATE numbers SET status = 'available', user_id = NULL, reserved_at = NULL
  WHERE id IN (SELECT n.id FROM numbers n JOIN pending_payments pp ON pp.room_id = n.room_id AND pp.number = n.number WHERE pp.id = p_payment_id) AND status = 'reserved';
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. POLÍTICAS DE SEGURIDAD
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE winners ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all read users" ON users FOR SELECT USING (true);
CREATE POLICY "Allow insert users" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all read rooms" ON rooms FOR SELECT USING (true);
CREATE POLICY "Allow all read numbers" ON numbers FOR SELECT USING (true);
CREATE POLICY "Allow update numbers" ON numbers FOR UPDATE USING (true);
CREATE POLICY "Allow all read winners" ON winners FOR SELECT USING (true);
CREATE POLICY "Allow insert winners" ON winners FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all read pending_payments" ON pending_payments FOR SELECT USING (true);
CREATE POLICY "Allow insert pending_payments" ON pending_payments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update pending_payments" ON pending_payments FOR UPDATE USING (true);
CREATE POLICY "Allow all read admins" ON admins FOR SELECT USING (true);

-- 10. REALTIME
ALTER PUBLICATION supabase_realtime ADD TABLE numbers;
ALTER PUBLICATION supabase_realtime ADD TABLE rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE winners;
ALTER PUBLICATION supabase_realtime ADD TABLE pending_payments;

-- VERIFICAR
SELECT '✅ Base de datos creada correctamente' as status;
SELECT * FROM rooms;
SELECT room_id, COUNT(*) as total FROM numbers GROUP BY room_id;
