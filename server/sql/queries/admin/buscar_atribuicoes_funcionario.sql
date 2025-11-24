-- Query to get all atribuicoes for a funcionario
-- Parameters:
--   %(cpf)s - CPF of the funcionario
SELECT atribuicao
FROM funcionario_atribuicao
WHERE cpf_funcionario = %(cpf)s
ORDER BY atribuicao;
