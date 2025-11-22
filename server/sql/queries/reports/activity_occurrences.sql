-- Listando as ocorrências de atividade
SELECT
    a.nome AS atividade,
    i.nome AS local,
    i.tipo AS tipo_local,
    o.dia_semana,
    o.horario_inicio,
    o.horario_fim,
    p.nome AS educador_responsavel
FROM atividade a
INNER JOIN ocorrencia_semanal o ON a.id_atividade = o.id_atividade
INNER JOIN instalacao i ON o.id_instalacao = i.id_instalacao
INNER JOIN conduz_atividade ca ON a.id_atividade = ca.id_atividade
INNER JOIN educador_fisico ef ON ca.cpf_educador_fisico = ef.cpf_funcionario
INNER JOIN pessoa p ON ef.cpf_funcionario = p.cpf
ORDER BY o.dia_semana, o.horario_inicio;
