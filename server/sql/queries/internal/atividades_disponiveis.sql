-- Query to list available activities
-- Parameters:
--   %(weekday)s - Day of week (optional, can be NULL)
--   %(group_name)s - Extension group name (optional, can be NULL)
--   %(modality)s - Activity name/modality (optional, can be NULL)
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
ORDER BY dia_semana, horario_inicio;
