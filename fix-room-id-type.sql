-- ============================================
-- VERIFICAR Y CORREGIR TIPO DE room_id EN pending_payments
-- ============================================

-- 1. Verificar el tipo actual de room_id en pending_payments
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'pending_payments' AND column_name = 'room_id';

-- 2. Si room_id es UUID, necesitamos modificar la función para hacer cast
-- o cambiar el tipo de la columna a TEXT

-- Opción A: Cambiar el tipo de la columna room_id a TEXT (más flexible)
ALTER TABLE pending_payments 
ALTER COLUMN room_id TYPE TEXT;

-- Opción B: Si preferís mantener UUID, la función necesitaría hacer cast
-- pero eso complica porque 'standard', 'premium', 'vip' no son UUID válidos

-- Verificar el cambio
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'pending_payments' AND column_name = 'room_id';

SELECT '✅ Tipo de room_id corregido a TEXT' as status;
