-- INVESTIGAR INCONSISTENCIA ENTRE NÚMEROS OCUPADOS Y PAGOS PENDIENTES

-- 1. Verificar números ocupados
SELECT 'Números ocupados actualmente:' as debug_step;
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
    u.email
FROM numbers n
LEFT JOIN users u ON n.user_id = u.id
WHERE n.status IN ('reserved', 'occupied')
ORDER BY n.reserved_at DESC;

-- 2. Verificar pagos pendientes
SELECT 'Pagos pendientes actualmente:' as debug_step;
SELECT 
    pp.id,
    pp.user_id,
    pp.room_id,
    pp.number,
    pp.amount,
    pp.status,
    pp.created_at,
    u.full_name,
    u.dni,
    u.email
FROM pending_payments pp
LEFT JOIN users u ON pp.user_id = u.id
WHERE pp.status = 'pending'
ORDER BY pp.created_at DESC;

-- 3. Encontrar inconsistencias - números ocupados sin pagos
SELECT 'INCONSISTENCIAS - Números ocupados sin pagos pendientes:' as debug_step;
SELECT 
    n.id,
    n.room_id,
    n.number,
    n.status,
    n.user_id,
    n.reserved_at,
    u.full_name,
    u.dni,
    'OCUPADO SIN PAGO PENDIENTE' as issue
FROM numbers n
LEFT JOIN users u ON n.user_id = u.id
WHERE n.status IN ('reserved', 'occupied')
AND NOT EXISTS (
    SELECT 1 FROM pending_payments pp 
    WHERE pp.user_id = n.user_id 
    AND pp.room_id = n.room_id 
    AND pp.number = n.number 
    AND pp.status = 'pending'
)
ORDER BY n.reserved_at DESC;

-- 4. Contar inconsistencias
SELECT 'Resumen de inconsistencias:' as debug_step;
SELECT 
    COUNT(*) as numeros_ocupados_sin_pago
FROM numbers n
WHERE n.status IN ('reserved', 'occupied')
AND NOT EXISTS (
    SELECT 1 FROM pending_payments pp 
    WHERE pp.user_id = n.user_id 
    AND pp.room_id = n.room_id 
    AND pp.number = n.number 
    AND pp.status = 'pending'
);

-- 5. Liberar números inconsistentes automáticamente
SELECT 'Liberando números inconsistentes:' as debug_step;
UPDATE numbers 
SET 
    status = 'available',
    user_id = NULL,
    reserved_at = NULL,
    payment_confirmed = FALSE
WHERE id IN (
    SELECT n.id
    FROM numbers n
    WHERE n.status IN ('reserved', 'occupied')
    AND NOT EXISTS (
        SELECT 1 FROM pending_payments pp 
        WHERE pp.user_id = n.user_id 
        AND pp.room_id = n.room_id 
        AND pp.number = n.number 
        AND pp.status = 'pending'
    )
);

-- 6. Verificar resultado final
SELECT 'Estado final después de liberar:' as debug_step;
SELECT 
    status,
    COUNT(*) as cantidad
FROM numbers 
GROUP BY status
ORDER BY status;

SELECT '=== INVESTIGACIÓN COMPLETADA ===' as final_status;
