-- Query to reserve equipment
-- Parameters:
--   %(id_equipamento)s - Equipment ID (patrimony ID)
--   %(cpf_responsavel)s - CPF of the responsible internal user
--   %(data)s - Reservation date
--   %(hora_inicio)s - Start time
--   %(hora_fim)s - End time
CALL reservar_equipamento(%(id_equipamento)s, %(cpf_responsavel)s, %(data)s, %(hora_inicio)s, %(hora_fim)s);
