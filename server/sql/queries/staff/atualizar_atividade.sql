-- Query to update an activity
-- Parameters:
--   %(id_atividade)s - Activity ID
--   %(novo_nome)s - New activity name
--   %(novas_vagas)s - New maximum vacancies
CALL atualizar_atividade(%(id_atividade)s, %(novo_nome)s, %(novas_vagas)s);
