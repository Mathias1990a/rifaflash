# 🚀 RIFAFASH - DEPLOY EN VERCEL

## 📋 CHECKLIST PARA SUBIR A PRODUCCIÓN

### 1. EJECUTAR SQL EN SUPABASE

Andá a tu proyecto de Supabase y ejecutá este SQL en el Editor:

```sql
-- Agregar columna de contraseña a users
ALTER TABLE users ADD COLUMN IF NOT EXISTS password TEXT;

-- Tabla de administradores
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insertar admin por defecto
INSERT INTO admins (username, password) 
VALUES ('admin', 'TU_CONTRASEÑA_SEGURA')
ON CONFLICT (username) DO NOTHING;

-- Actualizar tabla de pagos
ALTER TABLE payments ADD COLUMN IF NOT EXISTS sender_name TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS sender_cbu TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS date TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES admins(id);

-- Función para verificar admin
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
```

**IMPORTANTE:** Cambiá `'TU_CONTRASEÑA_SEGURA'` por una contraseña real.

---

### 2. SUBIR A GITHUB

```bash
cd "C:\Users\mathi\OneDrive\Escritorio\RapiPremio"
git init
git add .
git commit -m "RifaFlash v1.0"
git branch -M main
git remote add origin https://github.com/tuusuario/rifaflash.git
git push -u origin main
```

---

### 3. DEPLOY EN VERCEL

1. Andá a https://vercel.com
2. Login con GitHub
3. Click en "Add New Project"
4. Importá el repositorio `rifaflash`
5. En "Environment Variables", agregá:
   - `VITE_SUPABASE_URL` = `https://ezmpjdljotvbaxwhfubs.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6bXBqZGxqb3R2YmF4d2hmdWJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzMzg4MjIsImV4cCI6MjA5MTkxNDgyMn0.aASBBOob7uy7narXrIbWch7gOFCIkxdT22z1JKECRBg`
6. Click en "Deploy"

---

### 4. ACCESOS

**Tu sitio web:** `https://rifaflash.vercel.app`

**Panel de Admin:**
- Click en el botón "Admin" (arriba a la derecha)
- Usuario: `admin`
- Contraseña: La que pusiste en el SQL

**Usuarios:**
- Se registran con DNI + contraseña
- Inician sesión con DNI + contraseña

---

### 5. FLUJO DE USO

1. **Usuario entra** a la web
2. **Se registra** (DNI, nombre, tel, CVU, contraseña)
3. **Selecciona sala** (Standard/Premium/VIP)
4. **Usa la ruleta** para elegir número
5. **Transfiere** al alias/CBU que configuraste
6. **Completa el formulario** con datos de la transferencia
7. **Vos recibís** notificación en Telegram
8. **Entrás al panel de admin** y verificás el pago
9. **Aprobás o rechazás** el pago
10. **El número se marca** como ocupado

---

### 6. CONFIGURACIÓN INICIAL

La primera vez que entres:
1. Click en "Admin"
2. Entrá con usuario `admin` y tu contraseña
3. En "Configuración", poné tu alias y CBU real
4. Guardá

---

## 🎉 LISTO PARA USAR

La app queda online 24/7. Cualquiera puede entrar desde cualquier dispositivo.

**¿Problemas?** Revisá:
- Que el SQL se ejecutó correctamente
- Que las variables de entorno están bien en Vercel
- Que el token de Telegram está configurado