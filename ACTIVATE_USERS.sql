-- ACTIVAR USUARIOS - VERIFICAR Y ACTIVAR SI ESTÁN DESACTIVADOS
SELECT 'ACTIVAR USUARIOS - VERIFICANDO ESTADO' as section;

-- 1. Verificar si hay campo de estado en users
SELECT '=== VERIFICANDO CAMPOS DE ESTADO ===' as section;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
AND (column_name LIKE '%status%' OR column_name LIKE '%active%' OR column_name LIKE '%enable%');

-- 2. Agregar campo is_active si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'is_active'
    ) THEN
        ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
        RAISE NOTICE 'Campo is_active agregado a users';
    END IF;
END $$;

-- 3. Verificar estado actual de usuarios
SELECT '=== ESTADO ACTUAL DE USUARIOS ===' as section;
SELECT 
    id,
    full_name,
    dni,
    email,
    role,
    is_active,
    created_at
FROM users 
ORDER BY created_at DESC;

-- 4. Activar todos los usuarios si están desactivados
SELECT '=== ACTIVANDO USUARIOS ===' as section;
UPDATE users 
SET is_active = TRUE 
WHERE is_active = FALSE OR is_active IS NULL;

-- 5. Verificar resultado de activación
SELECT '=== RESULTADO DE ACTIVACIÓN ===' as section;
SELECT 
    id,
    full_name,
    dni,
    email,
    role,
    is_active,
    created_at
FROM users 
ORDER BY created_at DESC;

-- 6. Probar login con admin activado
SELECT '=== PROBANDO LOGIN CON ADMIN ACTIVADO ===' as section;
SELECT * FROM verify_user(
    'admin@rifaflash.com',
    'admin123'
);

-- 7. Verificar política RLS para users
SELECT '=== VERIFICANDO POLÍTICAS RLS ===' as section;
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'users';

-- 8. Crear política RLS si no existe para permitir login
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'users'
        AND policyname = 'Enable all operations on users'
    ) THEN
        DROP POLICY IF EXISTS "Enable all operations on users" ON users;
        CREATE POLICY "Enable all operations on users" ON users FOR ALL USING (true);
        RAISE NOTICE 'Política RLS creada para users';
    END IF;
END $$;

SELECT '=== ACTIVACIÓN COMPLETA ===' as final_status;
SELECT 'Todos los usuarios activados' as msg1;
SELECT 'Políticas RLS verificadas' as msg2;
SELECT 'Probá login ahora' as final_msg;
