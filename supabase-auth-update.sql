-- ============================================
-- RIFAFASH - ACTUALIZACIÓN CON AUTENTICACIÓN
-- ============================================

-- Agregar columna de contraseña a users
ALTER TABLE users ADD COLUMN IF NOT EXISTS password TEXT;

-- Tabla de administradores
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insertar admin por defecto (usuario: admin, contraseña: admin123)
-- En producción, cambiar esta contraseña!
INSERT INTO admins (username, password) 
VALUES ('admin', 'admin123')
ON CONFLICT (username) DO NOTHING;

-- Actualizar tabla de pagos para mejor seguimiento
ALTER TABLE payments ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE payments ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS receipt_url TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES admins(id);

-- Políticas para admins
CREATE POLICY "Allow admin read" ON admins
  FOR SELECT USING (true);

-- Función para verificar login
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

-- Función para crear usuario con contraseña
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
  RETURNING id INTO new_user_id;
  
  RETURN new_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar login de usuario
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