-- Query to enroll participant in activity
-- Parameters:
--   %(cpf_participante)s - CPF of the participant
--   %(id_atividade)s - Activity ID
CALL inscrever_participante_atividade(%(cpf_participante)s, %(id_atividade)s);
