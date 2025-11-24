-- Query to add a funcionario as educador_fisico
-- Parameters:
--   %(cpf)s - CPF of the funcionario
--   %(numero_conselho)s - Numero do conselho
-- Note: User must already exist in funcionario
INSERT INTO educador_fisico (cpf_funcionario, numero_conselho)
VALUES (%(cpf)s, %(numero_conselho)s)
ON CONFLICT (cpf_funcionario) DO UPDATE
SET numero_conselho = EXCLUDED.numero_conselho;
