-- Query to update user password
-- This query should be called via a function that handles password verification
-- For now, this is a placeholder - password updates should be done through
-- a stored procedure or function that verifies the old password first
-- Parameters:
--   %(cpf_pessoa)s - CPF of the user
--   %(new_password_hash)s - New hashed password (should be hashed in application or via function)
UPDATE usuario_senha
SET senha = %(new_password_hash)s,
    senha_hash = %(new_password_hash)s,
    data_ultima_alteracao = CURRENT_TIMESTAMP
WHERE cpf = %(cpf_pessoa)s;
