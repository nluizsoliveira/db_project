-- Query to update an event
-- Parameters:
--   %(id_evento)s - Event ID
--   %(nome)s - New event name
--   %(descricao)s - New event description
CALL atualizar_evento(%(id_evento)s, %(nome)s, %(descricao)s);
