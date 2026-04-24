-- DEBUG DE LOGIN - VERIFICAR TABLA USERS
SELECT 'DEBUG DE LOGIN - VERIFICANDO TABLA USERS' as section;

-- 1. Ver estructura de la tabla users
SELECT '=== ESTRUCTURA TABLA USERS ===' as section;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Ver todos los usuarios existentes
SELECT '=== TODOS LOS USUARIOS EXISTENTES ===' as section;
SELECT 
    id,
    full_name,
    dni,
    email,
    password_hash,
    role,
    game_balance,
    referral_code,
    created_at
FROM users 
ORDER BY created_at DESC;

-- 3. Verificar si el admin existe
SELECT '=== VERIFICANDO USUARIO ADMIN ===' as section;
SELECT 
    id,
    full_name,
    dni,
    email,
    password_hash,
    role
FROM users 
WHERE role = 'admin';

-- 4. Probar verify_user con admin
SELECT '=== PROBANDO VERIFY_USER CON ADMIN ===' as section;
SELECT * FROM verify_user(
    'admin@rifaflash.com',
    'admin123'
);

-- 5. Probar verify_user con DNI
SELECT '=== PROBANDO VERIFY_USER CON DNI ===' as section;
SELECT * FROM verify_user(
    '00000000@rifaflash.com',
    'admin123'
);

-- 6. Verificar si hay usuarios recientes
SELECT '=== USUARIOS RECIENTES ===' as section;
SELECT 
    full_name,
    dni,
    email,
    role,
    created_at
FROM users 
WHERE created_at > NOW() - INTERVAL '1 day'
ORDER BY created_at DESC;

-- 7. Verificar códigos de referido
SELECT '=== CÓDIGOS DE REFERIDO ===' as section;
SELECT 
    full_name,
    dni,
    referral_code,
    role
FROM users 
WHERE referral_code IS NOT NULL
ORDER BY created_at DESC;

-- 8. Verificar tabla referrals
SELECT '=== TABLA REFERRALS ===' as section;
SELECT 
    r.id,
    r.referrer_id,
    r.referred_id,
    r.referral_code,
    r.reward_amount,
    r.status,
    r.created_at,
    u_referrer.full_name as referrer_name,
    u_referred.full_name as referred_name
FROM referrals r
LEFT JOIN users u_referrer ON r.referrer_id = u_referrer.id
LEFT JOIN users u_referred ON r.referred_id = u_referred.id
ORDER BY r.created_at DESC;

SELECT '=== DEBUG COMPLETO ===' as final_status;
SELECT 'Revisá estos resultados para identificar el problema de login' as msg1;
SELECT 'Verificá que los usuarios tengan email y password correctos' as msg2;
SELECT 'Probá las funciones verify_user con los datos mostrados' as final_msg;
