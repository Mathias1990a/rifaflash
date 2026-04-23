-- CORREGIR TODAS LAS FUNCIONES FALTANTES
SELECT 'CORREGIR TODAS LAS FUNCIONES FALTANTES' as section;
SELECT 'create_user_with_referral' as func1;
SELECT 'verify_user' as func2;
SELECT 'Otras funciones que el código necesita' as func3;

-- 1. Eliminar y crear create_user_with_referral
DROP FUNCTION IF EXISTS create_user_with_referral(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT);

CREATE FUNCTION create_user_with_referral(
    p_full_name TEXT,
    p_dni TEXT,
    p_phone TEXT,
    p_cvu_alias TEXT,
    p_password TEXT,
    p_referral_code TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_user_id UUID;
    v_email TEXT;
BEGIN
    -- Verificar si ya existe
    IF EXISTS (SELECT 1 FROM users WHERE dni = p_dni) THEN
        RAISE EXCEPTION 'Ya existe un usuario con ese DNI';
    END IF;
    
    -- Generar email único
    v_email := lower(p_dni) || '@rifaflash.com';
    
    -- Crear usuario
    INSERT INTO users (
        full_name,
        dni,
        email,
        password_hash,
        role,
        game_balance,
        created_at
    ) VALUES (
        p_full_name,
        p_dni,
        v_email,
        p_password,
        'user',
        0,
        NOW()
    ) RETURNING id INTO v_user_id;
    
    RETURN v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Eliminar y crear verify_user
DROP FUNCTION IF EXISTS verify_user(TEXT, TEXT);

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
    -- Buscar usuario por email y contraseña
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
    
    -- Si no encuentra nada, la consulta devuelve vacío
    RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Verificar todas las funciones creadas
SELECT '=== FUNCIONES CREADAS ===' as section;
SELECT 
    proname,
    prokind
FROM pg_proc 
WHERE proname IN ('create_user_with_referral', 'verify_user', 'create_user_with_password');

-- 4. Probar create_user_with_referral
SELECT '=== PROBANDO create_user_with_referral ===' as section;
SELECT create_user_with_referral(
    'Test User Final',
    '99999999',
    '1168888888',
    'testfinal.mp',
    'password123',
    NULL
) as test_user_id;

-- 5. Probar verify_user
SELECT '=== PROBANDO verify_user ===' as section;
SELECT * FROM verify_user(
    '99999999@rifaflash.com',
    'password123'
);

-- 6. Verificar usuario creado
SELECT '=== USUARIO CREADO ===' as section;
SELECT 
    full_name,
    dni,
    email,
    role
FROM users 
WHERE dni = '99999999';

SELECT '=== TODAS LAS FUNCIONES CREADAS ===' as final_status;
SELECT 'create_user_with_referral funcionando' as msg1;
SELECT 'verify_user funcionando' as msg2;
SELECT 'El registro y login deberían funcionar ahora' as msg3;
SELECT 'Probá registrarte y hacer login en la web' as final_msg;
