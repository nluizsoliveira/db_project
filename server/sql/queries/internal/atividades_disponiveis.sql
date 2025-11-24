-- Query to list available activities
-- Parameters:
--   %(weekday)s - Day of week (optional, can be NULL)
--   %(group_name)s - Extension group name (optional, can be NULL)
--   %(modality)s - Activity name/modality (optional, can be NULL)
--   %(cpf_participante)s - CPF of the participant (optional, can be NULL)
WITH atividades_base AS (
    SELECT
        id_atividade,
        nome_atividade,
        grupo_extensao,
        dia_semana::text AS weekday,
        horario_inicio,
        horario_fim,
        vagas_ocupadas,
        vagas_limite
    FROM listar_atividades(%(weekday)s, %(group_name)s, %(modality)s)
)
SELECT
    ab.id_atividade,
    ab.nome_atividade,
    ab.grupo_extensao,
    ab.weekday,
    ab.horario_inicio,
    ab.horario_fim,
    ab.vagas_ocupadas,
    ab.vagas_limite,
    CASE
        WHEN %(cpf_participante)s IS NOT NULL AND EXISTS (
            SELECT 1
            FROM participacao_atividade pa
            WHERE pa.id_atividade = ab.id_atividade
            AND pa.cpf_participante = %(cpf_participante)s
        ) THEN true
        ELSE false
    END AS is_enrolled
FROM atividades_base ab
ORDER BY ab.weekday, ab.horario_inicio;
