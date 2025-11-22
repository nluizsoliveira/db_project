-- Query to update an installation
-- Parameters:
--   %(id)s - Installation ID
--   %(nome)s - New installation name
--   %(capacidade)s - New capacity
--   %(eh_reservavel)s - Whether it's reservable ('S' or 'N')
CALL atualizar_instalacao(%(id)s, %(nome)s, %(capacidade)s, %(eh_reservavel)s);
