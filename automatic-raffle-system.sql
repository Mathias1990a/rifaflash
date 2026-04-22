-- ============================================
-- SISTEMA AUTOMÁTICO DE SORTEO AL TERMINAR SALA
-- ============================================

-- Función para realizar sorteo automático
CREATE OR REPLACE FUNCTION automatic_raffle_draw(
  p_room_id TEXT
)
RETURNS TABLE (
  winner_id UUID,
  winner_number INTEGER,
  winner_name TEXT,
  winner_dni TEXT,
  prize_amount INTEGER,
  success BOOLEAN
) AS $$
DECLARE
  room_record RECORD;
  available_numbers RECORD;
  selected_number INTEGER;
  winner_user_id UUID;
  winner_user_data RECORD;
  prize_total INTEGER;
BEGIN
  -- Verificar que la sala esté completa
  SELECT * INTO room_record
  FROM rooms 
  WHERE id = p_room_id AND is_complete = TRUE;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT NULL, NULL, NULL, NULL, NULL, FALSE;
    RETURN;
  END IF;
  
  -- Verificar que ya no tenga ganador
  IF EXISTS (SELECT 1 FROM winners WHERE room_id = p_room_id) THEN
    RETURN QUERY SELECT NULL, NULL, NULL, NULL, NULL, FALSE;
    RETURN;
  END IF;
  
  -- Obtener números disponibles (ocupados)
  CREATE TEMPORARY TABLE temp_available_numbers AS
  SELECT number, user_id 
  FROM numbers 
  WHERE room_id = p_room_id 
  AND status = 'occupied';
  
  -- Verificar que haya números disponibles
  IF NOT EXISTS (SELECT 1 FROM temp_available_numbers) THEN
    DROP TABLE temp_available_numbers;
    RETURN QUERY SELECT NULL, NULL, NULL, NULL, NULL, FALSE;
    RETURN;
  END IF;
  
  -- Seleccionar número aleatorio
  SELECT number, user_id 
  INTO selected_number, winner_user_id
  FROM temp_available_numbers 
  ORDER BY RANDOM() 
  LIMIT 1;
  
  DROP TABLE temp_available_numbers;
  
  -- Obtener datos del ganador
  SELECT full_name, dni 
  INTO winner_user_data
  FROM users 
  WHERE id = winner_user_id;
  
  -- Calcular premio total
  prize_total := room_record.price * room_record.max_numbers;
  
  -- Registrar ganador
  INSERT INTO winners (
    room_id, user_id, number, prize_amount, drawn_at
  )
  VALUES (
    p_room_id, winner_user_id, selected_number, prize_total, NOW()
  );
  
  -- Marcar sala como sorteada
  UPDATE rooms 
  SET is_drawn = TRUE, drawn_at = NOW()
  WHERE id = p_room_id;
  
  -- Notificar sorteo
  PERFORM notify_raffle_winner(p_room_id, winner_user_id, selected_number);
  
  -- Retornar resultados
  RETURN QUERY 
  SELECT 
    winner_user_id, 
    selected_number, 
    winner_user_data.full_name, 
    winner_user_data.dni, 
    prize_total, 
    TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger automático para realizar sorteo cuando se completa la sala
CREATE OR REPLACE FUNCTION trigger_automatic_raffle()
RETURNS TRIGGER AS $$
BEGIN
  -- Si la sala se acaba de completar, realizar sorteo automático
  IF NEW.is_complete = TRUE AND OLD.is_complete = FALSE THEN
    PERFORM automatic_raffle_draw(NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear trigger si no existe
DROP TRIGGER IF EXISTS auto_raffle_trigger ON rooms;
CREATE TRIGGER auto_raffle_trigger
AFTER UPDATE ON rooms
FOR EACH ROW
EXECUTE FUNCTION trigger_automatic_raffle();

-- Función para verificar y realizar sorteos pendientes (para ejecución manual)
CREATE OR REPLACE FUNCTION process_pending_raffles()
RETURNS INTEGER AS $$
DECLARE
  completed_rooms RECORD;
  raffles_processed INTEGER := 0;
BEGIN
  -- Buscar salas completas pero no sorteadas
  FOR completed_rooms IN 
    SELECT id 
    FROM rooms 
    WHERE is_complete = TRUE 
    AND is_drawn = FALSE
  LOOP
    -- Realizar sorteo
    PERFORM automatic_raffle_draw(completed_rooms.id);
    raffles_processed := raffles_processed + 1;
  END LOOP;
  
  RETURN raffles_processed;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Actualizar tabla rooms para incluir campos de sorteo
ALTER TABLE rooms 
ADD COLUMN IF NOT EXISTS is_drawn BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS drawn_at TIMESTAMP;

-- Función para obtener estado del sorteo
CREATE OR REPLACE FUNCTION get_raffle_status(
  p_room_id TEXT
)
RETURNS TABLE (
  is_complete BOOLEAN,
  is_drawn BOOLEAN,
  drawn_at TIMESTAMP,
  winner_name TEXT,
  winner_number INTEGER,
  prize_amount INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.is_complete,
    r.is_drawn,
    r.drawn_at,
    u.full_name as winner_name,
    w.number as winner_number,
    w.prize_amount
  FROM rooms r
  LEFT JOIN winners w ON w.room_id = r.id
  LEFT JOIN users u ON u.id = w.user_id
  WHERE r.id = p_room_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para notificar cuando una sala está por completarse
CREATE OR REPLACE FUNCTION notify_room_almost_full(
  p_room_id TEXT
)
RETURNS VOID AS $$
DECLARE
  room_record RECORD;
  occupied_count INTEGER;
  message TEXT;
BEGIN
  -- Obtener datos de la sala
  SELECT name, max_numbers, price 
  INTO room_record
  FROM rooms 
  WHERE id = p_room_id;
  
  -- Contar números ocupados
  SELECT COUNT(*) INTO occupied_count
  FROM numbers 
  WHERE room_id = p_room_id 
  AND status = 'occupied';
  
  -- Notificar si está al 90% o más
  IF occupied_count >= (room_record.max_numbers * 0.9) THEN
    message := format('
      <b>¡SALA CASI LLENA! </b> 
      <b>Sala:</b> %s
      <b>Ocupados:</b> %s/%s
      <b>Precio:</b> $%s
      <b>Progreso:</b> %.1f%%
      <b>Fecha:</b> %s
      ', 
      room_record.name,
      occupied_count,
      room_record.max_numbers,
      room_record.price,
      (occupied_count::FLOAT / room_record.max_numbers * 100),
      NOW()
    );
    
    -- Enviar notificación
    -- PERFORM telegram_send_message(message);
    
    -- Log para debugging
    RAISE LOG 'Notificación de sala casi llena: %', message;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para notificar cuando una sala está casi llena
CREATE OR REPLACE FUNCTION trigger_room_notifications()
RETURNS TRIGGER AS $$
BEGIN
  -- Notificar si la sala está casi llena
  PERFORM notify_room_almost_full(NEW.room_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear trigger para notificaciones de sala
DROP TRIGGER IF EXISTS room_notifications_trigger ON numbers;
CREATE TRIGGER room_notifications_trigger
AFTER UPDATE ON numbers
FOR EACH ROW
WHEN (NEW.status = 'occupied' AND OLD.status != 'occupied')
EXECUTE FUNCTION trigger_room_notifications();

-- ============================================
-- VERIFICACIÓN
-- ============================================

SELECT 'Sistema de sorteo automático completado' as status;
