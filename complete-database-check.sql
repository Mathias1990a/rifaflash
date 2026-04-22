-- VERIFICACIÓN COMPLETA DE LA ESTRUCTURA DE LA BASE DE DATOS
-- Script definitivo para verificar y crear todo lo necesario

-- 1. Verificar todas las tablas existentes
SELECT '=== TABLAS EXISTENTES ===' as section;
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2. Verificar estructura de tabla rooms
SELECT '=== ESTRUCTURA TABLA ROOMS ===' as section;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'rooms'
ORDER BY ordinal_position;

-- 3. Verificar estructura de tabla pending_payments
SELECT '=== ESTRUCTURA TABLA PENDING_PAYMENTS ===' as section;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'pending_payments'
ORDER BY ordinal_position;

-- 4. Verificar estructura de tabla users
SELECT '=== ESTRUCTURA TABLA USERS ===' as section;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'users'
ORDER BY ordinal_position;

-- 5. Verificar datos existentes
SELECT '=== DATOS EXISTENTES ===' as section;

SELECT 'Rooms existentes:' as info;
SELECT COUNT(*) as count FROM rooms;

SELECT 'Usuarios existentes:' as info;
SELECT COUNT(*) as count FROM users;

SELECT 'Pagos pendientes existentes:' as info;
SELECT COUNT(*) as count FROM pending_payments WHERE status = 'pending';

-- 6. Mostrar datos si existen
SELECT '=== DATOS ACTUALES ===' as section;

SELECT 'Datos de rooms:' as info;
SELECT 
    id,
    name,
    COALESCE(price::text, 'NULL') as price,
    created_at
FROM rooms 
ORDER BY created_at DESC;

SELECT 'Datos de usuarios:' as info;
SELECT 
    id,
    full_name,
    dni,
    email,
    created_at
FROM users 
ORDER BY created_at DESC
LIMIT 3;

SELECT 'Pagos pendientes:' as info;
SELECT 
    id,
    user_id,
    COALESCE(room_id::text, 'NULL') as room_id,
    number,
    amount,
    status,
    created_at
FROM pending_payments 
WHERE status = 'pending'
ORDER BY created_at DESC;

SELECT '=== VERIFICACIÓN COMPLETADA ===' as final_section;
