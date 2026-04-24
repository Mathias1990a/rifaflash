-- CORREGIR FUNCIONES DE COMPRA - PAGOS PENDIENTES
SELECT 'CORREGIR FUNCIONES DE COMPRA - PAGOS PENDIENTES' as section;

-- 1. Verificar si existe tabla pending_payments
SELECT '=== VERIFICANDO TABLA PENDING_PAYMENTS ===' as section;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'pending_payments' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Verificar y agregar campo updated_at a tabla numbers
SELECT '=== VERIFICANDO CAMPO UPDATED_AT EN TABLA NUMBERS ===' as section;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'numbers' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE numbers ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Campo updated_at agregado a numbers';
    END IF;
END $$;

-- 3. Crear tabla pending_payments si no existe
SELECT '=== CREANDO TABLA PENDING_PAYMENTS ===' as section;
CREATE TABLE IF NOT EXISTS pending_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    room_id UUID NOT NULL REFERENCES rooms(id),
    number INTEGER NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    sender_name TEXT NOT NULL,
    sender_cbu TEXT NOT NULL,
    transfer_date TIMESTAMP WITH TIME ZONE NOT NULL,
    notes TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Crear función create_pending_payment
SELECT '=== CREANDO CREATE_PENDING_PAYMENT ===' as section;
CREATE OR REPLACE FUNCTION create_pending_payment(
    p_user_id UUID,
    p_room_id UUID,
    p_number INTEGER,
    p_amount DECIMAL(10,2),
    p_sender_name TEXT,
    p_sender_cbu TEXT,
    p_transfer_date TIMESTAMP WITH TIME ZONE,
    p_notes TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_payment_id UUID;
BEGIN
    -- Crear pago pendiente
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
    
    -- Actualizar número a reservado
    UPDATE numbers 
    SET status = 'reserved',
        user_id = p_user_id,
        updated_at = NOW()
    WHERE room_id = p_room_id 
    AND number = p_number;
    
    RETURN v_payment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Crear función approve_payment
SELECT '=== CREANDO APPROVE_PAYMENT ===' as section;
CREATE OR REPLACE FUNCTION approve_payment(
    p_payment_id UUID,
    p_admin_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    v_payment RECORD;
BEGIN
    -- Obtener datos del pago
    SELECT * INTO v_payment
    FROM pending_payments 
    WHERE id = p_payment_id;
    
    IF v_payment IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Actualizar pago a aprobado
    UPDATE pending_payments 
    SET status = 'approved'
    WHERE id = p_payment_id;
    
    -- Actualizar número a ocupado
    UPDATE numbers 
    SET status = 'occupied',
        updated_at = NOW()
    WHERE room_id = v_payment.room_id 
    AND number = v_payment.number;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Crear función reject_payment
SELECT '=== CREANDO REJECT_PAYMENT ===' as section;
CREATE OR REPLACE FUNCTION reject_payment(
    p_payment_id UUID,
    p_admin_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    v_payment RECORD;
BEGIN
    -- Obtener datos del pago
    SELECT * INTO v_payment
    FROM pending_payments 
    WHERE id = p_payment_id;
    
    IF v_payment IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Actualizar pago a rechazado
    UPDATE pending_payments 
    SET status = 'rejected'
    WHERE id = p_payment_id;
    
    -- Liberar número
    UPDATE numbers 
    SET status = 'available',
        user_id = NULL,
        updated_at = NOW()
    WHERE room_id = v_payment.room_id 
    AND number = v_payment.number;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Verificar funciones creadas
SELECT '=== VERIFICANDO FUNCIONES CREADAS ===' as section;
SELECT 
    proname,
    prokind,
    'OK' as status
FROM pg_proc 
WHERE proname IN ('create_pending_payment', 'approve_payment', 'reject_payment')
ORDER BY proname;

-- 7. Probar create_pending_payment
SELECT '=== PROBANDO CREATE_PENDING_PAYMENT ===' as section;
SELECT create_pending_payment(
    '00000000-0000-0000-0000-000000000000',
    (SELECT id FROM rooms LIMIT 1),
    1,
    3000.00,
    'Test Sender',
    'test.cbu',
    '2024-01-01'::TIMESTAMP,
    'Test payment'
) as test_result;

-- 8. Configurar RLS para pending_payments
SELECT '=== CONFIGURANDO RLS PARA PENDING_PAYMENTS ===' as section;
ALTER TABLE pending_payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all operations on pending_payments" ON pending_payments;
CREATE POLICY "Enable all operations on pending_payments" ON pending_payments FOR ALL USING (true);

SELECT '=== FUNCIONES DE COMPRA COMPLETAS ===' as final_status;
SELECT 'Tabla pending_payments creada' as msg1;
SELECT 'Funciones de pago creadas' as msg2;
SELECT 'RLS configurado' as msg3;
SELECT 'Probá comprar números ahora' as final_msg;
