-- VERIFICAR ESTADO ACTUAL DE LOS NÚMEROS
SELECT 'Estado actual de números 04 y 05:' as debug_step;
SELECT 
    room_id,
    number,
    status,
    user_id,
    reserved_at,
    payment_confirmed
FROM numbers 
WHERE number IN (4, 5)
ORDER BY room_id, number;

-- VERIFICAR SI HAY ERRORES EN LA CONSULTA DE NÚMEROS
SELECT 'Verificando estructura de tabla numbers:' as debug_step;
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'numbers'
ORDER BY ordinal_position;

-- CONTAR NÚMEROS POR ESTADO
SELECT 'Conteo de números por estado:' as debug_step;
SELECT 
    status,
    COUNT(*) as cantidad
FROM numbers 
GROUP BY status
ORDER BY status;
