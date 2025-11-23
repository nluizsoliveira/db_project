SELECT
    r.id_reserva,
    i.nome AS installation_name,
    r.data_reserva,
    r.horario_inicio,
    r.horario_fim,
    p.nome AS responsible_name,
    ROW_NUMBER() OVER (
        PARTITION BY r.id_instalacao
        ORDER BY r.data_reserva, r.horario_inicio
    ) AS reservation_sequence
FROM reserva r
JOIN instalacao i ON i.id_instalacao = r.id_instalacao
JOIN interno_usp iu ON iu.cpf_pessoa = r.cpf_responsavel_interno
JOIN pessoa p ON p.cpf = iu.cpf_pessoa
ORDER BY i.nome, r.data_reserva, r.horario_inicio;
