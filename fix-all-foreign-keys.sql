-- ============================================
-- ELIMINAR TODAS LAS CLAVES FORÁNEAS Y CAMBIAR TIPOS
-- ============================================

-- 1. Eliminar todas las claves foráneas que usan room_id
ALTER TABLE pending_payments 
DROP CONSTRAINT IF EXISTS pending_payments_room_id_fkey;

ALTER TABLE numbers 
DROP CONSTRAINT IF EXISTS numbers_room_id_fkey;

ALTER TABLE winners 
DROP CONSTRAINT IF EXISTS winners_room_id_fkey;

-- 2. Cambiar el tipo de rooms.id a TEXT
ALTER TABLE rooms 
ALTER COLUMN id TYPE TEXT;

-- 3. Cambiar el tipo de todas las columnas room_id a TEXT
ALTER TABLE numbers 
ALTER COLUMN room_id TYPE TEXT;

ALTER TABLE pending_payments 
ALTER COLUMN room_id TYPE TEXT;

ALTER TABLE winners 
ALTER COLUMN room_id TYPE TEXT;

-- 4. Verificar los cambios
SELECT 
  table_name, 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name IN ('rooms', 'numbers', 'pending_payments', 'winners') 
AND (column_name = 'id' OR column_name = 'room_id')
ORDER BY table_name, column_name;

SELECT '✅ Todas las columnas room_id cambiadas a TEXT' as status;
