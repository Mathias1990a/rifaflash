-- ============================================
-- BORRAR FUNCIONES DUPLICADAS Y RECREAR UNA SOLA
-- ============================================

-- Borrar todas las versiones de create_pending_payment
DROP FUNCTION IF EXISTS create_pending_payment(UUID, TEXT, INTEGER, INTEGER, TEXT, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS create_pending_payment(UUID, UUID, INTEGER, NUMERIC, TEXT, TEXT, DATE, TEXT);
DROP FUNCTION IF EXISTS create_pending_payment(UUID, UUID, INTEGER, NUMERIC, TEXT, TEXT, TIMESTAMP WITH TIME ZONE, TEXT);

-- Recrear la función correcta
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
    sender_name, sender_cbu, transfer_date, notes, status, created_at
  )
  VALUES (
    p_user_id, p_room_id, p_number, p_amount,
    p_sender_name, p_sender_cbu, p_transfer_date, p_notes, 'pending', NOW()
  )
  RETURNING id INTO new_payment_id;
  
  RETURN new_payment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verificar que se creó correctamente
SELECT '✅ Función create_pending_payment recreada correctamente' as status;
