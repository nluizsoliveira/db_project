-- Query to update an employee
-- Parameters:
--   %(cpf)s - CPF
--   %(formacao)s - New education/formation
CALL atualizar_funcionario(%(cpf)s, %(formacao)s);
