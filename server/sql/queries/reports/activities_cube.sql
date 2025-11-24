SELECT
    e.numero_conselho AS council_number,
    COUNT(a.id_atividade) AS total_activities
FROM conduz_atividade ca
JOIN educador_fisico e ON ca.cpf_educador_fisico = e.cpf_funcionario
JOIN funcionario f ON f.cpf_interno = e.cpf_funcionario
JOIN interno_usp iu ON iu.cpf_pessoa = f.cpf_interno
JOIN atividade a ON a.id_atividade = ca.id_atividade
GROUP BY e.numero_conselho
ORDER BY council_number;
