-- CORREGIR ERROR 400 - FUNCIÓN create_user_with_referral FALTANTE
-- El código está llamando a create_user_with_referral pero solo existe create_user_with_password

-- 1. Verificar qué funciones existen
SELECT '=== VERIFICANDO FUNCIONES EXISTENTES ===' as section;
SELECT 
    proname,
    prokind
FROM pg_proc 
WHERE proname LIKE 'create_user%';

-- 2. Eliminar y crear función create_user_with_referral (la que falta)
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

-- 3. Verificar que ahora exista
SELECT '=== FUNCIÓN CREADA ===' as section;
SELECT 
    proname,
    prokind
FROM pg_proc 
WHERE proname = 'create_user_with_referral';

-- 4. Probar la función
SELECT '=== PROBANDO FUNCIÓN ===' as section;
SELECT create_user_with_referral(
    'Usuario Test Referral',
    '11111111',
    '1167777777',
    'testref.mp',
    'password123',
    NULL
) as test_result;

-- 5. Verificar usuario creado
SELECT '=== USUARIO CREADO ===' as section;
SELECT 
    full_name,
    dni,
    email,
    role
FROM users 
WHERE dni = '11111111';

SELECT '=== FUNCIÓN create_user_with_referral CREADA ===' as final_status;
SELECT 'El error 400 debería estar solucionado' as msg1;
SELECT 'El registro de usuarios debería funcionar ahora' as msg2;
SELECT 'Probá registrarte en la web' as final_msg;
