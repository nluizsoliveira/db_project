-- Query to update an internal user
-- Parameters:
--   %(cpf)s - CPF
--   %(categoria)s - New category
CALL atualizar_interno(%(cpf)s, %(categoria)s);
