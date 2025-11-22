-- Query to get details of a specific activity
-- Parameters:
--   %(id_atividade)s - Activity ID
SELECT
    id_atividade,
    nome,
    vagas_limite,
    data_inicio_periodo,
    data_fim_periodo
FROM atividade
WHERE id_atividade = %(id_atividade)s;
