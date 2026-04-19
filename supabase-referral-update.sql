-- ============================================
-- ACTUALIZACIÓN RIFAFASH - SISTEMA DE REFERIDOS Y PAGOS
-- ============================================

-- 1. Actualizar tabla users con campos de referidos y saldo
ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS game_balance INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS has_made_first_purchase BOOLEAN DEFAULT FALSE;

-- 2. Crear tabla de pagos pendientes
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
  status TEXT DEFAULT 'pending', -- pending, approved, rejected
  created_at TIMESTAMP DEFAULT NOW(),
  verified_at TIMESTAMP,
  verified_by UUID REFERENCES admins(id)
);

-- 3. Función para generar código de referido único
CREATE OR REPLACE FUNCTION generate_referral_code(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  new_code TEXT;
  exists_check BOOLEAN;
BEGIN
  -- Generar código basado en primeras 3 letras del nombre + 4 números aleatorios
  SELECT UPPER(SUBSTRING(MD5(p_user_id::text), 1, 3) || LPAD(FLOOR(RANDOM() * 10000)::text, 4, '0'))
  INTO new_code;
  
  -- Verificar que no exista
  SELECT EXISTS(SELECT 1 FROM users WHERE referral_code = new_code) INTO exists_check;
  
  IF exists_check THEN
    -- Si existe, generar otro
    SELECT UPPER(SUBSTRING(MD5(p_user_id::text || NOW()::text), 1, 3) || LPAD(FLOOR(RANDOM() * 10000)::text, 4, '0'))
    INTO new_code;
  END IF;
  
  RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- 4. Función para crear usuario con referido
CREATE OR REPLACE FUNCTION create_user_with_referral(
  p_full_name TEXT,
  p_dni TEXT,
  p_phone TEXT,
  p_cvu_alias TEXT,
  p_password TEXT,
  p_referral_code TEXT DEFAULT NULL
)
RETURNS TABLE (id UUID, referral_code TEXT) AS $$
DECLARE
  new_user_id UUID;
  new_referral_code TEXT;
  referrer_id UUID;
BEGIN
  -- Generar código de referido para el nuevo usuario
  SELECT generate_referral_code(gen_random_uuid()) INTO new_referral_code;
  
  -- Buscar al referente si existe
  IF p_referral_code IS NOT NULL THEN
    SELECT u.id INTO referrer_id 
    FROM users u 
    WHERE u.referral_code = p_referral_code;
  END IF;
  
  -- Insertar usuario
  INSERT INTO users (full_name, dni, phone, cvu_alias, password, referral_code, referred_by, game_balance)
  VALUES (p_full_name, p_dni, p_phone, p_cvu_alias, p_password, new_referral_code, p_referral_code, 0)
  ON CONFLICT (dni) DO UPDATE 
  SET full_name = EXCLUDED.full_name,
      phone = EXCLUDED.phone,
      cvu_alias = EXCLUDED.cvu_alias,
      password = EXCLUDED.password
  RETURNING users.id INTO new_user_id;
  
  -- Si había un referente válido, notificar (esto se manejará en la app)
  
  RETURN QUERY SELECT new_user_id, new_referral_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Función para procesar referido exitoso (cuando el referido hace su primera compra)
CREATE OR REPLACE FUNCTION process_referral_bonus(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  referrer_code TEXT;
  referrer_id UUID;
  user_has_purchased BOOLEAN;
BEGIN
  -- Verificar si el usuario ya hizo una compra
  SELECT has_made_first_purchase INTO user_has_purchased
  FROM users WHERE id = p_user_id;
  
  IF user_has_purchased THEN
    RETURN FALSE; -- Ya se procesó el bono
  END IF;
  
  -- Obtener el código del referente
  SELECT referred_by INTO referrer_code
  FROM users WHERE id = p_user_id;
  
  IF referrer_code IS NULL THEN
    RETURN FALSE; -- No fue referido
  END IF;
  
  -- Buscar al referente
  SELECT id INTO referrer_id
  FROM users WHERE referral_code = referrer_code;
  
  IF referrer_id IS NULL THEN
    RETURN FALSE; -- Referente no encontrado
  END IF;
  
  -- Acreditar bono de $3000 al referente (solo para jugar)
  UPDATE users 
  SET game_balance = game_balance + 3000
  WHERE id = referrer_id;
  
  -- Marcar que el usuario hizo su primera compra
  UPDATE users 
  SET has_made_first_purchase = TRUE
  WHERE id = p_user_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Función para crear pago pendiente
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

-- 7. Función para aprobar pago
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
  
  -- Reservar el número
  UPDATE numbers 
  SET status = 'occupied',
      user_id = v_user_id,
      payment_confirmed = TRUE
  WHERE room_id = v_room_id AND number = v_number;
  
  -- Incrementar contador de ocupados
  PERFORM increment_occupied(v_room_id);
  
  -- Procesar bono de referido si es la primera compra
  PERFORM process_referral_bonus(v_user_id);
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Función para rechazar pago
CREATE OR REPLACE FUNCTION reject_payment(
  p_payment_id UUID,
  p_admin_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE pending_payments 
  SET status = 'rejected', 
      verified_at = NOW(),
      verified_by = p_admin_id
  WHERE id = p_payment_id AND status = 'pending';
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Función para obtener pagos pendientes
CREATE OR REPLACE FUNCTION get_pending_payments()
RETURNS TABLE (
  id UUID,
  user_name TEXT,
  user_dni TEXT,
  room_name TEXT,
  number INTEGER,
  amount INTEGER,
  sender_name TEXT,
  sender_cbu TEXT,
  transfer_date TEXT,
  notes TEXT,
  created_at TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pp.id,
    u.full_name,
    u.dni,
    r.name,
    pp.number,
    pp.amount,
    pp.sender_name,
    pp.sender_cbu,
    pp.transfer_date,
    pp.notes,
    pp.created_at
  FROM pending_payments pp
  JOIN users u ON u.id = pp.user_id
  JOIN rooms r ON r.id = pp.room_id
  WHERE pp.status = 'pending'
  ORDER BY pp.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Políticas de seguridad para pending_payments
ALTER TABLE pending_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all read pending_payments" ON pending_payments
  FOR SELECT USING (true);

CREATE POLICY "Allow insert pending_payments" ON pending_payments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update pending_payments" ON pending_payments
  FOR UPDATE USING (true);

-- ============================================
-- DATOS DE PRUEBA (opcional)
-- ============================================
-- Generar códigos de referido para usuarios existentes
-- UPDATE users SET referral_code = generate_referral_code(id) WHERE referral_code IS NULL;
