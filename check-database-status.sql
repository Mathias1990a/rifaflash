-- VERIFICAR ESTADO ACTUAL DE LA BASE DE DATOS
-- Script para diagnosticar por qué la API falla

-- 1. Verificar si las tablas existen
SELECT '=== VERIFICANDO TABLAS EXISTENTES ===' as section;

SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
AND table_name IN ('users', 'rooms', 'numbers', 'pending_payments')
ORDER BY table_name;

-- 2. Verificar estructura de la tabla rooms
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

-- 3. Verificar datos en la tabla rooms
SELECT '=== DATOS EN TABLA ROOMS ===' as section;

SELECT 
    id,
    name,
    price,
    created_at
FROM rooms;

-- 4. Verificar estructura de la tabla numbers
SELECT '=== ESTRUCTURA TABLA NUMBERS ===' as section;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'numbers'
ORDER BY ordinal_position;

-- 5. Verificar datos en la tabla numbers
SELECT '=== DATOS EN TABLA NUMBERS ===' as section;

SELECT 
    id,
    room_id,
    number,
    status,
    created_at
FROM numbers 
LIMIT 10;

-- 6. Verificar si hay rooms con ID 'standard'
SELECT '=== BUSCANDO ROOM CON ID STANDARD ===' as section;

SELECT 
    id,
    name,
    'standard' as expected_id
FROM rooms 
WHERE id::text = 'standard' OR name = 'standard';

-- 7. Verificar todos los IDs de rooms disponibles
SELECT '=== TODOS LOS IDS DE ROOMS ===' as section;

SELECT 
    id,
    name,
    id::text as room_id_text
FROM rooms;

-- 8. Verificar si hay errores de política de seguridad
SELECT '=== VERIFICANDO POLÍTICAS DE SEGURIDAD ===' as section;

SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('rooms', 'numbers')
ORDER BY tablename, policyname;

-- 9. Verificar configuración de RLS (Row Level Security)
SELECT '=== CONFIGURACIÓN RLS ===' as section;

SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN ('rooms', 'numbers', 'users', 'pending_payments')
ORDER BY tablename;

SELECT '=== VERIFICACIÓN COMPLETADA ===' as final_status;
