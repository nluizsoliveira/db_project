-- Query to remove a user as funcionario
-- Parameters:
--   %(cpf)s - CPF of the funcionario
-- Note: This will cascade delete atribuicoes and educador_fisico
DELETE FROM funcionario
WHERE cpf_interno = %(cpf)s;
