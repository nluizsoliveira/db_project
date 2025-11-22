-- Query to create a new installation
-- Parameters:
--   %(nome)s - Installation name
--   %(tipo)s - Installation type
--   %(capacidade)s - Capacity
--   %(eh_reservavel)s - Whether it's reservable ('S' or 'N')
CALL criar_instalacao(%(nome)s, %(tipo)s, %(capacidade)s, %(eh_reservavel)s);
