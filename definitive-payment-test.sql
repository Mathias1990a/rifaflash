-- SCRIPT DEFINITIVO PARA CREAR PAGO DE PRUEBA
-- Basado en la estructura real de la base de datos

-- 1. Verificar datos existentes primero
SELECT '=== VERIFICANDO DATOS EXISTENTES ===' as section;

SELECT 'Rooms existentes:' as info;
SELECT 
    id,
    name,
    COALESCE(price::text, 'NULL') as price,
    created_at
FROM rooms 
ORDER BY created_at DESC;

SELECT 'Usuarios existentes:' as info;
SELECT 
    id,
    full_name,
    dni,
    email,
    created_at
FROM users 
ORDER BY created_at DESC
LIMIT 3;

-- 2. Si no hay rooms, crear uno con estructura correcta
SELECT '=== CREANDO ROOM SI ES NECESARIO ===' as section;
INSERT INTO rooms (id, name, price, created_at)
SELECT 
    gen_random_uuid()::text::uuid,
    'Sala de Prueba',
    1000,
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM rooms LIMIT 1);

-- 3. Verificar room creado
SELECT 'Room después de inserción:' as info;
SELECT 
    id,
    name,
    price,
    created_at
FROM rooms 
ORDER BY created_at DESC
LIMIT 1;

-- 4. Crear pago de prueba con estructura correcta
SELECT '=== CREANDO PAGO DE PRUEBA ===' as section;
INSERT INTO pending_payments (
    id,
    user_id,
    room_id,
    number,
    amount,
    sender_name,
    sender_cbu,
    transfer_date,
    notes,
    status,
    created_at
) 
SELECT 
    gen_random_uuid()::text::uuid,
    u.id,
    r.id,
    77,
    r.price,
    'JUAN PEREZ PRUEBA',
    '1234567890123456789012',
    CURRENT_DATE,
    'Pago de prueba definitivo para panel admin',
    'pending',
    NOW()
FROM users u 
CROSS JOIN rooms r 
WHERE u.id IS NOT NULL 
AND r.id IS NOT NULL
LIMIT 1;

-- 5. Verificar pago creado
SELECT 'Pago creado exitosamente:' as info;
SELECT 
    pp.id,
    pp.user_id,
    pp.room_id,
    pp.number,
    pp.amount,
    pp.sender_name,
    pp.status,
    pp.created_at,
    u.full_name,
    u.dni
FROM pending_payments pp
LEFT JOIN users u ON pp.user_id = u.id
WHERE pp.status = 'pending'
ORDER BY pp.created_at DESC
LIMIT 1;

SELECT '=== SCRIPT COMPLETADO ===' as final_section;
SELECT 'PAGO DE PRUEBA CREADO. REFRESCÁ EL PANEL DE ADMIN.' as message;
