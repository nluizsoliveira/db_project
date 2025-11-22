-- Query to update an equipment
-- Parameters:
--   %(id_patrimonio)s - Equipment patrimony ID
--   %(nome)s - New equipment name
--   %(id_instalacao)s - New installation ID (can be NULL)
--   %(eh_reservavel)s - Whether it's reservable ('S' or 'N')
CALL atualizar_equipamento(%(id_patrimonio)s, %(nome)s, %(id_instalacao)s, %(eh_reservavel)s);
