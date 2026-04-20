-- ============================================
-- SQL COMPLETO PARA RIFAFASH - CON REFERIDOS
-- ============================================

-- 1. BORRAR FUNCIONES EXISTENTES PARA RECREARLAS
DROP FUNCTION IF EXISTS create_user_with_password(TEXT, TEXT, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS create_user_with_referral(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS verify_user(TEXT, TEXT);
DROP FUNCTION IF EXISTS verify_admin(TEXT, TEXT);
DROP FUNCTION IF EXISTS approve_payment(UUID, UUID);
DROP FUNCTION IF EXISTS reject_payment(UUID, UUID);
DROP FUNCTION IF EXISTS create_pending_payment(UUID, TEXT, INTEGER, INTEGER, TEXT, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS process_referral_bonus(UUID);
DROP FUNCTION IF EXISTS generate_referral_code(UUID);

-- 2. FUNCIÓN PARA GENERAR CÓDIGO DE REFERIDO
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

-- 3. FUNCIÓN PARA CREAR USUARIO CON REFERIDO
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

-- 4. FUNCIÓN PARA VERIFICAR USUARIO (LOGIN)
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

-- 5. FUNCIÓN PARA VERIFICAR ADMIN
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

-- 6. FUNCIÓN PARA CREAR PAGO PENDIENTE
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

-- 7. FUNCIÓN PARA PROCESAR BONO DE REFERIDO
CREATE OR REPLACE FUNCTION process_referral_bonus(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  referrer_code TEXT;
  referrer_id UUID;
  user_has_purchased BOOLEAN;
BEGIN
  SELECT has_made_first_purchase INTO user_has_purchased
  FROM users WHERE id = p_user_id;
  
  IF user_has_purchased THEN
    RETURN FALSE;
  END IF;
  
  SELECT referred_by INTO referrer_code
  FROM users WHERE id = p_user_id;
  
  IF referrer_code IS NULL THEN
    RETURN FALSE;
  END IF;
  
  SELECT id INTO referrer_id
  FROM users WHERE referral_code = referrer_code;
  
  IF referrer_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  UPDATE users 
  SET game_balance = game_balance + 3000
  WHERE id = referrer_id;
  
  UPDATE users 
  SET has_made_first_purchase = TRUE
  WHERE id = p_user_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. FUNCIÓN PARA APROBAR PAGO
CREATE OR REPLACE FUNCTION approve_payment(
  p_payment_id UUID,
  p_admin_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE pending_payments 
  SET status = 'approved', 
      verified_at = NOW(),
      verified_by = p_admin_id
  WHERE id = p_payment_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  UPDATE numbers 
  SET status = 'occupied',
      payment_confirmed = TRUE
  WHERE id IN (
    SELECT n.id 
    FROM numbers n
    JOIN pending_payments pp ON pp.room_id = n.room_id AND pp.number = n.number
    WHERE pp.id = p_payment_id
  ) AND status = 'reserved';
  
  UPDATE rooms 
  SET occupied_count = occupied_count + 1
  WHERE id = (
    SELECT room_id FROM pending_payments WHERE id = p_payment_id
  );
  
  PERFORM process_referral_bonus(
    (SELECT user_id FROM pending_payments WHERE id = p_payment_id)
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. FUNCIÓN PARA RECHAZAR PAGO
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
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  UPDATE numbers 
  SET status = 'available',
      user_id = NULL,
      reserved_at = NULL
  WHERE id IN (
    SELECT n.id 
    FROM numbers n
    JOIN pending_payments pp ON pp.room_id = n.room_id AND pp.number = n.number
    WHERE pp.id = p_payment_id
  ) AND status = 'reserved';
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. ACTUALIZAR USUARIOS EXISTENTES CON CÓDIGO DE REFERIDO
UPDATE users 
SET referral_code = generate_referral_code(id)
WHERE referral_code IS NULL;

-- VERIFICAR QUE TODO ESTÉ CREADO
SELECT '✅ Funciones creadas correctamente' as status;
