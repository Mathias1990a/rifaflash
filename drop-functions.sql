-- BORRAR TODAS LAS FUNCIONES PRIMERO
DROP FUNCTION IF EXISTS create_user_with_referral(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS verify_user(TEXT, TEXT);
DROP FUNCTION IF EXISTS verify_admin(TEXT, TEXT);
DROP FUNCTION IF EXISTS create_pending_payment(UUID, TEXT, INTEGER, INTEGER, TEXT, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS process_referral_bonus(UUID);
DROP FUNCTION IF EXISTS approve_payment(UUID, UUID);
DROP FUNCTION IF EXISTS reject_payment(UUID, UUID);
DROP FUNCTION IF EXISTS generate_referral_code(UUID);

SELECT '✅ Funciones borradas, ahora ejecutá el SQL completo' as status;
