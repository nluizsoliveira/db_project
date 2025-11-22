SELECT
    id_instalacao,
    nome,
    tipo,
    capacidade,
    eh_reservavel
FROM instalacao
WHERE id_instalacao = %(id_instalacao)s;
