SELECT
    a.nome AS activity_name,
    COUNT(pa.cpf_participante) AS total_participants,
    DENSE_RANK() OVER (ORDER BY COUNT(pa.cpf_participante) DESC) AS dense_ranking
FROM atividade a
LEFT JOIN participacao_atividade pa ON pa.id_atividade = a.id_atividade
GROUP BY a.id_atividade, a.nome
ORDER BY dense_ranking, a.nome;
