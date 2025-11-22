-- Query to list participants of a specific activity
-- Parameters:
--   %(id_atividade)s - Activity ID
SELECT
    pa.cpf_participante,
    p.nome AS nome_participante,
    pa.data_inscricao
FROM participacao_atividade pa
JOIN pessoa p ON p.cpf = pa.cpf_participante
WHERE pa.id_atividade = %(id_atividade)s
ORDER BY pa.data_inscricao DESC;
