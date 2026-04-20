-- ============================================
-- SISTEMA DE REFERIDOS PARA RIFAFASH
-- ============================================

-- Función para generar código de referido único
CREATE OR REPLACE FUNCTION generate_referral_code(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  new_code TEXT;
  exists_check BOOLEAN;
BEGIN
  -- Generar código basado en primeras 3 letras del hash + 4 números aleatorios
  SELECT UPPER(SUBSTRING(MD5(p_user_id::text), 1, 3) || LPAD(FLOOR(RANDOM() * 10000)::text, 4, '0'))
  INTO new_code;
  
  -- Verificar que no exista
  SELECT EXISTS(SELECT 1 FROM users WHERE referral_code = new_code) INTO exists_check;
  
  IF exists_check THEN
    -- Si existe, generar otro con timestamp
    SELECT UPPER(SUBSTRING(MD5(p_user_id::text || EXTRACT(EPOCH FROM NOW())::text), 1, 3) || LPAD(FLOOR(RANDOM() * 10000)::text, 4, '0'))
    INTO new_code;
  END IF;
  
  RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- Función para crear usuario con código de referido
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
  -- Generar código de referido para el nuevo usuario
  SELECT generate_referral_code(gen_random_uuid()) INTO new_referral_code;
  
  -- Insertar usuario
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

-- Función para procesar bono de referido (cuando el referido hace su primera compra)
CREATE OR REPLACE FUNCTION process_referral_bonus(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  referrer_code TEXT;
  referrer_id UUID;
  user_has_purchased BOOLEAN;
BEGIN
  -- Verificar si el usuario ya hizo una compra antes
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

-- Modificar función approve_payment para procesar referido
CREATE OR REPLACE FUNCTION approve_payment(
  p_payment_id UUID,
  p_admin_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Actualizar estado del pago
  UPDATE pending_payments 
  SET status = 'approved', 
      verified_at = NOW(),
      verified_by = p_admin_id
  WHERE id = p_payment_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Cambiar número de reserved a occupied
  UPDATE numbers 
  SET status = 'occupied',
      payment_confirmed = TRUE
  WHERE id IN (
    SELECT n.id 
    FROM numbers n
    JOIN pending_payments pp ON pp.room_id = n.room_id AND pp.number = n.number
    WHERE pp.id = p_payment_id
  ) AND status = 'reserved';
  
  -- Incrementar contador de ocupados en la sala
  UPDATE rooms 
  SET occupied_count = occupied_count + 1
  WHERE id = (
    SELECT room_id FROM pending_payments WHERE id = p_payment_id
  );
  
  -- Procesar bono de referido
  PERFORM process_referral_bonus(
    (SELECT user_id FROM pending_payments WHERE id = p_payment_id)
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Actualizar usuarios existentes para que tengan código de referido
UPDATE users 
SET referral_code = generate_referral_code(id)
WHERE referral_code IS NULL;

-- Verificar que todo esté creado
SELECT 'Sistema de referidos configurado correctamente' as status;
