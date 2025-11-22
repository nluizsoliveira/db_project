-- Query to create a new employee
-- Parameters:
--   %(cpf)s - CPF
--   %(nome)s - Name
--   %(email)s - Email
--   %(celular)s - Phone (can be NULL)
--   %(data_nascimento)s - Birth date (can be NULL)
--   %(nusp)s - NUSP
--   %(formacao)s - Education/Formation
CALL criar_funcionario(%(cpf)s, %(nome)s, %(email)s, %(celular)s, %(data_nascimento)s, %(nusp)s, %(formacao)s);
