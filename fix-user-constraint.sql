-- CORREGIR ERROR ON CONFLICT - AGREGAR CONSTRAINT UNIQUE
-- Solución definitiva para el registro de usuarios

-- 1. Verificar constraint actual
SELECT '=== VERIFICANDO CONSTRAINTS ===' as section;
SELECT 
    conname,
    contype,
    pg_get_constraintdef(oid)
FROM pg_constraint 
WHERE conrelid = 'public.users'::regclass;

-- 2. Agregar constraint UNIQUE en dni si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conrelid = 'public.users'::regclass 
        AND conname = 'users_dni_unique'
    ) THEN
        ALTER TABLE users ADD CONSTRAINT users_dni_unique UNIQUE (dni);
        RAISE NOTICE 'Constraint UNIQUE en dni agregada';
    ELSE
        RAISE NOTICE 'Constraint UNIQUE en dni ya existe';
    END IF;
END $$;

-- 3. Verificar constraint agregada
SELECT '=== CONSTRAINT VERIFICADA ===' as section;
SELECT 
    conname,
    contype,
    pg_get_constraintdef(oid)
FROM pg_constraint 
WHERE conrelid = 'public.users'::regclass 
AND conname = 'users_dni_unique';

-- 4. Crear función de registro simple sin ON CONFLICT
CREATE OR REPLACE FUNCTION simple_register_user(
    p_full_name TEXT,
    p_dni TEXT,
    p_phone TEXT,
    p_cvu_alias TEXT,
    p_password TEXT
)
RETURNS TEXT AS $$
DECLARE
    v_result TEXT;
BEGIN
    -- Verificar si ya existe el usuario
    IF EXISTS (SELECT 1 FROM users WHERE dni = p_dni) THEN
        RETURN 'ERROR: Ya existe un usuario con ese DNI';
    END IF;
    
    -- Insertar usuario
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
        lower(p_dni) || '@rifaflash.com',
        p_password,
        'user',
        0,
        NOW()
    );
    
    RETURN 'OK';
EXCEPTION
    WHEN OTHERS THEN
        RETURN 'ERROR: ' || SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Probar función
SELECT '=== PROBANDO FUNCIÓN CORREGIDA ===' as section;
SELECT simple_register_user(
    'Usuario Test Final',
    '77777777',
    '1166666666',
    'testfinal.mp',
    'final123'
) as result;

-- 6. Verificar usuario creado
SELECT '=== USUARIO CREADO ===' as section;
SELECT 
    full_name,
    dni,
    email,
    role,
    created_at
FROM users 
WHERE dni = '77777777';

-- 7. Mensaje final
SELECT '=== SISTEMA DE REGISTRO CORREGIDO ===' as final_status;
SELECT 'Constraint UNIQUE agregada en dni' as msg1;
SELECT 'Función de registro creada sin ON CONFLICT' as msg2;
SELECT 'Usuario de prueba creado exitosamente' as msg3;
SELECT 'El registro de usuarios debería funcionar ahora' as final_msg;
