SELECT
    e.id_patrimonio,
    e.nome,
    e.id_instalacao_local,
    i.nome AS nome_instalacao,
    e.preco_aquisicao,
    e.data_aquisicao,
    e.eh_reservavel
FROM equipamento e
LEFT JOIN instalacao i ON e.id_instalacao_local = i.id_instalacao
WHERE e.id_patrimonio = %(id_patrimonio)s;
