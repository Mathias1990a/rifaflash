-- ============================================
-- CORREGIR CANTIDAD DE NÚMEROS POR SALA
-- ============================================

-- 1. Verificar cuántos números tiene cada sala
SELECT room_id, COUNT(*) as total_numeros, 
       COUNT(CASE WHEN status = 'available' THEN 1 END) as disponibles,
       COUNT(CASE WHEN status = 'occupied' THEN 1 END) as ocupados,
       COUNT(CASE WHEN status = 'reserved' THEN 1 END) as reservados
FROM numbers 
GROUP BY room_id;

-- 2. Borrar números extras de la sala premium (debe tener 25, no 50)
-- Primero verificamos cuáles están ocupados/reservados
SELECT number, status FROM numbers WHERE room_id = 'premium' ORDER BY number;

-- Si hay números ocupados/reservados después del 25, necesitamos manejar eso
-- Por ahora, solo borramos los disponibles después del 25
DELETE FROM numbers 
WHERE room_id = 'premium' 
AND number > 25 
AND status = 'available';

-- 3. Borrar números extras de la sala vip (debe tener 15, no 50)
DELETE FROM numbers 
WHERE room_id = 'vip' 
AND number > 15 
AND status = 'available';

-- 4. Actualizar el max_players en la tabla rooms
UPDATE rooms SET max_players = 50 WHERE id = 'standard';
UPDATE rooms SET max_players = 25 WHERE id = 'premium';
UPDATE rooms SET max_players = 15 WHERE id = 'vip';

-- 5. Verificar que quedó correcto
SELECT r.id, r.name, r.max_players, COUNT(n.id) as numeros_actuales
FROM rooms r
LEFT JOIN numbers n ON n.room_id = r.id
GROUP BY r.id, r.name, r.max_players;

-- ============================================
-- SI LA SALA PREMIUM O VIP TIENE NÚMEROS OCUPADOS/RESERVADOS
-- DESPUÉS DEL LÍMITE, EJECUTAR ESTO CON CUIDADO:
-- ============================================

-- Solo si es necesario: resetear números ocupados/reservados después del límite
-- UPDATE numbers SET status = 'available', user_id = NULL, reserved_at = NULL
-- WHERE room_id = 'premium' AND number > 25;

-- UPDATE numbers SET status = 'available', user_id = NULL, reserved_at = NULL
-- WHERE room_id = 'vip' AND number > 15;

SELECT '✅ Números corregidos por sala' as status;
