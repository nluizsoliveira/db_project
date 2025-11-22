-- Query to create a new person
-- Parameters:
--   %(cpf)s - CPF
--   %(nome)s - Name
--   %(email)s - Email
--   %(celular)s - Phone (can be NULL)
--   %(data_nascimento)s - Birth date (can be NULL)
CALL criar_pessoa(%(cpf)s, %(nome)s, %(email)s, %(celular)s, %(data_nascimento)s);
