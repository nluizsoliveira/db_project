-- Query to list all rejected registration requests
-- Returns: List of rejected registration requests with user information
SELECT
    sc.id_solicitacao,
    sc.cpf_pessoa,
    p.nome,
    p.email,
    sc.nusp,
    sc.data_solicitacao,
    sc.data_aprovacao as data_rejeicao,
    sc.cpf_admin_aprovador,
    admin_p.nome as nome_admin_aprovador,
    sc.observacoes as motivo_rejeicao
FROM solicitacao_cadastro sc
JOIN pessoa p ON sc.cpf_pessoa = p.cpf
LEFT JOIN pessoa admin_p ON sc.cpf_admin_aprovador = admin_p.cpf
WHERE sc.status = 'REJEITADA'
ORDER BY sc.data_aprovacao DESC;
