-- SCRIPT DE DEPURACIÓN PARA PAGOS PENDIENTES

-- 1. Verificar si la tabla pending_payments existe
SELECT 'Verificando tabla pending_payments' as debug_step;
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'pending_payments'
) as table_exists;

-- 2. Mostrar estructura de la tabla si existe
SELECT 'Estructura de la tabla pending_payments:' as debug_step;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'pending_payments'
ORDER BY ordinal_position;

-- 3. Contar todos los registros en pending_payments
SELECT 'Contando todos los registros en pending_payments' as debug_step;
SELECT 
    COUNT(*) as total_registros,
    COUNT(*) FILTER (WHERE status = 'pending') as pendientes,
    COUNT(*) FILTER (WHERE status = 'approved') as aprobados,
    COUNT(*) FILTER (WHERE status = 'rejected') as rechazados
FROM pending_payments;

-- 4. Mostrar todos los pagos pendientes con detalles
SELECT 'Mostrando todos los pagos pendientes' as debug_step;
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
ORDER BY pp.created_at DESC;

-- 5. Verificar si hay números reservados sin pagos
SELECT 'Verificando números reservados sin pagos' as debug_step;
SELECT 
    n.id,
    n.room_id,
    n.number,
    n.status,
    n.user_id,
    n.reserved_at,
    u.full_name,
    u.dni,
    CASE 
        WHEN pp.id IS NULL THEN 'SIN PAGO PENDIENTE'
        ELSE 'CON PAGO PENDIENTE'
    END as payment_status
FROM numbers n
LEFT JOIN users u ON n.user_id = u.id
LEFT JOIN pending_payments pp ON n.user_id = pp.user_id 
    AND n.room_id = pp.room_id 
    AND n.number = pp.number
    AND pp.status = 'pending'
WHERE n.status = 'reserved'
ORDER BY n.reserved_at DESC;

-- 6. Verificar si las funciones RPC existen
SELECT 'Verificando funciones RPC' as debug_step;
SELECT 
    proname as function_name,
    prosrc as source_code
FROM pg_proc 
WHERE proname IN ('create_pending_payment', 'approve_payment', 'reject_payment')
ORDER BY proname;

-- 7. Verificar políticas de seguridad
SELECT 'Verificando políticas de seguridad' as debug_step;
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

-- 8. Verificar configuración de realtime
SELECT 'Verificando configuración realtime' as debug_step;
SELECT 
    pubname,
    schemaname,
    tablename
FROM pg_publication_tables 
WHERE tablename = 'pending_payments';

SELECT 'Depuración completada' as debug_step;
