-- ============================================
-- VERIFICAR Y CREAR USUARIO ADMIN
-- ============================================

-- Verificar si existe el admin
SELECT * FROM admins;

-- Si no existe o querés cambiar la contraseña, ejecutar esto:
-- Borrar admin existente (si hay)
DELETE FROM admins WHERE username = 'admin';

-- Crear nuevo admin con contraseña correcta
INSERT INTO admins (username, password) 
VALUES ('admin', 'RifaFlash2024!')
ON CONFLICT (username) DO UPDATE 
SET password = EXCLUDED.password;

-- Verificar que se creó correctamente
SELECT username, password FROM admins WHERE username = 'admin';
