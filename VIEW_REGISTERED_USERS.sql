-- VER TODOS LOS USUARIOS REGISTRADOS
SELECT 'VER TODOS LOS USUARIOS REGISTRADOS' as section;
SELECT 'Para administrar y ver los usuarios del sistema' as purpose;

-- 1. Ver todos los usuarios registrados
SELECT '=== TODOS LOS USUARIOS REGISTRADOS ===' as section;
SELECT 
    id,
    full_name,
    dni,
    email,
    role,
    game_balance,
    created_at,
    CASE 
        WHEN role = 'admin' THEN 'ADMINISTRADOR'
        ELSE 'USUARIO NORMAL'
    END as tipo_usuario
FROM users 
ORDER BY created_at DESC;

-- 2. Ver usuarios por rol
SELECT '=== USUARIOS POR ROL ===' as section;
SELECT 
    role,
    COUNT(*) as cantidad,
    MIN(created_at) as primer_registro,
    MAX(created_at) as ultimo_registro
FROM users 
GROUP BY role;

-- 3. Ver usuarios con números comprados
SELECT '=== USUARIOS CON NÚMEROS COMPRADOS ===' as section;
SELECT DISTINCT
    u.id,
    u.full_name,
    u.dni,
    u.email,
    COUNT(n.id) as numeros_comprados,
    SUM(CASE WHEN n.status = 'occupied' THEN 1 ELSE 0 END) as numeros_ocupados,
    SUM(CASE WHEN n.status = 'reserved' THEN 1 ELSE 0 END) as numeros_reservados
FROM users u
LEFT JOIN numbers n ON u.id = n.user_id
WHERE u.role = 'user'
GROUP BY u.id, u.full_name, u.dni, u.email
ORDER BY numeros_comprados DESC;

-- 4. Ver usuarios con pagos pendientes
SELECT '=== USUARIOS CON PAGOS PENDIENTES ===' as section;
SELECT DISTINCT
    u.id,
    u.full_name,
    u.dni,
    u.email,
    COUNT(pp.id) as pagos_pendientes,
    SUM(pp.amount) as monto_total_pendiente
FROM users u
INNER JOIN pending_payments pp ON u.id = pp.user_id
WHERE pp.status = 'pending'
GROUP BY u.id, u.full_name, u.dni, u.email
ORDER BY pagos_pendientes DESC;

-- 5. Estadísticas generales
SELECT '=== ESTADÍSTICAS GENERALES ===' as section;
SELECT 
    COUNT(*) as total_usuarios,
    COUNT(CASE WHEN role = 'admin' THEN 1 END) as administradores,
    COUNT(CASE WHEN role = 'user' THEN 1 END) as usuarios_normales,
    COUNT(CASE WHEN created_at > CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as usuarios_ultima_semana,
    COUNT(CASE WHEN created_at > CURRENT_DATE - INTERVAL '1 day' THEN 1 END) as usuarios_hoy
FROM users;

-- 6. Usuarios registrados hoy
SELECT '=== USUARIOS REGISTRADOS HOY ===' as section;
SELECT 
    full_name,
    dni,
    email,
    created_at
FROM users 
WHERE DATE(created_at) = CURRENT_DATE
ORDER BY created_at DESC;

SELECT '=== LISTA DE USUARIOS COMPLETA ===' as final_status;
SELECT 'Podés usar estas consultas para ver los usuarios registrados' as msg1;
SELECT 'También podés crear un panel en la web para verlos' as msg2;
SELECT 'Los datos están disponibles para administración' as final_msg;
