-- ============================================
-- CREAR FUNCIONES FALTANTES
-- ============================================

-- Función para crear usuario con código de referido
CREATE OR REPLACE FUNCTION create_user_with_referral(
  p_full_name TEXT,
  p_dni TEXT,
  p_phone TEXT,
  p_cvu_alias TEXT,
  p_password TEXT,
  p_referral_code TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  full_name TEXT,
  dni TEXT,
  phone TEXT,
  referral_code TEXT
) AS $$
DECLARE
  v_user_id UUID;
  v_new_referral_code TEXT;
  v_referrer_id UUID;
BEGIN
  -- Generar código de referido único
  v_new_referral_code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
  
  -- Buscar si hay código de referido válido
  IF p_referral_code IS NOT NULL THEN
    SELECT u.id INTO v_referrer_id
    FROM users u
    WHERE u.referral_code = UPPER(p_referral_code);
  END IF;
  
  -- Crear usuario
  INSERT INTO users (full_name, dni, phone, cvu_alias, referral_code, referred_by)
  VALUES (p_full_name, p_dni, p_phone, p_cvu_alias, v_new_referral_code, v_referrer_id)
  RETURNING users.id INTO v_user_id;
  
  -- Retornar datos del usuario creado
  RETURN QUERY
  SELECT u.id, u.full_name, u.dni, u.phone, u.referral_code
  FROM users u
  WHERE u.id = v_user_id;
END;
$$ LANGUAGE plpgsql;

-- Verificar que se creó
SELECT 'Función create_user_with_referral creada' as status;
