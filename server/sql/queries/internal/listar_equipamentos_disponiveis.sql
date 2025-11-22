-- Query to list equipment available for reservation
-- Filters only equipment that is reservable (EH_RESERVAVEL = 'S')
SELECT
    e.id_patrimonio,
    e.nome,
    i.nome AS local,
    e.eh_reservavel
FROM equipamento e
LEFT JOIN instalacao i ON e.id_instalacao_local = i.id_instalacao
WHERE e.eh_reservavel = 'S'
ORDER BY e.nome;
