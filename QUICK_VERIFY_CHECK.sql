-- VERIFICACIÓN RÁPIDA - ¿EXISTE LA FUNCIÓN verify_user?
-- Para diagnosticar el error 404

-- 1. Verificar si existe la función verify_user
SELECT '=== VERIFICANDO FUNCIÓN verify_user ===' as section;
SELECT 
    proname,
    prokind,
    prorettype::regtype as return_type
FROM pg_proc 
WHERE proname = 'verify_user';

-- 2. Verificar todas las funciones de usuarios
SELECT '=== TODAS LAS FUNCIONES DE USUARIOS ===' as section;
SELECT 
    proname,
    prokind,
    prorettype::regtype as return_type
FROM pg_proc 
WHERE proname LIKE '%user%'
ORDER BY proname;

-- 3. Si no existe verify_user, crearla de inmediato
DROP FUNCTION IF EXISTS verify_user(TEXT, TEXT);

-- Crear función verify_user
CREATE FUNCTION verify_user(
    p_email TEXT,
    p_password TEXT
)
RETURNS TABLE (
    id UUID,
    full_name TEXT,
    dni TEXT,
    email TEXT,
    role TEXT,
    game_balance DECIMAL(10,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.full_name,
        u.dni,
        u.email,
        u.role,
        u.game_balance
    FROM users u
    WHERE u.email = p_email 
    AND u.password_hash = p_password;
    
    RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Verificar que ahora exista
SELECT '=== VERIFICACIÓN FINAL ===' as section;
SELECT 
    proname,
    prokind
FROM pg_proc 
WHERE proname = 'verify_user';

-- 5. Probar la función con el usuario admin
SELECT '=== PROBANDO verify_user CON ADMIN ===' as section;
SELECT * FROM verify_user(
    'admin@rifaflash.com',
    'admin123'
);

SELECT '=== VERIFICACIÓN COMPLETA ===' as final_status;
SELECT 'Si ves resultados aquí, verify_user funciona' as msg1;
SELECT 'El error 404 debería estar solucionado' as msg2;
SELECT 'Probá hacer login en la web ahora' as final_msg;
