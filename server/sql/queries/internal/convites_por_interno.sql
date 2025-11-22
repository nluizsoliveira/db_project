-- Query to list invites created by an internal user
-- Parameters:
--   %(cpf_convidante)s - CPF of the internal user who created the invites
SELECT
    ce.id_convite,
    ce.status,
    ce.nome_convidado,
    ce.documento_convidado,
    ce.email_convidado,
    ce.telefone_convidado,
    ce.id_atividade,
    ce.data_convite,
    ce.data_resposta,
    ce.observacoes,
    ce.token,
    a.nome AS atividade_nome,
    a.data_inicio_periodo AS atividade_data_inicio,
    a.data_fim_periodo AS atividade_data_fim,
    a.vagas_limite AS atividade_vagas_limite
FROM convite_externo ce
LEFT JOIN atividade a ON a.id_atividade = ce.id_atividade
WHERE ce.cpf_convidante = %(cpf_convidante)s
ORDER BY ce.data_convite DESC;
