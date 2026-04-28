-- ============================================
-- ARREGLAR CANTIDAD DE NÚMEROS POR SALA
-- ============================================

-- 1. Borrar todos los números existentes
DELETE FROM numbers;

-- 2. Insertar números correctos para cada sala
-- Sala Standard: 50 números (1-50)
INSERT INTO numbers (room_id, number, status)
SELECT 'standard', generate_series(1, 50), 'available';

-- Sala Premium: 25 números (1-25)
INSERT INTO numbers (room_id, number, status)
SELECT 'premium', generate_series(1, 25), 'available';

-- Sala VIP: 15 números (1-15)
INSERT INTO numbers (room_id, number, status)
SELECT 'vip', generate_series(1, 15), 'available';

-- 3. Verificar
SELECT room_id, COUNT(*) as total_numeros 
FROM numbers 
GROUP BY room_id;
