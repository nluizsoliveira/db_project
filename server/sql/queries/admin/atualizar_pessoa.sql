-- Query to update a person
-- Parameters:
--   %(cpf)s - CPF
--   %(nome)s - New name
--   %(email)s - New email
--   %(celular)s - New phone (can be NULL)
UPDATE pessoa
SET nome = %(nome)s,
    email = %(email)s,
    celular = %(celular)s
WHERE cpf = %(cpf)s;
