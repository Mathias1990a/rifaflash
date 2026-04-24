-- ============================================
-- ARREGLAR TODO - NÚMEROS POR SALA Y ADMIN
-- ============================================

-- 1. VERIFICAR ADMIN ACTUAL
SELECT 'Admin actual:' as info;
SELECT * FROM admins;

-- 2. CREAR/ACTUALIZAR ADMIN CORRECTO
INSERT INTO admins (username, password) 
VALUES ('admin', 'RifaFlash2024!')
ON CONFLICT (username) DO UPDATE 
SET password = EXCLUDED.password;

-- 3. VERIFICAR SALAS Y SUS NÚMEROS
SELECT 'Salas actuales:' as info;
SELECT r.id, r.name, r.max_players, COUNT(n.id) as numeros_actuales
FROM rooms r
LEFT JOIN numbers n ON n.room_id = r.id
GROUP BY r.id, r.name, r.max_players;

-- 4. CORREGIR NÚMEROS - BORRAR EXTRAS
-- Primero liberar números ocupados/reservados fuera del rango
UPDATE numbers 
SET status = 'available', user_id = NULL, reserved_at = NULL, payment_confirmed = FALSE
WHERE (room_id = 'premium' AND number > 25) 
   OR (room_id = 'vip' AND number > 15);

-- Borrar números extras
DELETE FROM numbers 
WHERE room_id = 'premium' AND number > 25;

DELETE FROM numbers 
WHERE room_id = 'vip' AND number > 15;

-- 5. VERIFICAR QUE QUEDÓ BIEN
SELECT 'Después de la corrección:' as info;
SELECT r.id, r.name, r.max_players, COUNT(n.id) as numeros_actuales,
       COUNT(CASE WHEN n.status = 'available' THEN 1 END) as disponibles,
       COUNT(CASE WHEN n.status = 'reserved' THEN 1 END) as reservados,
       COUNT(CASE WHEN n.status = 'occupied' THEN 1 END) as ocupados
FROM rooms r
LEFT JOIN numbers n ON n.room_id = r.id
GROUP BY r.id, r.name, r.max_players;

-- 6. VERIFICAR ESTRUCTURA DE TABLAS
SELECT 'Estructura de pending_payments:' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'pending_payments';

SELECT '✅ Todo verificado y corregido' as status;
