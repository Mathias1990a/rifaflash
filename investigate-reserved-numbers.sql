-- INVESTIGAR POR QUÉ LOS NÚMEROS 04 Y 05 FIGURAN RESERVADOS SIN PAGOS

-- 1. Ver detalles completos de números 04 y 05
SELECT 'Detalles completos de números 04 y 05:' as debug_step;
SELECT 
    n.id,
    n.room_id,
    n.number,
    n.status,
    n.user_id,
    n.reserved_at,
    n.payment_confirmed,
    u.full_name,
    u.dni,
    u.email,
    CASE 
        WHEN pp.id IS NOT NULL THEN 'TIENE PAGO PENDIENTE'
        ELSE 'SIN PAGO PENDIENTE'
    END as payment_status,
    pp.status as payment_status_detail,
    pp.created_at as payment_created_at
FROM numbers n
LEFT JOIN users u ON n.user_id = u.id
LEFT JOIN pending_payments pp ON n.user_id = pp.user_id 
    AND n.room_id = pp.room_id 
    AND n.number = pp.number
WHERE n.number IN (4, 5)
ORDER BY n.number;

-- 2. Ver todos los pagos pendientes existentes
SELECT 'Todos los pagos pendientes existentes:' as debug_step;
SELECT 
    pp.id,
    pp.user_id,
    pp.room_id,
    pp.number,
    pp.amount,
    pp.status,
    pp.created_at,
    u.full_name,
    u.dni
FROM pending_payments pp
LEFT JOIN users u ON pp.user_id = u.id
WHERE pp.status = 'pending'
ORDER BY pp.created_at DESC;

-- 3. Ver si hay números reservados sin pagos
SELECT 'Números reservados sin pagos pendientes:' as debug_step;
SELECT 
    n.id,
    n.room_id,
    n.number,
    n.status,
    n.user_id,
    n.reserved_at,
    u.full_name,
    u.dni,
    n.reserved_at as reservation_time
FROM numbers n
LEFT JOIN users u ON n.user_id = u.id
WHERE n.status = 'reserved'
AND NOT EXISTS (
    SELECT 1 FROM pending_payments pp 
    WHERE pp.user_id = n.user_id 
    AND pp.room_id = n.room_id 
    AND pp.number = n.number 
    AND pp.status = 'pending'
)
ORDER BY n.reserved_at DESC;

-- 4. Verificar si hay inconsistencias en la base de datos
SELECT 'Verificando inconsistencias:' as debug_step;
SELECT 
    'Números con user_id pero sin usuario asociado' as issue_type,
    COUNT(*) as count
FROM numbers n
LEFT JOIN users u ON n.user_id = u.id
WHERE n.user_id IS NOT NULL 
AND u.id IS NULL

UNION ALL

SELECT 
    'Números reservados sin fecha de reserva' as issue_type,
    COUNT(*) as count
FROM numbers 
WHERE status = 'reserved' 
AND reserved_at IS NULL;
