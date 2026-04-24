-- ============================================
-- DIAGNÓSTICO COMPLETO - VERIFICAR NÚMEROS
-- ============================================

-- 1. VERIFICAR CUÁNTOS NÚMEROS TIENE CADA SALA
SELECT 'Números por sala:' as info;
SELECT room_id, COUNT(*) as total, 
       MIN(number) as min_num, 
       MAX(number) as max_num
FROM numbers 
GROUP BY room_id;

-- 2. VER DETALLE DE LA SALA PREMIUM
SELECT 'Detalle sala premium (debe tener 25):' as info;
SELECT number, status FROM numbers WHERE room_id = 'premium' ORDER BY number;

-- 3. VER DETALLE DE LA SALA VIP  
SELECT 'Detalle sala vip (debe tener 15):' as info;
SELECT number, status FROM numbers WHERE room_id = 'vip' ORDER BY number;

-- 4. BORRAR NÚMEROS EXTRAS DE PREMIUM (26-50)
SELECT 'Borrando números 26-50 de premium...' as info;
DELETE FROM numbers WHERE room_id = 'premium' AND number > 25;

-- 5. BORRAR NÚMEROS EXTRAS DE VIP (16-50)
SELECT 'Borrando números 16-50 de vip...' as info;
DELETE FROM numbers WHERE room_id = 'vip' AND number > 15;

-- 6. VERIFICAR RESULTADO FINAL
SELECT 'Resultado final:' as info;
SELECT room_id, COUNT(*) as total_numeros
FROM numbers 
GROUP BY room_id;
