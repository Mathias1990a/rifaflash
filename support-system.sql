-- ============================================
-- SISTEMA DE SOPORTE Y MENSAJES DE CLIENTES
-- ============================================

-- 1. TABLA DE MENSAJES DE SOPORTE
CREATE TABLE IF NOT EXISTS support_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'inquiry', -- inquiry, number_change, other
  status TEXT DEFAULT 'pending', -- pending, answered, resolved
  admin_response TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  answered_at TIMESTAMP,
  answered_by UUID REFERENCES users(id)
);

-- 2. TABLA DE CAMBIOS DE NÚMERO
CREATE TABLE IF NOT EXISTS number_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  room_id TEXT REFERENCES rooms(id),
  old_number INTEGER NOT NULL,
  new_number INTEGER NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'pending', -- pending, approved, rejected
  admin_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP,
  processed_by UUID REFERENCES users(id)
);

-- 3. FUNCIÓN PARA ENVIAR MENSAJE DE SOPORTE
CREATE OR REPLACE FUNCTION create_support_message(
  p_user_id UUID,
  p_subject TEXT,
  p_message TEXT,
  p_type TEXT DEFAULT 'inquiry'
)
RETURNS UUID AS $$
DECLARE
  new_message_id UUID;
BEGIN
  INSERT INTO support_messages (
    user_id, subject, message, type
  )
  VALUES (
    p_user_id, p_subject, p_message, p_type
  )
  RETURNING id INTO new_message_id;
  
  -- Notificar al admin por Telegram
  -- PERFORM notify_support_message(new_message_id);
  
  RETURN new_message_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. FUNCIÓN PARA SOLICITAR CAMBIO DE NÚMERO
CREATE OR REPLACE FUNCTION request_number_change(
  p_user_id UUID,
  p_room_id TEXT,
  p_old_number INTEGER,
  p_new_number INTEGER,
  p_reason TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  change_request_id UUID;
  old_status TEXT;
  new_status TEXT;
BEGIN
  -- Verificar que el número viejo pertenezca al usuario
  SELECT status INTO old_status
  FROM numbers 
  WHERE room_id = p_room_id 
  AND number = p_old_number 
  AND user_id = p_user_id;
  
  IF old_status IS NULL THEN
    RAISE EXCEPTION 'El número % no pertenece al usuario en la sala %', p_old_number, p_room_id;
  END IF;
  
  -- Verificar que el nuevo número esté disponible
  SELECT status INTO new_status
  FROM numbers 
  WHERE room_id = p_room_id 
  AND number = p_new_number;
  
  IF new_status = 'occupied' OR new_status = 'reserved' THEN
    RAISE EXCEPTION 'El número % no está disponible', p_new_number;
  END IF;
  
  -- Crear solicitud de cambio
  INSERT INTO number_changes (
    user_id, room_id, old_number, new_number, reason
  )
  VALUES (
    p_user_id, p_room_id, p_old_number, p_new_number, p_reason
  )
  RETURNING id INTO change_request_id;
  
  -- Notificar al admin por Telegram
  -- PERFORM notify_number_change_request(change_request_id);
  
  RETURN change_request_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. FUNCIÓN PARA APROBAR CAMBIO DE NÚMERO
CREATE OR REPLACE FUNCTION approve_number_change(
  p_change_id UUID,
  p_admin_id UUID,
  p_admin_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  change_record RECORD;
BEGIN
  -- Obtener datos del cambio
  SELECT * INTO change_record
  FROM number_changes 
  WHERE id = p_change_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Realizar el cambio
  UPDATE numbers 
  SET status = 'available',
      user_id = NULL,
      reserved_at = NULL
  WHERE room_id = change_record.room_id 
  AND number = change_record.old_number;
  
  UPDATE numbers 
  SET status = 'occupied',
      user_id = change_record.user_id,
      payment_confirmed = TRUE
  WHERE room_id = change_record.room_id 
  AND number = change_record.new_number;
  
  -- Actualizar estado de la solicitud
  UPDATE number_changes 
  SET status = 'approved',
      admin_notes = p_admin_notes,
      processed_at = NOW(),
      processed_by = p_admin_id
  WHERE id = p_change_id;
  
  -- Notificar al usuario
  -- PERFORM notify_number_change_approved(p_change_id);
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. FUNCIÓN PARA RECHAZAR CAMBIO DE NÚMERO
CREATE OR REPLACE FUNCTION reject_number_change(
  p_change_id UUID,
  p_admin_id UUID,
  p_admin_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  change_record RECORD;
BEGIN
  -- Obtener datos del cambio
  SELECT * INTO change_record
  FROM number_changes 
  WHERE id = p_change_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Actualizar estado de la solicitud
  UPDATE number_changes 
  SET status = 'rejected',
      admin_notes = p_admin_notes,
      processed_at = NOW(),
      processed_by = p_admin_id
  WHERE id = p_change_id;
  
  -- Notificar al usuario
  -- PERFORM notify_number_change_rejected(p_change_id);
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. FUNCIÓN PARA RESPONDER MENSAJE DE SOPORTE
CREATE OR REPLACE FUNCTION respond_support_message(
  p_message_id UUID,
  p_admin_response TEXT,
  p_admin_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  message_record RECORD;
BEGIN
  -- Obtener datos del mensaje
  SELECT * INTO message_record
  FROM support_messages 
  WHERE id = p_message_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Actualizar mensaje
  UPDATE support_messages 
  SET status = 'answered',
      admin_response = p_admin_response,
      answered_at = NOW(),
      answered_by = p_admin_id
  WHERE id = p_message_id;
  
  -- Notificar al usuario
  -- PERFORM notify_support_response(p_message_id);
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. POLÍTICAS DE SEGURIDAD
DROP POLICY IF EXISTS "Allow all read support_messages" ON support_messages;
DROP POLICY IF EXISTS "Allow insert support_messages" ON support_messages;
DROP POLICY IF EXISTS "Allow update support_messages" ON support_messages;

CREATE POLICY "Allow all read support_messages" ON support_messages
  FOR SELECT USING (true);

CREATE POLICY "Allow insert support_messages" ON support_messages
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update support_messages" ON support_messages
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow all read number_changes" ON number_changes;
DROP POLICY IF EXISTS "Allow insert number_changes" ON number_changes;
DROP POLICY IF EXISTS "Allow update number_changes" ON number_changes;

CREATE POLICY "Allow all read number_changes" ON number_changes
  FOR SELECT USING (true);

CREATE POLICY "Allow insert number_changes" ON number_changes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update number_changes" ON number_changes
  FOR UPDATE USING (true);

-- 9. CONFIGURACIÓN REALTIME
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'support_messages'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE support_messages;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'number_changes'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE number_changes;
    END IF;
END $$;

-- 10. VERIFICACIÓN
SELECT 'Sistema de soporte completado' as status;
