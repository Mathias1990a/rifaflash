-- ============================================
-- LIBERAR NÚMEROS TRABADOS SIN PAGOS PENDIENTES
-- ============================================

-- 1. Mostrar números que están ocupados/reservados pero sin pagos pendientes
SELECT 'Números ocupados/reservados sin pagos pendientes:' as debug_step;
SELECT 
    n.room_id,
    n.number,
    n.status,
    n.user_id,
    n.reserved_at,
    u.full_name,
    u.dni,
    CASE 
        WHEN pp.id IS NULL THEN 'SIN PAGO PENDIENTE - TRABADO'
        ELSE 'CON PAGO PENDIENTE - OK'
    END as payment_status
FROM numbers n
LEFT JOIN users u ON n.user_id = u.id
LEFT JOIN pending_payments pp ON n.user_id = pp.user_id 
    AND n.room_id = pp.room_id 
    AND n.number = pp.number
    AND pp.status = 'pending'
WHERE n.status IN ('occupied', 'reserved')
AND pp.id IS NULL
ORDER BY n.room_id, n.number;

-- 2. Liberar números 04 y 05 específicamente si están trabados sin pagos
SELECT 'Liberando números 04 y 05 si están trabados sin pagos:' as debug_step;
UPDATE numbers 
SET 
    status = 'available',
    user_id = NULL,
    reserved_at = NULL,
    payment_confirmed = FALSE
WHERE 
    number IN (4, 5)
    AND status IN ('occupied', 'reserved')
    AND NOT EXISTS (
        SELECT 1 FROM pending_payments pp 
        WHERE pp.user_id = numbers.user_id 
        AND pp.room_id = numbers.room_id 
        AND pp.number = numbers.number 
        AND pp.status = 'pending'
    );

-- 3. Verificar resultado de la liberación
SELECT 'Resultado después de liberar números 04 y 05:' as debug_step;
SELECT 
    room_id,
    number,
    status,
    user_id,
    reserved_at
FROM numbers 
WHERE number IN (4, 5)
ORDER BY number;

-- 4. Liberar todos los números trabados sin pagos (opcional)
SELECT 'Liberando todos los números trabados sin pagos pendientes:' as debug_step;
UPDATE numbers 
SET 
    status = 'available',
    user_id = NULL,
    reserved_at = NULL,
    payment_confirmed = FALSE
WHERE 
    status IN ('occupied', 'reserved')
    AND NOT EXISTS (
        SELECT 1 FROM pending_payments pp 
        WHERE pp.user_id = numbers.user_id 
        AND pp.room_id = numbers.room_id 
        AND pp.number = numbers.number 
        AND pp.status = 'pending'
    );

-- 5. Verificación final
SELECT 'Verificación final - números liberados:' as debug_step;
SELECT 
    COUNT(*) as total_liberados
FROM numbers 
WHERE 
    status = 'available'
    AND (
        (number IN (4, 5)) OR
        (status IN ('occupied', 'reserved') AND 
         NOT EXISTS (
             SELECT 1 FROM pending_payments pp 
             WHERE pp.user_id = numbers.user_id 
             AND pp.room_id = numbers.room_id 
             AND pp.number = numbers.number 
             AND pp.status = 'pending'
         ))
    );

SELECT 'Números liberados exitosamente' as debug_step;
