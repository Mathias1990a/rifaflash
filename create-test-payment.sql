-- CREAR PAGO DE PRUEBA MANUAL PARA VERIFICAR PANEL DE ADMIN

-- 1. Verificar si la tabla rooms existe y tiene datos
SELECT 'Verificando tabla rooms:' as debug_step;
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'rooms'
) as table_exists;

-- 2. Si no hay rooms, crear uno de prueba
SELECT 'Creando room de prueba si no existe:' as debug_step;
INSERT INTO rooms (id, name, price, total_numbers, created_at)
SELECT 
    gen_random_uuid()::text::uuid,
    'Sala de Prueba',
    1000,
    100,
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM rooms LIMIT 1);

-- 3. Verificar rooms disponibles después de posible creación
SELECT 'Rooms disponibles después de verificación:' as debug_step;
SELECT 
    id,
    name,
    price,
    total_numbers,
    created_at
FROM rooms 
ORDER BY created_at DESC;

-- 4. Verificar usuarios disponibles
SELECT 'Usuarios disponibles:' as debug_step;
SELECT 
    id,
    full_name,
    dni,
    email
FROM users 
ORDER BY created_at DESC
LIMIT 5;

-- 5. Crear pago de prueba con room existente
SELECT 'Creando pago de prueba manual:' as debug_step;
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
    'JUAN PEREZ',
    '1234567890123456789012',
    CURRENT_DATE,
    'Pago de prueba para verificar panel admin',
    'pending',
    NOW()
FROM users u 
CROSS JOIN rooms r 
WHERE u.id IS NOT NULL 
AND r.id IS NOT NULL
LIMIT 1;

-- 3. Verificar que el pago se creó
SELECT 'Pago creado exitosamente:' as debug_step;
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

SELECT 'Pago de prueba creado. Refrescá el panel de admin.' as final_status;
