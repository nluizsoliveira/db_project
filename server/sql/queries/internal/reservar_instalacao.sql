-- Query to reserve an installation
-- Parameters:
--   %(id_instalacao)s - Installation ID
--   %(cpf_responsavel)s - CPF of the responsible internal user
--   %(data)s - Reservation date
--   %(hora_inicio)s - Start time
--   %(hora_fim)s - End time
CALL reservar_instalacao(%(id_instalacao)s, %(cpf_responsavel)s, %(data)s, %(hora_inicio)s, %(hora_fim)s);
