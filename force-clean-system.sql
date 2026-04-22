-- LIMPIAR SISTEMA COMPLETAMENTE Y EMPEZAR DESDE CERO
-- Script para eliminar todas las tablas y datos inconsistentes

-- 1. Eliminar todas las tablas existentes
SELECT '=== ELIMINANDO TABLAS EXISTENTES ===' as section;

DROP TABLE IF EXISTS pending_payments CASCADE;
DROP TABLE IF EXISTS numbers CASCADE;
DROP TABLE IF EXISTS rooms CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 2. Eliminar funciones RPC existentes
SELECT '=== ELIMINANDO FUNCIONES RPC ===' as section;

-- 3. Crear tablas limpias
SELECT '=== CREANDO TABLAS LIMPIAS ===' as section;

-- Tabla users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    dni TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    game_balance DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla rooms
CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL DEFAULT 1000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla numbers
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

-- Tabla pending_payments
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

-- 4. Crear funciones RPC limpias
SELECT '=== CREANDO FUNCIONES RPC ===' as section;

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
    -- Crear el pago pendiente
    INSERT INTO pending_payments (
        user_id,
        room_id,
        number,
        amount,
        sender_name,
        sender_cbu,
        transfer_date,
        notes,
        status
    ) VALUES (
        p_user_id,
        p_room_id,
        p_number,
        p_amount,
        p_sender_name,
        p_sender_cbu,
        p_transfer_date,
        p_notes,
        'pending'
    ) RETURNING id INTO v_payment_id;
    
    -- Reservar el número
    UPDATE numbers 
    SET 
        status = 'reserved',
        user_id = p_user_id,
        reserved_at = NOW()
    WHERE room_id = p_room_id 
    AND number = p_number 
    AND status = 'available';
    
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
    
    -- Actualizar estado del pago
    UPDATE pending_payments 
    SET status = 'approved', 
        verified_at = NOW(),
        verified_by = p_admin_id
    WHERE id = p_payment_id;
    
    -- Cambiar número de reserved a occupied
    UPDATE numbers 
    SET status = 'occupied',
        payment_confirmed = TRUE
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
    
    -- Actualizar estado del pago
    UPDATE pending_payments 
    SET status = 'rejected', 
        verified_at = NOW(),
        verified_by = p_admin_id
    WHERE id = p_payment_id;
    
    -- Liberar el número
    UPDATE numbers 
    SET status = 'available',
        user_id = NULL,
        reserved_at = NULL,
        payment_confirmed = FALSE
    WHERE room_id = v_room_id AND number = v_number AND status = 'reserved';
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Crear sala principal
SELECT '=== CREANDO SALA PRINCIPAL ===' as section;

INSERT INTO rooms (id, name, price, created_at)
SELECT 
    gen_random_uuid()::text::uuid,
    'Sala Principal',
    1000,
    NOW();

-- 6. Crear números para la sala
SELECT '=== CREANDO NÚMEROS PARA LA SALA ===' as section;

INSERT INTO numbers (room_id, number)
SELECT 
    r.id,
    n
FROM rooms r, generate_series(1, 100) n;

-- 7. Habilitar realtime
SELECT '=== HABILITANDO REALTIME ===' as section;

ALTER PUBLICATION supabase_realtime ADD TABLE pending_payments;

SELECT '=== SISTEMA LIMPIO Y LISTO ===' as final_status;
SELECT 'Todas las tablas eliminadas y recreadas desde cero' as message1;
SELECT 'Funciones RPC creadas correctamente' as message2;
SELECT 'Sala principal y números creados' as message3;
SELECT 'Sistema listo para funcionar desde cero' as final_message;
