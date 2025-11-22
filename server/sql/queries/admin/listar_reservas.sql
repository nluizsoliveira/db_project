SELECT
    r.id_reserva,
    r.data_reserva,
    r.horario_inicio,
    r.horario_fim,
    r.cpf_responsavel,
    p.nome AS nome_responsavel,
    i.id_instalacao,
    i.nome AS nome_instalacao
FROM reserva r
LEFT JOIN pessoa p ON r.cpf_responsavel = p.cpf
LEFT JOIN instalacao i ON r.id_instalacao = i.id_instalacao
ORDER BY r.data_reserva DESC, r.horario_inicio DESC;
