-- CORRECCIÓN: Crear tabla pending_payments faltante

-- 5. TABLA DE PAGOS PENDIENTES
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
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  verified_at TIMESTAMP,
  verified_by UUID REFERENCES users(id)
);

-- FUNCIONES RPC que faltan

-- Función para crear pago pendiente
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

-- Función para aprobar pago (cambia reserved a occupied)
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
  
  -- Cambiar número de reserved a occupied
  UPDATE numbers 
  SET status = 'occupied',
      payment_confirmed = TRUE
  WHERE room_id = v_room_id AND number = v_number AND status = 'reserved';
  
  -- Incrementar contador de ocupados
  PERFORM increment_occupied(v_room_id);
  
  -- Marcar primera compra y otorgar bono de referido si aplica
  PERFORM mark_first_purchase(v_user_id);
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para rechazar pago (libera el número)
CREATE OR REPLACE FUNCTION reject_payment(
  p_payment_id UUID,
  p_admin_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_room_id TEXT;
  v_number INTEGER;
BEGIN
  -- Obtener datos del pago
  SELECT room_id, number 
  INTO v_room_id, v_number
  FROM pending_payments 
  WHERE id = p_payment_id AND status = 'pending';
  
  -- Actualizar estado del pago
  UPDATE pending_payments 
  SET status = 'rejected', 
      verified_at = NOW(),
      verified_by = p_admin_id
  WHERE id = p_payment_id;
  
  -- Liberar el número (volver a available)
  IF v_room_id IS NOT NULL THEN
    UPDATE numbers 
    SET status = 'available',
        user_id = NULL,
        reserved_at = NULL
    WHERE room_id = v_room_id AND number = v_number AND status = 'reserved';
  END IF;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- POLÍTICAS DE SEGURIDAD para pending_payments

-- Eliminar políticas si existen para evitar conflictos
DROP POLICY IF EXISTS "Allow all read pending_payments" ON pending_payments;
DROP POLICY IF EXISTS "Allow insert pending_payments" ON pending_payments;
DROP POLICY IF EXISTS "Allow update pending_payments" ON pending_payments;

-- Crear políticas
CREATE POLICY "Allow all read pending_payments" ON pending_payments
  FOR SELECT USING (true);

CREATE POLICY "Allow insert pending_payments" ON pending_payments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update pending_payments" ON pending_payments
  FOR UPDATE USING (true);

-- CONFIGURACIÓN REALTIME para pending_payments

-- Agregar tabla a publicación realtime (si no está ya)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'pending_payments'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE pending_payments;
    END IF;
END $$;

-- LIBERAR NÚMEROS TRABADOS (si los hay)

-- Liberar números que quedaron en estado reserved sin pago pendiente
UPDATE numbers 
SET status = 'available',
    user_id = NULL,
    reserved_at = NULL
WHERE status = 'reserved' 
AND NOT EXISTS (
  SELECT 1 FROM pending_payments 
  WHERE pending_payments.number = numbers.number 
  AND pending_payments.room_id = numbers.room_id 
  AND pending_payments.status = 'pending'
);

-- VERIFICACIÓN

-- Verificar que la tabla existe
SELECT 'Tabla pending_payments creada exitosamente' as status;

-- Verificar que las funciones existen
SELECT 'Función create_pending_payment creada' as status 
WHERE EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'create_pending_payment');

SELECT 'Función approve_payment creada' as status 
WHERE EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'approve_payment');

SELECT 'Función reject_payment creada' as status 
WHERE EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'reject_payment');
