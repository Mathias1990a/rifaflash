-- ============================================
-- CAMBIAR TIPO DE transfer_date A TEXT
-- ============================================

-- Cambiar el tipo de transfer_date a TEXT para aceptar el formato de fecha del input
ALTER TABLE pending_payments 
ALTER COLUMN transfer_date TYPE TEXT;

-- Verificar el cambio
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'pending_payments' AND column_name = 'transfer_date';

SELECT '✅ Tipo de transfer_date cambiado a TEXT' as status;
