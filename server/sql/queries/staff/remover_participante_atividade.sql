-- Query to remove a participant from an activity
-- Parameters:
--   %(cpf_participante)s - CPF of the participant
--   %(id_atividade)s - Activity ID
CALL remover_participante_atividade(%(cpf_participante)s, %(id_atividade)s);
