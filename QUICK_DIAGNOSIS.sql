-- DIAGNÓSTICO RÁPIDO - VERIFICAR ESTADO ACTUAL
-- Para identificar por qué al usuario le da error

-- 1. Verificar si las tablas existen
SELECT '=== VERIFICANDO TABLAS ===' as section;
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'rooms', 'numbers', 'pending_payments');

-- 2. Verificar si hay salas creadas
SELECT '=== VERIFICANDO SALAS ===' as section;
SELECT COUNT(*) as salas_creadas FROM rooms;

-- 3. Verificar si hay admin creado
SELECT '=== VERIFICANDO ADMIN ===' as section;
SELECT 
    full_name,
    email,
    role
FROM users 
WHERE role = 'admin';

-- 4. Verificar si hay números creados
SELECT '=== VERIFICANDO NÚMEROS ===' as section;
SELECT 
    r.name as sala,
    COUNT(n.id) as numeros_creados
FROM rooms r
LEFT JOIN numbers n ON r.id = n.room_id
GROUP BY r.name, r.id
ORDER BY r.name;

-- 5. Verificar funciones RPC
SELECT '=== VERIFICANDO FUNCIONES RPC ===' as section;
SELECT 
    proname,
    prokind
FROM pg_proc 
WHERE proname IN ('create_user_with_password', 'create_pending_payment', 'approve_payment', 'reject_payment');

-- 6. Verificar políticas RLS
SELECT '=== VERIFICANDO POLÍTICAS RLS ===' as section;
SELECT 
    tablename,
    policyname,
    permissive
FROM pg_policies 
WHERE tablename IN ('users', 'rooms', 'numbers', 'pending_payments');

-- 7. Verificar conexión con la aplicación
SELECT '=== ESTADO DE CONEXIÓN ===' as section;
SELECT 'Si ves estos resultados, la conexión con Supabase funciona' as conexion;

SELECT '=== DIAGNÓSTICO COMPLETO ===' as final_status;
SELECT 'Copiá estos resultados y mandamelos si hay algún error' as instruccion;
