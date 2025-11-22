-- Query to list all extension groups with responsible person information
-- Returns:
--   nome_grupo - name of the extension group
--   descricao - description of the group
--   cpf_responsavel_interno - CPF of the responsible person
--   nome_responsavel - name of the responsible person
SELECT
    ge.NOME_GRUPO as nome_grupo,
    ge.DESCRICAO as descricao,
    ge.CPF_RESPONSAVEL_INTERNO as cpf_responsavel_interno,
    p.NOME as nome_responsavel
FROM GRUPO_EXTENSAO ge
JOIN INTERNO_USP iu ON ge.CPF_RESPONSAVEL_INTERNO = iu.CPF_PESSOA
JOIN PESSOA p ON iu.CPF_PESSOA = p.CPF
ORDER BY ge.NOME_GRUPO;
