-- Query to create a new activity
-- Parameters:
--   %(nome)s - Activity name
--   %(vagas)s - Maximum vacancies
--   %(data_inicio)s - Start date
--   %(data_fim)s - End date
CALL criar_atividade(%(nome)s, %(vagas)s, %(data_inicio)s, %(data_fim)s);
