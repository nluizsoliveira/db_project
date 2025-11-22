-- Query to create a new equipment
-- Parameters:
--   %(id_patrimonio)s - Equipment patrimony ID
--   %(nome)s - Equipment name
--   %(id_instalacao)s - Installation ID (can be NULL)
--   %(preco)s - Purchase price (can be NULL)
--   %(data_aquisicao)s - Purchase date (can be NULL)
--   %(eh_reservavel)s - Whether it's reservable ('S' or 'N')
CALL criar_equipamento(%(id_patrimonio)s, %(nome)s, %(id_instalacao)s, %(preco)s, %(data_aquisicao)s, %(eh_reservavel)s);
