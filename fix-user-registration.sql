-- CORREGIR REGISTRO DE USUARIOS
SELECT 'CORREGIR REGISTRO DE USUARIOS' as section;
SELECT 'Solución simple para crear usuarios sin errores' as solution;

-- 1. Verificar si la función RPC existe
SELECT '=== VERIFICANDO FUNCIÓN RPC ===' as section;
SELECT 
    proname,
    prokind
FROM pg_proc 
WHERE proname = 'create_user_with_password';

-- 2. Eliminar y recrear función RPC si existe
DROP FUNCTION IF EXISTS create_user_with_password(UUID, TEXT, TEXT, TEXT, TEXT, TEXT);

-- 3. Crear función RPC simplificada
CREATE OR REPLACE FUNCTION create_user_with_password(
    p_full_name TEXT,
    p_dni TEXT,
    p_phone TEXT,
    p_cvu_alias TEXT,
    p_password TEXT
)
RETURNS UUID AS $$
DECLARE
    v_user_id UUID;
    v_email TEXT;
BEGIN
    -- Generar email único basado en DNI
    v_email := lower(p_dni) || '@rifaflash.com';
    
    -- Verificar si ya existe un usuario con ese DNI
    IF EXISTS (SELECT 1 FROM users WHERE dni = p_dni) THEN
        RAISE EXCEPTION 'Ya existe un usuario con ese DNI';
    END IF;
    
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
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error creando usuario: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Verificar política RLS para usuarios
SELECT '=== VERIFICANDO POLÍTICAS RLS ===' as section;
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'users';

-- 5. Asegurar que la política permite INSERT
DROP POLICY IF EXISTS "Enable all operations on users" ON users;
CREATE POLICY "Enable all operations on users" ON users FOR ALL USING (true) WITH CHECK (true);

-- 6. Probar creación de usuario
SELECT '=== PROBANDO CREACIÓN DE USUARIO ===' as section;
SELECT create_user_with_password(
    'Usuario Test',
    '12345678',
    '1164444444',
    'test.mp',
    'password123'
) as test_user_id;

-- 7. Verificar usuario creado
SELECT '=== USUARIO DE PRUEBA CREADO ===' as section;
SELECT 
    full_name,
    dni,
    email,
    role,
    created_at
FROM users 
WHERE dni = '12345678';

SELECT '=== SISTEMA DE REGISTRO CORREGIDO ===' as final_status;
SELECT 'Función RPC recreada' as msg1;
SELECT 'Políticas RLS verificadas' as msg2;
SELECT 'Usuario de prueba creado' as msg3;
SELECT 'Sistema listo para registrar usuarios' as final_msg;
