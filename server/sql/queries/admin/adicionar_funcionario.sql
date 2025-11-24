-- Query to add a user as funcionario
-- Parameters:
--   %(cpf)s - CPF of the person
--   %(formacao)s - Formacao (education/formation)
-- Note: User must already exist in interno_usp
INSERT INTO funcionario (cpf_interno, formacao)
VALUES (%(cpf)s, %(formacao)s)
ON CONFLICT (cpf_interno) DO UPDATE
SET formacao = EXCLUDED.formacao;
