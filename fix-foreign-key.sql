-- ============================================
-- CAMBIAR TIPO DE rooms.id A TEXT PARA COINCIDIR
-- ============================================

-- 1. Primero eliminar la clave foránea
ALTER TABLE pending_payments 
DROP CONSTRAINT IF EXISTS pending_payments_room_id_fkey;

-- 2. Cambiar el tipo de rooms.id a TEXT
ALTER TABLE rooms 
ALTER COLUMN id TYPE TEXT;

-- 3. Ahora sí cambiar el tipo de pending_payments.room_id a TEXT
ALTER TABLE pending_payments 
ALTER COLUMN room_id TYPE TEXT;

-- 4. Recrear la clave foránea (opcional, si querés mantenerla)
-- ALTER TABLE pending_payments 
-- ADD CONSTRAINT pending_payments_room_id_fkey 
-- FOREIGN KEY (room_id) REFERENCES rooms(id);

-- Verificar los cambios
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('rooms', 'pending_payments') 
AND column_name = 'id' OR column_name = 'room_id'
ORDER BY table_name, column_name;

SELECT '✅ Tipos de columnas corregidos' as status;
