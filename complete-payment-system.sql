-- SISTEMA COMPLETO DE PAGOS DESDE CERO
-- Crear todas las tablas y funciones necesarias

-- 1. Crear tabla de salas/rooms si no existe
CREATE TABLE IF NOT EXISTS rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL DEFAULT 1000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Crear tabla de pagos pendientes si no existe
CREATE TABLE IF NOT EXISTS pending_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- 3. Crear tabla de números si no existe
CREATE TABLE IF NOT EXISTS numbers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- 4. Función RPC para crear pago pendiente
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

-- 5. Función RPC para aprobar pago
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

-- 6. Función RPC para rechazar pago
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

-- 7. Crear sala de prueba si no existe
INSERT INTO rooms (name, price)
SELECT 'Sala Principal', 1000
WHERE NOT EXISTS (SELECT 1 FROM rooms LIMIT 1);

-- 8. Crear números para la sala si no existen
INSERT INTO numbers (room_id, number)
SELECT r.id, n
FROM rooms r, generate_series(1, 100) n
WHERE NOT EXISTS (
    SELECT 1 FROM numbers 
    WHERE room_id = r.id
);

-- 9. Habilitar Realtime para pagos si no está habilitado
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'pending_payments'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE pending_payments;
    END IF;
END $$;

SELECT 'SISTEMA DE PAGOS COMPLETO CREADO EXITOSAMENTE' as status;
