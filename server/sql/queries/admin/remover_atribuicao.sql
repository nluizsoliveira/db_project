-- Query to remove an atribuicao from a funcionario
-- Parameters:
--   %(cpf)s - CPF of the funcionario
--   %(atribuicao)s - Atribuicao name
DELETE FROM funcionario_atribuicao
WHERE cpf_funcionario = %(cpf)s
AND atribuicao = %(atribuicao)s;
