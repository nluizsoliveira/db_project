SELECT
    COALESCE(e.numero_conselho, 'Todos') AS council_number,
    COALESCE(ge.nome_grupo, 'Todos') AS category,
    COUNT(a.id_atividade) AS total_activities
FROM conduz_atividade ca
JOIN educador_fisico e ON ca.cpf_educador_fisico = e.cpf_funcionario
JOIN funcionario f ON f.cpf_interno = e.cpf_funcionario
JOIN interno_usp iu ON iu.cpf_pessoa = f.cpf_interno
JOIN atividade a ON a.id_atividade = ca.id_atividade
LEFT JOIN atividade_grupo_extensao age ON age.id_atividade = a.id_atividade
LEFT JOIN grupo_extensao ge ON ge.nome_grupo = age.nome_grupo
GROUP BY CUBE (e.numero_conselho, ge.nome_grupo)
ORDER BY council_number, category;
