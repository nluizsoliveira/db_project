-- Query to update a person
-- Parameters:
--   %(cpf)s - CPF
--   %(nome)s - New name
--   %(email)s - New email
--   %(celular)s - New phone (can be NULL)
CALL atualizar_pessoa(%(cpf)s, %(nome)s, %(email)s, %(celular)s);
