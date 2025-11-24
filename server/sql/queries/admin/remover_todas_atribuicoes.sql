-- Query to remove all atribuicoes from a funcionario
-- Parameters:
--   %(cpf)s - CPF of the funcionario
DELETE FROM funcionario_atribuicao
WHERE cpf_funcionario = %(cpf)s;
