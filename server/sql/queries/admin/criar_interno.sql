-- Query to create a new internal user
-- Parameters:
--   %(cpf)s - CPF
--   %(nome)s - Name
--   %(email)s - Email
--   %(celular)s - Phone (can be NULL)
--   %(data_nascimento)s - Birth date (can be NULL)
--   %(nusp)s - NUSP
--   %(categoria)s - Category
CALL criar_interno(%(cpf)s, %(nome)s, %(email)s, %(celular)s, %(data_nascimento)s, %(nusp)s, %(categoria)s);
