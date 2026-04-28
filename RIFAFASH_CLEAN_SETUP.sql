-- ============================================
-- RIFAFLASH - SETUP COMPLETO Y LIMPIO
-- Ejecutar todo de una vez en Supabase
-- ============================================

-- 1. LIMPIAR TODO PRIMERO (cuidado: borra datos)
DROP TABLE IF EXISTS winners CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS numbers CASCADE;
DROP TABLE IF EXISTS rooms CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 2. TABLA DE USUARIOS
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  dni TEXT UNIQUE NOT NULL,
  phone TEXT,
  cvu_alias TEXT,
  referral_code TEXT UNIQUE,
  referred_by TEXT,
  balance INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABLA DE SALAS
CREATE TABLE rooms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  max_players INTEGER NOT NULL,
  price INTEGER NOT NULL,
  prize INTEGER NOT NULL,
  color TEXT DEFAULT '#7c3aed',
  description TEXT,
  occupied_count INTEGER DEFAULT 0
);

-- 4. TABLA DE NÚMEROS
CREATE TABLE numbers (
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

-- 5. TABLA DE PAGOS PENDIENTES
CREATE TABLE payments (
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

-- 6. TABLA DE GANADORES
CREATE TABLE winners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id TEXT REFERENCES rooms(id),
  room_name TEXT,
  number INTEGER NOT NULL,
  player_name TEXT,
  player_dni TEXT,
  prize INTEGER NOT NULL,
  draw_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. INSERTAR SALAS
INSERT INTO rooms (id, name, max_players, price, prize, color, description) VALUES
('standard', 'Sala $3000', 50, 3000, 100000, '#7c3aed', 'Sala estándar con 50 números'),
('premium', 'Sala $5000', 25, 5000, 100000, '#f59e0b', 'Sala premium con 25 números'),
('vip', 'Sala $10000', 15, 10000, 100000, '#ef4444', 'Sala VIP con 15 números');

-- 8. INSERTAR NÚMEROS PARA CADA SALA
-- Sala Standard (1-50)
INSERT INTO numbers (room_id, number, status)
SELECT 'standard', generate_series(1, 50), 'available';

-- Sala Premium (1-25)
INSERT INTO numbers (room_id, number, status)
SELECT 'premium', generate_series(1, 25), 'available';

-- Sala VIP (1-15)
INSERT INTO numbers (room_id, number, status)
SELECT 'vip', generate_series(1, 15), 'available';

-- 9. CREAR USUARIO ADMIN
INSERT INTO users (full_name, dni, phone, referral_code)
VALUES ('Administrador', 'admin', '0000000000', 'ADMIN001');

-- 10. HABILITAR RLS Y CREAR POLÍTICAS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE winners ENABLE ROW LEVEL SECURITY;

-- Políticas públicas (lectura)
CREATE POLICY "Allow public read rooms" ON rooms FOR SELECT USING (true);
CREATE POLICY "Allow public read numbers" ON numbers FOR SELECT USING (true);
CREATE POLICY "Allow public read winners" ON winners FOR SELECT USING (true);

-- Políticas para usuarios autenticados (simulado con anon)
CREATE POLICY "Allow all users read" ON users FOR SELECT USING (true);
CREATE POLICY "Allow all users insert" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all users update" ON users FOR UPDATE USING (true);

CREATE POLICY "Allow all numbers operations" ON numbers FOR ALL USING (true);
CREATE POLICY "Allow all payments operations" ON payments FOR ALL USING (true);

-- 11. FUNCIÓN PARA INCREMENTAR CONTADOR
CREATE OR REPLACE FUNCTION increment_occupied(room_id_param TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE rooms 
  SET occupied_count = occupied_count + 1 
  WHERE id = room_id_param;
END;
$$ LANGUAGE plpgsql;

-- 12. FUNCIÓN PARA VERIFICAR USUARIO (LOGIN)
CREATE OR REPLACE FUNCTION verify_user(p_dni TEXT, p_phone TEXT)
RETURNS TABLE (
  id UUID,
  full_name TEXT,
  dni TEXT,
  phone TEXT,
  referral_code TEXT,
  balance INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT u.id, u.full_name, u.dni, u.phone, u.referral_code, u.balance
  FROM users u
  WHERE u.dni = p_dni AND u.phone = p_phone;
END;
$$ LANGUAGE plpgsql;

-- Verificar que todo se creó
SELECT 'Rooms creadas: ' || COUNT(*)::TEXT FROM rooms;
SELECT 'Numbers creados: ' || COUNT(*)::TEXT FROM numbers;
SELECT 'Users creados: ' || COUNT(*)::TEXT FROM users;
