-- ============================================
-- CONFIGURACIÓN INICIAL RIFAFASH
-- ============================================

-- 1. Crear tabla de admins si no existe
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Crear usuario ADMIN (cambiá 'TU_PASSWORD' por tu contraseña)
-- Recomendado: usar una contraseña segura de al menos 8 caracteres
INSERT INTO admins (username, password) 
VALUES ('admin', 'RifaFlash2024!')
ON CONFLICT (username) DO UPDATE 
SET password = EXCLUDED.password;

-- 3. Agregar columna password a users si no existe
ALTER TABLE users ADD COLUMN IF NOT EXISTS password TEXT;

-- 4. Actualizar tabla payments con campos necesarios
ALTER TABLE payments ADD COLUMN IF NOT EXISTS sender_name TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS sender_cbu TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS date TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE payments ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES admins(id);

-- 5. Función para verificar admin
CREATE OR REPLACE FUNCTION verify_admin(p_username TEXT, p_password TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admins 
    WHERE username = p_username 
    AND password = p_password
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Función para crear usuario con contraseña
CREATE OR REPLACE FUNCTION create_user_with_password(
  p_full_name TEXT,
  p_dni TEXT,
  p_phone TEXT,
  p_cvu_alias TEXT,
  p_password TEXT
)
RETURNS UUID AS $$
DECLARE
  new_user_id UUID;
BEGIN
  INSERT INTO users (full_name, dni, phone, cvu_alias, password)
  VALUES (p_full_name, p_dni, p_phone, p_cvu_alias, p_password)
  ON CONFLICT (dni) DO UPDATE 
  SET full_name = EXCLUDED.full_name,
      phone = EXCLUDED.phone,
      cvu_alias = EXCLUDED.cvu_alias,
      password = EXCLUDED.password
  RETURNING id INTO new_user_id;
  
  RETURN new_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Función para verificar login de usuario
CREATE OR REPLACE FUNCTION verify_user(p_dni TEXT, p_password TEXT)
RETURNS TABLE (id UUID, full_name TEXT, dni TEXT, phone TEXT, cvu_alias TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT u.id, u.full_name, u.dni, u.phone, u.cvu_alias
  FROM users u
  WHERE u.dni = p_dni 
  AND u.password = p_password;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- DATOS DE ACCESO
-- ============================================
-- Admin:    usuario = admin  |  contraseña = RifaFlash2024!
-- 
-- IMPORTANTE: Cambiá la contraseña después del primer login
-- ============================================