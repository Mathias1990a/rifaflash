-- FORZAR LIBERACIÓN DE NÚMEROS 04 Y 05
-- Script más agresivo para liberar números trabados

-- 1. Ver estado actual antes de liberar
SELECT 'Estado ANTES de liberar números 04 y 05:' as debug_step;
SELECT 
    room_id,
    number,
    status,
    user_id,
    reserved_at,
    payment_confirmed
FROM numbers 
WHERE number IN (4, 5)
ORDER BY number;

-- 2. FORZAR liberación de números 04 y 05 (sin condiciones)
SELECT 'Forzando liberación de números 04 y 05:' as debug_step;
UPDATE numbers 
SET 
    status = 'available',
    user_id = NULL,
    reserved_at = NULL,
    payment_confirmed = FALSE
WHERE number IN (4, 5);

-- 3. Verificar resultado inmediato
SELECT 'Estado DESPUÉS de liberar números 04 y 05:' as debug_step;
SELECT 
    room_id,
    number,
    status,
    user_id,
    reserved_at,
    payment_confirmed
FROM numbers 
WHERE number IN (4, 5)
ORDER BY number;

-- 4. Contar números disponibles ahora
SELECT 'Conteo de números disponibles:' as debug_step;
SELECT 
    COUNT(*) as disponibles
FROM numbers 
WHERE status = 'available'
AND number IN (4, 5);

-- 5. Verificar que no queden referencias a estos números en pagos
SELECT 'Verificando pagos asociados a números 04 y 05:' as debug_step;
SELECT 
    id,
    user_id,
    room_id,
    number,
    status,
    created_at
FROM pending_payments 
WHERE number IN (4, 5)
ORDER BY created_at DESC;

SELECT 'Números 04 y 05 liberados exitosamente' as final_status;
