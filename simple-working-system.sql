-- SISTEMA SIMPLE Y FUNCIONAL
SELECT 'SISTEMA SIMPLE Y FUNCIONAL' as section;
SELECT 'Sala Standard: 50 números a $3.000' as sala1;
SELECT 'Sala Premium: 25 números a $5.000' as sala2;
SELECT 'Sala VIP: 15 números a $10.000' as sala3;
SELECT 'Flujo: Compra -> Pago Pendiente -> Aprobación Admin' as flujo;

-- 1. Limpiar todo
SELECT '=== LIMPIANDO SISTEMA ===' as section;
DROP TABLE IF EXISTS pending_payments CASCADE;
DROP TABLE IF EXISTS numbers CASCADE;
DROP TABLE IF EXISTS rooms CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 2. Crear tablas simples
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    dni TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    game_balance DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    max_numbers INTEGER NOT NULL,
    prize DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE numbers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL,
    number INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'available',
    user_id UUID,
    reserved_at TIMESTAMP WITH TIME ZONE,
    payment_confirmed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    FOREIGN KEY (room_id) REFERENCES rooms(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(room_id, number)
);

CREATE TABLE pending_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    room_id UUID NOT NULL,
    number INTEGER NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    sender_name TEXT NOT NULL,
    sender_cbu TEXT NOT NULL,
    transfer_date DATE NOT NULL,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    verified_at TIMESTAMP WITH TIME ZONE,
    verified_by UUID,
    
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (room_id) REFERENCES rooms(id)
);

-- 3. Crear las 3 salas
INSERT INTO rooms (id, name, price, max_numbers, prize, created_at)
SELECT 
    uuid_generate_v4(),
    'Sala Standard',
    3000,
    50,
    100000,
    NOW()
UNION ALL
SELECT 
    uuid_generate_v4(),
    'Sala Premium',
    5000,
    25,
    100000,
    NOW()
UNION ALL
SELECT 
    uuid_generate_v4(),
    'Sala VIP',
    10000,
    15,
    100000,
    NOW();

-- 4. Crear números para cada sala
-- 50 números para Sala Standard
INSERT INTO numbers (room_id, number)
SELECT r.id, n
FROM rooms r, generate_series(1, 50) n
WHERE r.name = 'Sala Standard';

-- 25 números para Sala Premium  
INSERT INTO numbers (room_id, number)
SELECT r.id, n
FROM rooms r, generate_series(1, 25) n
WHERE r.name = 'Sala Premium';

-- 15 números para Sala VIP
INSERT INTO numbers (room_id, number)
SELECT r.id, n
FROM rooms r, generate_series(1, 15) n
WHERE r.name = 'Sala VIP';

-- 5. Funciones RPC simples
CREATE OR REPLACE FUNCTION create_user_with_password(
    p_full_name TEXT,
    p_dni TEXT,
    p_phone TEXT,
    p_cvu_alias TEXT,
    p_password TEXT
)
RETURNS UUID AS $$
DECLARE
    v_user_id UUID;
BEGIN
    -- Crear usuario con contraseña hasheada
    INSERT INTO users (
        full_name,
        dni,
        email,
        password_hash,
        role
    ) VALUES (
        p_full_name,
        p_dni,
        p_dni || '@rifaflash.com', -- Email temporal basado en DNI
        p_password, -- En producción deberías hashear esto
        'user'
    ) RETURNING id INTO v_user_id;
    
    RETURN v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION create_pending_payment(
    p_user_id UUID,
    p_room_id UUID,
    p_number INTEGER,
    p_amount DECIMAL(10,2),
    p_sender_name TEXT,
    p_sender_cbu TEXT,
    p_transfer_date DATE,
    p_notes TEXT
)
RETURNS UUID AS $$
DECLARE
    v_payment_id UUID;
BEGIN
    -- Crear pago pendiente
    INSERT INTO pending_payments (
        user_id, room_id, number, amount,
        sender_name, sender_cbu, transfer_date, notes, status
    ) VALUES (
        p_user_id, p_room_id, p_number, p_amount,
        p_sender_name, p_sender_cbu, p_transfer_date, p_notes, 'pending'
    ) RETURNING id INTO v_payment_id;
    
    -- Reservar número
    UPDATE numbers 
    SET status = 'reserved', user_id = p_user_id, reserved_at = NOW()
    WHERE room_id = p_room_id AND number = p_number AND status = 'available';
    
    RETURN v_payment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION approve_payment(
    p_payment_id UUID,
    p_admin_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    v_user_id UUID;
    v_room_id UUID;
    v_number INTEGER;
BEGIN
    -- Obtener datos del pago
    SELECT user_id, room_id, number 
    INTO v_user_id, v_room_id, v_number
    FROM pending_payments 
    WHERE id = p_payment_id AND status = 'pending';
    
    IF v_user_id IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Aprobar pago
    UPDATE pending_payments 
    SET status = 'approved', verified_at = NOW(), verified_by = p_admin_id
    WHERE id = p_payment_id;
    
    -- Confirmar número
    UPDATE numbers 
    SET status = 'occupied', payment_confirmed = TRUE
    WHERE room_id = v_room_id AND number = v_number AND status = 'reserved';
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION reject_payment(
    p_payment_id UUID,
    p_admin_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    v_room_id UUID;
    v_number INTEGER;
BEGIN
    -- Obtener datos del pago
    SELECT room_id, number 
    INTO v_room_id, v_number
    FROM pending_payments 
    WHERE id = p_payment_id AND status = 'pending';
    
    IF v_room_id IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Rechazar pago
    UPDATE pending_payments 
    SET status = 'rejected', verified_at = NOW(), verified_by = p_admin_id
    WHERE id = p_payment_id;
    
    -- Liberar número
    UPDATE numbers 
    SET status = 'available', user_id = NULL, reserved_at = NULL, payment_confirmed = FALSE
    WHERE room_id = v_room_id AND number = v_number AND status = 'reserved';
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Habilitar RLS con políticas simples
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all operations on rooms" ON rooms FOR ALL USING (true);
CREATE POLICY "Enable all operations on numbers" ON numbers FOR ALL USING (true);
CREATE POLICY "Enable all operations on users" ON users FOR ALL USING (true);
CREATE POLICY "Enable all operations on pending_payments" ON pending_payments FOR ALL USING (true);

-- 7. Habilitar realtime
ALTER PUBLICATION supabase_realtime ADD TABLE pending_payments;

-- 8. Verificar creación
SELECT '=== VERIFICANDO SALAS CREADAS ===' as section;
SELECT 
    name,
    price,
    max_numbers,
    prize,
    (SELECT COUNT(*) FROM numbers WHERE room_id = rooms.id) as numbers_created
FROM rooms
ORDER BY price;

SELECT '=== SISTEMA SIMPLE CREADO ===' as final_status;
SELECT 'Sala Standard: 50 números a $3.000 - Premio $100.000' as sala1;
SELECT 'Sala Premium: 25 números a $5.000 - Premio $100.000' as sala2;
SELECT 'Sala VIP: 15 números a $10.000 - Premio $100.000' as sala3;
SELECT 'Flujo: Compra -> Pago Pendiente -> Aprobación Admin' as flujo;
SELECT 'Sistema listo para funcionar' as final_msg;
