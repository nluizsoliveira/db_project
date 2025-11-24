-- Query to add a user as interno_usp
-- Parameters:
--   %(cpf)s - CPF of the person
--   %(nusp)s - NUSP number
-- Note: User must already exist in pessoa
INSERT INTO interno_usp (cpf_pessoa, nusp)
VALUES (%(cpf)s, %(nusp)s)
ON CONFLICT (cpf_pessoa) DO UPDATE
SET nusp = EXCLUDED.nusp;
