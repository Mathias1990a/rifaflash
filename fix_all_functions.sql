-- ============================================
-- CREAR TODAS LAS FUNCIONES NECESARIAS
-- ============================================

-- 1. Función para crear usuario con referido
CREATE OR REPLACE FUNCTION create_user_with_referral(
  p_full_name TEXT,
  p_dni TEXT,
  p_phone TEXT,
  p_cvu_alias TEXT,
  p_password TEXT,
  p_referral_code TEXT DEFAULT NULL
)
RETURNS TABLE (id UUID, full_name TEXT, dni TEXT, phone TEXT, referral_code TEXT) AS $$
DECLARE
  v_user_id UUID;
  v_new_referral_code TEXT;
  v_referrer_id UUID;
BEGIN
  -- Verificar si el DNI ya existe
  IF EXISTS (SELECT 1 FROM users WHERE users.dni = p_dni) THEN
    RAISE EXCEPTION 'Usuario con DNI % ya existe', p_dni USING ERRCODE = 'unique_violation';
  END IF;
  
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
  
  RETURN QUERY
  SELECT u.id, u.full_name, u.dni, u.phone, u.referral_code
  FROM users u WHERE u.id = v_user_id;
END;
$$ LANGUAGE plpgsql;

-- 2. Función para verificar usuario (login)
CREATE OR REPLACE FUNCTION verify_user(p_dni TEXT, p_phone TEXT)
RETURNS TABLE (id UUID, full_name TEXT, dni TEXT, phone TEXT, referral_code TEXT, balance INTEGER) AS $$
BEGIN
  RETURN QUERY
  SELECT u.id, u.full_name, u.dni, u.phone, u.referral_code, u.balance
  FROM users u
  WHERE u.dni = p_dni AND u.phone = p_phone;
END;
$$ LANGUAGE plpgsql;

-- Verificar
SELECT 'Funciones creadas correctamente' as status;
