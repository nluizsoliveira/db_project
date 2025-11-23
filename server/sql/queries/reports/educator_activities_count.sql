SELECT
    p.nome AS educator_name,
    e.numero_conselho AS council_number,
    a.nome AS activity_name,
    a.data_inicio_periodo AS activity_start_date,
    COUNT(*) OVER (
        PARTITION BY ca.cpf_educador_fisico
        ORDER BY a.data_inicio_periodo, a.id_atividade
    ) AS cumulative_activities_count
FROM conduz_atividade ca
JOIN educador_fisico e ON e.cpf_funcionario = ca.cpf_educador_fisico
JOIN funcionario f ON f.cpf_interno = e.cpf_funcionario
JOIN interno_usp iu ON iu.cpf_pessoa = f.cpf_interno
JOIN pessoa p ON p.cpf = iu.cpf_pessoa
JOIN atividade a ON a.id_atividade = ca.id_atividade
ORDER BY p.nome, a.data_inicio_periodo, a.id_atividade;
