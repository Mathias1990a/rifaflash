-- ============================================
-- VERIFICAR ESTRUCTURA Y CORREGIR NÚMEROS
-- ============================================

-- 1. VERIFICAR ESTRUCTURA DE LA TABLA ROOMS
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'rooms';

-- 2. CORREGIR ADMIN
INSERT INTO admins (username, password) 
VALUES ('admin', 'RifaFlash2024!')
ON CONFLICT (username) DO UPDATE 
SET password = EXCLUDED.password;

-- 3. AGREGAR COLUMNA max_players SI NO EXISTE
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS max_players INTEGER;

-- 4. ACTUALIZAR max_players SEGÚN EL ID DE LA SALA
UPDATE rooms SET max_players = 50 WHERE id = 'standard';
UPDATE rooms SET max_players = 25 WHERE id = 'premium';
UPDATE rooms SET max_players = 15 WHERE id = 'vip';

-- 5. CORREGIR NÚMEROS - BORRAR EXTRAS
DELETE FROM numbers 
WHERE room_id = 'premium' AND number > 25;

DELETE FROM numbers 
WHERE room_id = 'vip' AND number > 15;

-- 6. VERIFICAR RESULTADO
SELECT r.id, r.name, r.max_players, COUNT(n.id) as numeros_actuales
FROM rooms r
LEFT JOIN numbers n ON n.room_id = r.id
GROUP BY r.id, r.name, r.max_players;

SELECT '✅ Todo corregido' as status;
