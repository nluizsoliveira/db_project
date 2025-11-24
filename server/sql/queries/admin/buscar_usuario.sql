SELECT
    p.cpf,
    p.nome,
    p.email,
    p.celular,
    p.data_nascimento,
    CASE
        WHEN i.cpf_pessoa IS NOT NULL THEN 'interno'
        ELSE 'externo'
    END AS tipo_usuario,
    i.nusp,
    f.formacao,
    ef.numero_conselho,
    CASE WHEN f.cpf_interno IS NOT NULL THEN true ELSE false END AS is_funcionario,
    CASE WHEN ef.cpf_funcionario IS NOT NULL THEN true ELSE false END AS is_educador_fisico,
    CASE WHEN EXISTS (
        SELECT 1 FROM funcionario_atribuicao fa
        WHERE fa.cpf_funcionario = p.cpf AND fa.atribuicao = 'Administrador'
    ) THEN true ELSE false END AS is_admin,
    COALESCE(
        ARRAY_AGG(DISTINCT fa.atribuicao) FILTER (WHERE fa.atribuicao IS NOT NULL),
        ARRAY[]::VARCHAR[]
    ) AS atribuicoes
FROM pessoa p
LEFT JOIN interno_usp i ON p.cpf = i.cpf_pessoa
LEFT JOIN funcionario f ON p.cpf = f.cpf_interno
LEFT JOIN educador_fisico ef ON p.cpf = ef.cpf_funcionario
LEFT JOIN funcionario_atribuicao fa ON p.cpf = fa.cpf_funcionario
WHERE p.cpf = %(cpf)s
GROUP BY p.cpf, p.nome, p.email, p.celular, p.data_nascimento, i.cpf_pessoa, i.nusp, f.formacao, f.cpf_interno, ef.numero_conselho, ef.cpf_funcionario;
