SELECT
    e.id_evento,
    e.nome,
    e.descricao,
    e.id_reserva,
    r.data_reserva,
    r.horario_inicio,
    r.horario_fim,
    i.nome AS nome_instalacao
FROM evento e
LEFT JOIN reserva r ON e.id_reserva = r.id_reserva
LEFT JOIN instalacao i ON r.id_instalacao = i.id_instalacao
WHERE e.id_evento = %(id_evento)s;
