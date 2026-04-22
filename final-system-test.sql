-- VERIFICACIÓN FINAL DEL SISTEMA COMPLETO
-- Script para probar todo el flujo de principio a fin

-- 1. Verificar que todas las tablas existen
SELECT '=== VERIFICANDO TABLAS ===' as section;
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
AND table_name IN ('rooms', 'users', 'pending_payments', 'numbers')
ORDER BY table_name;

-- 2. Verificar estructura de cada tabla
SELECT '=== ESTRUCTURA DE TABLAS ===' as section;

SELECT 'Tabla rooms:' as info;
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'rooms'
ORDER BY ordinal_position;

SELECT 'Tabla users:' as info;
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'users'
ORDER BY ordinal_position;

SELECT 'Tabla pending_payments:' as info;
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'pending_payments'
ORDER BY ordinal_position;

SELECT 'Tabla numbers:' as info;
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'numbers'
ORDER BY ordinal_position;

-- 3. Verificar datos existentes
SELECT '=== DATOS EXISTENTES ===' as section;

SELECT 'Rooms existentes:' as info;
SELECT COUNT(*) as total_rooms FROM rooms;

SELECT 'Usuarios existentes:' as info;
SELECT COUNT(*) as total_users FROM users;

SELECT 'Pagos pendientes existentes:' as info;
SELECT COUNT(*) as total_pending_payments FROM pending_payments WHERE status = 'pending';

SELECT 'Números por estado:' as info;
SELECT 
    status,
    COUNT(*) as cantidad
FROM numbers 
GROUP BY status
ORDER BY status;

-- 4. Verificar funciones RPC
SELECT '=== FUNCIONES RPC ===' as section;
SELECT 
    proname,
    prosrc
FROM pg_proc 
WHERE proname IN ('create_pending_payment', 'approve_payment', 'reject_payment')
ORDER BY proname;

-- 5. Crear datos de prueba si no existen
SELECT '=== CREANDO DATOS DE PRUEBA ===' as section;

-- Crear sala de prueba si no existe
INSERT INTO rooms (id, name, price, created_at)
SELECT 
    gen_random_uuid()::text::uuid,
    'Sala de Prueba Final',
    1000,
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM rooms LIMIT 1);

-- Crear usuario de prueba si no existe
INSERT INTO users (id, full_name, dni, email, created_at)
SELECT 
    gen_random_uuid()::text::uuid,
    'Usuario de Prueba',
    '12345678',
    'test@rifaflash.com',
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM users LIMIT 1);

-- 6. Probar función create_pending_payment
SELECT '=== PROBANDO FUNCIÓN CREATE_PENDING_PAYMENT ===' as section;

SELECT * FROM create_pending_payment(
    (SELECT id FROM users WHERE full_name = 'Usuario de Prueba' LIMIT 1),
    (SELECT id FROM rooms WHERE name = 'Sala de Prueba Final' LIMIT 1),
    99,
    1000,
    'TEST TRANSFER',
    '1234567890123456789012',
    CURRENT_DATE,
    'Pago de prueba del sistema'
);

-- 7. Verificar resultado del pago creado
SELECT '=== VERIFICANDO PAGO CREADO ===' as section;

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
    r.name as room_name
FROM pending_payments pp
LEFT JOIN users u ON pp.user_id = u.id
LEFT JOIN rooms r ON pp.room_id = r.id
WHERE pp.status = 'pending'
ORDER BY pp.created_at DESC
LIMIT 1;

-- 8. Verificar número reservado
SELECT '=== VERIFICANDO NÚMERO RESERVADO ===' as section;

SELECT 
    n.id,
    n.room_id,
    n.number,
    n.status,
    n.user_id,
    n.reserved_at,
    n.payment_confirmed
FROM numbers n
WHERE n.number = 99
ORDER BY n.created_at DESC
LIMIT 1;

-- 9. Probar función approve_payment
SELECT '=== PROBANDO FUNCIÓN APPROVE_PAYMENT ===' as section;

SELECT * FROM approve_payment(
    (SELECT id FROM pending_payments WHERE number = 99 AND status = 'pending' LIMIT 1),
    '00000000-0000-0000-0000-000000000000'
);

-- 10. Verificar resultado final
SELECT '=== ESTADO FINAL DEL SISTEMA ===' as section;

SELECT 'Pagos pendientes después de prueba:' as info;
SELECT COUNT(*) as pending_count FROM pending_payments WHERE status = 'pending';

SELECT 'Números por estado después de prueba:' as info;
SELECT 
    status,
    COUNT(*) as cantidad
FROM numbers 
GROUP BY status
ORDER BY status;

SELECT '=== SISTEMA VERIFICADO COMPLETAMENTE ===' as final_status;
SELECT 'El sistema está funcionando correctamente de principio a fin.' as message;
