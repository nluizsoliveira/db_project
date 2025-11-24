-- Query to check if a user account already exists in USUARIO_SENHA
-- Parameters:
--   %(email_or_cpf)s - Email or CPF to check
-- Returns: User account information if exists, NULL otherwise
SELECT
    us.cpf,
    us.login,
    us.tipo
FROM usuario_senha us
WHERE us.login = %(email_or_cpf)s OR us.cpf = %(email_or_cpf)s;
