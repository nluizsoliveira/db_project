SELECT
    p.cpf,
    p.nome,
    p.email,
    p.celular,
    p.data_nascimento,
    CASE
        WHEN i.cpf_pessoa IS NOT NULL THEN 'interno'
        WHEN EXISTS (SELECT 1 FROM externo_usp e WHERE e.cpf_pessoa = p.cpf) THEN 'externo'
        ELSE 'pessoa'
    END AS tipo_usuario,
    i.nusp,
    i.categoria,
    f.formacao,
    ef.numero_conselho
FROM pessoa p
LEFT JOIN interno_usp i ON p.cpf = i.cpf_pessoa
LEFT JOIN funcionario f ON p.cpf = f.cpf_interno
LEFT JOIN educador_fisico ef ON p.cpf = ef.cpf_funcionario
ORDER BY p.nome;
