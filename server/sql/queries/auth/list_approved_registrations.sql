-- Query to list all approved registration requests
-- Returns: List of approved registration requests with user information
SELECT
    sc.id_solicitacao,
    sc.cpf_pessoa,
    p.nome,
    p.email,
    sc.nusp,
    sc.data_solicitacao,
    sc.data_aprovacao,
    sc.cpf_admin_aprovador,
    admin_p.nome as nome_admin_aprovador
FROM solicitacao_cadastro sc
JOIN pessoa p ON sc.cpf_pessoa = p.cpf
LEFT JOIN pessoa admin_p ON sc.cpf_admin_aprovador = admin_p.cpf
WHERE sc.status = 'APROVADA'
ORDER BY sc.data_aprovacao DESC;


