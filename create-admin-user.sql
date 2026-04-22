-- CREAR USUARIO ADMINISTRADOR
-- Script para crear el usuario admin del sistema

-- Insertar usuario admin
INSERT INTO users (
    id,
    full_name,
    dni,
    email,
    password_hash,
    role,
    game_balance,
    created_at
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    'Administrador',
    '00000000',
    'admin@rifaflash.com',
    'admin123',
    'admin',
    0,
    NOW()
);

-- Verificar creación
SELECT '=== USUARIO ADMIN CREADO ===' as section;
SELECT 
    full_name,
    dni,
    email,
    role,
    created_at
FROM users 
WHERE role = 'admin';

SELECT '=== USUARIO ADMIN LISTO ===' as final_status;
SELECT 'Email: admin@rifaflash.com' as email;
SELECT 'Contraseña: admin123' as password;
SELECT 'Rol: admin' as rol;
SELECT 'Podés iniciar sesión con estas credenciales' as mensaje;
