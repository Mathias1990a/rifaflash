-- ARREGLAR FUNCIONES CON ERROR
-- Ejecutar esto en Supabase SQL Editor

-- ============================================
-- BORRAR FUNCIONES CON PROBLEMAS
-- ============================================
DROP FUNCTION IF EXISTS approve_payment(UUID, UUID);
DROP FUNCTION IF EXISTS reject_payment(UUID, UUID);
DROP FUNCTION IF EXISTS increment_occupied(TEXT);

-- ============================================
-- RECREAR FUNCIONES SIMPLIFICADAS
-- ============================================

-- Función para aprobar pago (versión simple)
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
  
  -- Si no se actualizó nada, el pago no existía o no estaba pendiente
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
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para rechazar pago (versión simple)
CREATE OR REPLACE FUNCTION reject_payment(
  p_payment_id UUID,
  p_admin_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Actualizar estado del pago
  UPDATE pending_payments 
  SET status = 'rejected', 
      verified_at = NOW(),
      verified_by = p_admin_id
  WHERE id = p_payment_id AND status = 'pending';
  
  -- Si no se actualizó nada, el pago no existía o no estaba pendiente
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Liberar el número (volver a available)
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

-- ============================================
-- VERIFICAR QUE TODO EXISTE
-- ============================================

-- Verificar tablas
SELECT 'Tabla users' as check_item, COUNT(*) as count FROM information_schema.tables WHERE table_name = 'users'
UNION ALL
SELECT 'Tabla rooms', COUNT(*) FROM information_schema.tables WHERE table_name = 'rooms'
UNION ALL
SELECT 'Tabla numbers', COUNT(*) FROM information_schema.tables WHERE table_name = 'numbers'
UNION ALL
SELECT 'Tabla pending_payments', COUNT(*) FROM information_schema.tables WHERE table_name = 'pending_payments'
UNION ALL
SELECT 'Tabla winners', COUNT(*) FROM information_schema.tables WHERE table_name = 'winners'
UNION ALL
SELECT 'Tabla admins', COUNT(*) FROM information_schema.tables WHERE table_name = 'admins';

-- Verificar funciones
SELECT 'Función verify_user' as check_item, COUNT(*) as count FROM pg_proc WHERE proname = 'verify_user'
UNION ALL
SELECT 'Función create_user_with_password', COUNT(*) FROM pg_proc WHERE proname = 'create_user_with_password'
UNION ALL
SELECT 'Función verify_admin', COUNT(*) FROM pg_proc WHERE proname = 'verify_admin'
UNION ALL
SELECT 'Función create_pending_payment', COUNT(*) FROM pg_proc WHERE proname = 'create_pending_payment'
UNION ALL
SELECT 'Función approve_payment', COUNT(*) FROM pg_proc WHERE proname = 'approve_payment'
UNION ALL
SELECT 'Función reject_payment', COUNT(*) FROM pg_proc WHERE proname = 'reject_payment';

-- Verificar salas
SELECT id, name, max_players, price FROM rooms;

-- Verificar números por sala
SELECT room_id, COUNT(*) as total_numeros, 
       COUNT(CASE WHEN status = 'available' THEN 1 END) as disponibles
FROM numbers 
GROUP BY room_id;
