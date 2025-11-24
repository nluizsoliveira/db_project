-- Query to remove a user as interno_usp
-- Parameters:
--   %(cpf)s - CPF of the interno
-- Note: This will cascade delete funcionario, educador_fisico, etc.
DELETE FROM interno_usp
WHERE cpf_pessoa = %(cpf)s;
