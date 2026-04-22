-- ============================================
-- SISTEMA COMPLETO DE NOTIFICACIONES TELEGRAM
-- ============================================

-- Función para notificar creación de usuario con referido
CREATE OR REPLACE FUNCTION notify_user_created(
  p_user_id UUID,
  p_has_referral BOOLEAN DEFAULT FALSE
)
RETURNS VOID AS $$
DECLARE
  user_record RECORD;
  referrer_record RECORD;
  message TEXT;
BEGIN
  -- Obtener datos del usuario
  SELECT full_name, dni, referral_code, referred_by 
  INTO user_record
  FROM users 
  WHERE id = p_user_id;
  
  -- Construir mensaje
  IF p_has_referral AND user_record.referred_by IS NOT NULL THEN
    -- Usuario con referido
    SELECT full_name INTO referrer_record
    FROM users 
    WHERE id = user_record.referred_by;
    
    message := format('
    <b>¡NUEVO USUARIO CON REFERIDO! </b> 
    <b>Nombre:</b> %s
    <b>DNI:</b> %s
    <b>Código Referido:</b> %s
    <b>Referido por:</b> %s
    <b>Fecha:</b> %s
    ', 
    user_record.full_name, 
    user_record.dni,
    user_record.referral_code,
    referrer_record.full_name,
    NOW()
    );
  ELSE
    -- Usuario sin referido
    message := format('
    <b>¡NUEVO USUARIO REGISTRADO! </b> 
    <b>Nombre:</b> %s
    <b>DNI:</b> %s
    <b>Código Referido:</b> %s
    <b>Fecha:</b> %s
    ', 
    user_record.full_name, 
    user_record.dni,
    user_record.referral_code,
    NOW()
    );
  END IF;
  
  -- Enviar notificación (implementar según tu configuración de Telegram)
  -- PERFORM telegram_send_message(message);
  
  -- Log para debugging
  RAISE LOG 'Notificación de usuario creado: %', message;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para notificar premio de referido
CREATE OR REPLACE FUNCTION notify_referral_award(
  p_referrer_id UUID,
  p_referred_name TEXT,
  p_amount INTEGER
)
RETURNS VOID AS $$
DECLARE
  referrer_record RECORD;
  message TEXT;
BEGIN
  -- Obtener datos del referidor
  SELECT full_name, dni, game_balance 
  INTO referrer_record
  FROM users 
  WHERE id = p_referrer_id;
  
  -- Construir mensaje
  message := format('
    <b>¡PREMIO DE REFERIDO OTORGADO! </b> 
    <b>Referidor:</b> %s (DNI: %s)
    <b>Referido:</b> %s
    <b>Premio:</b> $%s
    <b>Balance Actual:</b> $%s
    <b>Fecha:</b> %s
    ', 
    referrer_record.full_name,
    referrer_record.dni,
    p_referred_name,
    p_amount,
    referrer_record.game_balance,
    NOW()
    );
  
  -- Enviar notificación
  -- PERFORM telegram_send_message(message);
  
  -- Log para debugging
  RAISE LOG 'Notificación de premio de referido: %', message;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para notificar pago pendiente
CREATE OR REPLACE FUNCTION notify_pending_payment(
  p_payment_id UUID
)
RETURNS VOID AS $$
DECLARE
  payment_record RECORD;
  user_record RECORD;
  message TEXT;
BEGIN
  -- Obtener datos del pago y usuario
  SELECT 
    pp.user_id, pp.room_id, pp.number, pp.amount, 
    pp.sender_name, pp.transfer_date, pp.created_at
  INTO payment_record
  FROM pending_payments pp
  WHERE pp.id = p_payment_id;
  
  SELECT full_name, dni 
  INTO user_record
  FROM users 
  WHERE id = payment_record.user_id;
  
  -- Construir mensaje
  message := format('
    <b>¡NUEVO PAGO PENDIENTE! </b> 
    <b>Usuario:</b> %s (DNI: %s)
    <b>Sala:</b> %s
    <b>Número:</b> #%s
    <b>Monto:</b> $%s
    <b>Titular Origen:</b> %s
    <b>Fecha Transferencia:</b> %s
    <b>Fecha Registro:</b> %s
    ', 
    user_record.full_name,
    user_record.dni,
    payment_record.room_id,
    payment_record.number,
    payment_record.amount,
    payment_record.sender_name,
    payment_record.transfer_date,
    payment_record.created_at
  );
  
  -- Enviar notificación
  -- PERFORM telegram_send_message(message);
  
  -- Log para debugging
  RAISE LOG 'Notificación de pago pendiente: %', message;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para notificar sorteo automático
CREATE OR REPLACE FUNCTION notify_raffle_winner(
  p_room_id TEXT,
  p_winner_id UUID,
  p_winner_number INTEGER
)
RETURNS VOID AS $$
DECLARE
  winner_record RECORD;
  room_record RECORD;
  message TEXT;
BEGIN
  -- Obtener datos del ganador y sala
  SELECT full_name, dni 
  INTO winner_record
  FROM users 
  WHERE id = p_winner_id;
  
  SELECT name, price, max_numbers 
  INTO room_record
  FROM rooms 
  WHERE id = p_room_id;
  
  -- Construir mensaje
  message := format('
    <b>¡SORTEO REALIZADO AUTOMÁTICAMENTE! </b> 
    <b>Sala:</b> %s
    <b>Premio:</b> $%s
    <b>Ganador:</b> %s (DNI: %s)
    <b>Número Ganador:</b> #%s
    <b>Participantes:</b> %s
    <b>Fecha:</b> %s
    ', 
    room_record.name,
    room_record.price * room_record.max_numbers,
    winner_record.full_name,
    winner_record.dni,
    p_winner_number,
    room_record.max_numbers,
    NOW()
  );
  
  -- Enviar notificación
  -- PERFORM telegram_send_message(message);
  
  -- Log para debugging
  RAISE LOG 'Notificación de sorteo realizado: %', message;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- ACTUALIZAR FUNCIONES EXISTENTES PARA NOTIFICAR
-- ============================================

-- Actualizar create_user_with_referral para notificar
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
  
  -- Notificar creación de usuario
  PERFORM notify_user_created(new_user_id, referrer_user_id IS NOT NULL);
  
  RETURN QUERY SELECT new_user_id, new_referral_code, TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Actualizar create_pending_payment para notificar
DROP FUNCTION IF EXISTS create_pending_payment(uuid,text,integer,integer,text,text,text,text);

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
  
  -- Notificar pago pendiente
  PERFORM notify_pending_payment(new_payment_id);
  
  RETURN new_payment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Actualizar award_referral_bonus para notificar
DROP FUNCTION IF EXISTS award_referral_bonus(uuid);

CREATE OR REPLACE FUNCTION award_referral_bonus(
  p_referred_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  referral_record RECORD;
  referred_user_name TEXT;
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
  
  -- Obtener nombre del referido
  SELECT full_name INTO referred_user_name
  FROM users 
  WHERE id = p_referred_id;
  
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
  
  -- Notificar premio de referido
  PERFORM notify_referral_award(
    referral_record.referrer_id, 
    referred_user_name, 
    referral_record.reward_amount
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- VERIFICACIÓN
-- ============================================

SELECT 'Sistema de notificaciones Telegram completado' as status;
