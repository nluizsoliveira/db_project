-- Query to update NUSP of an interno
-- Parameters:
--   %(cpf)s - CPF
--   %(nusp)s - New NUSP
UPDATE interno_usp
SET nusp = %(nusp)s
WHERE cpf_pessoa = %(cpf)s;
