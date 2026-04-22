-- VERIFICAR POR QUÉ NO APARECEN PAGOS PENDIENTES EN PANEL DE ADMIN

-- 1. Verificar si la tabla pending_payments existe y tiene datos
SELECT 'Verificando tabla pending_payments:' as debug_step;
SELECT 
    COUNT(*) as total_registros,
    COUNT(*) FILTER (WHERE status = 'pending') as pendientes,
    COUNT(*) FILTER (WHERE status = 'approved') as aprobados,
    COUNT(*) FILTER (WHERE status = 'rejected') as rechazados
FROM pending_payments;

-- 2. Mostrar todos los pagos pendientes existentes
SELECT 'Todos los pagos pendientes existentes:' as debug_step;
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
    u.dni,
    u.email
FROM pending_payments pp
LEFT JOIN users u ON pp.user_id = u.id
WHERE pp.status = 'pending'
ORDER BY pp.created_at DESC;

-- 3. Verificar si las funciones RPC existen
SELECT 'Verificando funciones RPC:' as debug_step;
SELECT 
    proname as function_name,
    prosrc as source_code
FROM pg_proc 
WHERE proname IN ('create_pending_payment', 'approve_payment', 'reject_payment')
ORDER BY proname;

-- 4. Verificar políticas de seguridad en pending_payments
SELECT 'Verificando políticas de seguridad:' as debug_step;
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'pending_payments'
ORDER BY policyname;

-- 5. Verificar configuración de realtime
SELECT 'Verificando configuración realtime:' as debug_step;
SELECT 
    pubname,
    schemaname,
    tablename
FROM pg_publication_tables 
WHERE tablename = 'pending_payments';

-- 6. Crear un pago de prueba si no hay ninguno
SELECT 'Creando pago de prueba si no hay pendientes:' as debug_step;
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
    'sala-1',
    99,
    1000,
    'TEST ADMIN',
    '1234567890123456789012',
    CURRENT_DATE,
    'Pago de prueba para panel admin',
    'pending',
    NOW()
FROM users u 
WHERE u.email LIKE '%test%'
AND NOT EXISTS (
    SELECT 1 FROM pending_payments WHERE status = 'pending'
)
LIMIT 1;

-- 7. Verificar resultado final
SELECT 'Estado final después de posible inserción:' as debug_step;
SELECT 
    COUNT(*) as total_pendientes
FROM pending_payments 
WHERE status = 'pending';

SELECT 'Verificación completada' as final_status;
