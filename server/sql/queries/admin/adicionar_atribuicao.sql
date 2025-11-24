-- Query to add an atribuicao to a funcionario
-- Parameters:
--   %(cpf)s - CPF of the funcionario
--   %(atribuicao)s - Atribuicao name
INSERT INTO funcionario_atribuicao (cpf_funcionario, atribuicao)
VALUES (%(cpf)s, %(atribuicao)s)
ON CONFLICT (cpf_funcionario, atribuicao) DO NOTHING;
