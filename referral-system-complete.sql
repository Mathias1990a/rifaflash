-- ============================================
-- SISTEMA COMPLETO DE REFERIDOS
-- ============================================

-- 1. TABLA PARA TRACKING DE REFERIDOS Y PREMIOS
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES users(id) ON DELETE CASCADE, -- Quien refirió
  referred_id UUID REFERENCES users(id) ON DELETE CASCADE, -- Quien fue referido
  referral_code TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, completed, rewarded
  reward_amount INTEGER DEFAULT 3000,
  created_at TIMESTAMP DEFAULT NOW(),
  rewarded_at TIMESTAMP,
  reward_given BOOLEAN DEFAULT FALSE
);

-- 2. ACTUALIZAR TABLA USERS PARA INCLUIR REFERRAL_CODE
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS game_balance INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS has_made_first_purchase BOOLEAN DEFAULT FALSE;

-- 3. ACTUALIZAR TABLA USERS PARA INCLUIR REFERRED_BY
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES users(id);

-- 4. FUNCIÓN PARA GENERAR CÓDIGO DE REFERIDO ÚNICO
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  attempts INTEGER := 0;
BEGIN
  LOOP
    -- Generar código de 6 caracteres alfanuméricos en mayúsculas
    code := upper(substring(md5(random()::text), 1, 6));
    
    -- Verificar que no exista
    IF NOT EXISTS (SELECT 1 FROM users WHERE referral_code = code) THEN
      EXIT;
    END IF;
    
    attempts := attempts + 1;
    IF attempts > 100 THEN
      RAISE EXCEPTION 'No se pudo generar código único después de 100 intentos';
    END IF;
  END LOOP;
  
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- 5. FUNCIÓN ACTUALIZADA PARA CREAR USUARIO CON REFERIDOS
DROP FUNCTION IF EXISTS create_user_with_referral(text,text,text,text,text,text);

CREATE OR REPLACE FUNCTION create_user_with_referral(
  p_full_name TEXT,
  p_dni TEXT,
  p_phone TEXT,
  p_cvu_alias TEXT,
  p_password TEXT,
  p_referral_code TEXT DEFAULT NULL
)
RETURNS TABLE (
  user_id UUID,
  referral_code TEXT,
  success BOOLEAN
) AS $$
DECLARE
  new_user_id UUID;
  new_referral_code TEXT;
  referrer_user_id UUID;
BEGIN
  -- Verificar si el código de referido es válido
  IF p_referral_code IS NOT NULL THEN
    SELECT id INTO referrer_user_id 
    FROM users 
    WHERE referral_code = upper(p_referral_code);
    
    IF referrer_user_id IS NULL THEN
      RAISE EXCEPTION 'Código de referido inválido';
    END IF;
  END IF;
  
  -- Generar código de referido para el nuevo usuario
  new_referral_code := generate_referral_code();
  
  -- Insertar nuevo usuario
  INSERT INTO users (
    full_name, dni, phone, cvu_alias, 
    password, referral_code, referred_by
  )
  VALUES (
    p_full_name, p_dni, p_phone, p_cvu_alias,
    p_password, new_referral_code, referrer_user_id
  )
  RETURNING id INTO new_user_id;
  
  -- Si hay un referido, crear el tracking
  IF referrer_user_id IS NOT NULL THEN
    INSERT INTO referrals (
      referrer_id, referred_id, referral_code
    )
    VALUES (
      referrer_user_id, new_user_id, upper(p_referral_code)
    );
  END IF;
  
  RETURN QUERY SELECT new_user_id, new_referral_code, TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. FUNCIÓN PARA OTORGAR PREMIO DE REFERIDO
CREATE OR REPLACE FUNCTION award_referral_bonus(
  p_referred_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  referral_record RECORD;
BEGIN
  -- Buscar el registro de referido
  SELECT * INTO referral_record
  FROM referrals
  WHERE referred_id = p_referred_id 
  AND status = 'pending'
  AND reward_given = FALSE;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Actualizar balance del referidor
  UPDATE users 
  SET game_balance = game_balance + referral_record.reward_amount
  WHERE id = referral_record.referrer_id;
  
  -- Marcar como completado y recompensado
  UPDATE referrals 
  SET status = 'completed',
      rewarded_at = NOW(),
      reward_given = TRUE
  WHERE id = referral_record.id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. FUNCIÓN PARA MARCAR PRIMERA COMPRA
CREATE OR REPLACE FUNCTION mark_first_purchase(
  p_user_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Marcar primera compra
  UPDATE users 
  SET has_made_first_purchase = TRUE
  WHERE id = p_user_id 
  AND has_made_first_purchase = FALSE;
  
  -- Otorgar bono de referido si aplica
  PERFORM award_referral_bonus(p_user_id);
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. POLÍTICAS DE SEGURIDAD para referrals
-- Eliminar políticas si existen para evitar conflictos
DROP POLICY IF EXISTS "Allow all read referrals" ON referrals;
DROP POLICY IF EXISTS "Allow insert referrals" ON referrals;
DROP POLICY IF EXISTS "Allow update referrals" ON referrals;

-- Crear políticas
CREATE POLICY "Allow all read referrals" ON referrals
  FOR SELECT USING (true);

CREATE POLICY "Allow insert referrals" ON referrals
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update referrals" ON referrals
  FOR UPDATE USING (true);

-- 9. CONFIGURACIÓN REALTIME para referrals
-- Agregar tabla a publicación realtime (si no está ya)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'referrals'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE referrals;
    END IF;
END $$;

-- 10. VERIFICACIÓN
SELECT 'Sistema de referidos creado exitosamente' as status;
