-- Query to add a user as interno_usp
-- Parameters:
--   %(cpf)s - CPF of the person
--   %(nusp)s - NUSP number
--   %(categoria)s - Category (ALUNO, FUNCIONARIO, etc.)
-- Note: User must already exist in pessoa
INSERT INTO interno_usp (cpf_pessoa, nusp, categoria)
VALUES (%(cpf)s, %(nusp)s, %(categoria)s)
ON CONFLICT (cpf_pessoa) DO UPDATE
SET nusp = EXCLUDED.nusp,
    categoria = EXCLUDED.categoria;
