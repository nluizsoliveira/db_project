SELECT
    id_instalacao,
    nome,
    tipo,
    capacidade,
    eh_reservavel
FROM listar_instalacoes()
ORDER BY nome;
