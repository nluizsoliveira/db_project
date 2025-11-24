-- Query to remove a funcionario as educador_fisico
-- Parameters:
--   %(cpf)s - CPF of the educador_fisico
DELETE FROM educador_fisico
WHERE cpf_funcionario = %(cpf)s;
